import uuid
from decimal import Decimal
from django.conf import settings
from django.db import IntegrityError, models, transaction
from django.http import Http404
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import SellerProfile, User
from catalog.models import Product
from catalog.services import stock_state
from common.errors import (
    APIError,
    ALREADY_CANCELLED,
    CART_HAS_ISSUES,
    EMPTY_CART,
    INSUFFICIENT_STOCK,
    INVALID_QUANTITY,
    INVALID_TRANSITION,
    MISSING_IDEMPOTENCY_KEY,
    MULTI_SELLER_CART,
    PRODUCT_NOT_PURCHASABLE,
)
from common.permissions import IsAdmin, IsCustomer, IsSeller
from orders.models import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    OrderStatusHistory,
)
from orders.serializers import (
    CartItemAddSerializer,
    CartItemUpdateSerializer,
    CheckoutSerializer,
    CustomerOrderDetailSerializer,
    CustomerOrderListSerializer,
    SellerOrderDetailSerializer,
    SellerOrderListSerializer,
)
from orders.services import (
    clamp_available,
    generate_order_number,
    restore_stock,
    revalidate_cart,
)
from orders.state import assert_transition


def render_cart_response(cart, context=None):
    if not cart or not cart.items.exists():
        return {
            'id': cart.id if cart else None,
            'seller': None,
            'items': [],
            'subtotal': '0.00',
            'total': '0.00',
        }

    annotated_items, _ = revalidate_cart(cart)
    first_item = cart.items.select_related('product__seller').first()
    seller = first_item.product.seller if first_item else None

    rendered_items = []
    subtotal = Decimal('0.00')

    for ann in annotated_items:
        item = ann['cart_item']
        prod = ann['product']
        current_unit_price = prod.price if prod else item.unit_price_at_add
        line_total = (current_unit_price * item.quantity).quantize(Decimal('0.01'))
        subtotal += line_total

        rendered_items.append({
            'id': item.id,
            'product_id': prod.id if prod else item.product_id,
            'name': prod.name if prod else '',
            'unit_price': str(current_unit_price),
            'quantity': item.quantity,
            'line_total': str(line_total),
            'stock_state': stock_state(prod.stock_quantity) if prod else 'out_of_stock',
            'issues': [
                {
                    'code': iss['code'],
                    'message': iss['message'],
                    **({'details': iss['details']} if 'details' in iss else {}),
                }
                for iss in ann['issues']
            ],
        })

    subtotal_str = str(subtotal.quantize(Decimal('0.01')))
    return {
        'id': cart.id,
        'seller': {
            'id': seller.id,
            'business_name': seller.business_name,
        } if seller else None,
        'items': rendered_items,
        'subtotal': subtotal_str,
        'total': subtotal_str,
    }


class CartView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        cart = Cart.objects.filter(customer=request.user).first()
        return Response(render_cart_response(cart), status=status.HTTP_200_OK)

    def delete(self, request):
        cart = Cart.objects.filter(customer=request.user).first()
        if cart:
            cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = CartItemAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        if quantity <= 0:
            raise APIError(code=INVALID_QUANTITY, message='Quantity must be at least 1.', status_code=400)

        try:
            product = Product.objects.select_related('seller').get(id=product_id)
        except Product.DoesNotExist:
            raise APIError(code=PRODUCT_NOT_PURCHASABLE, message='Product does not exist.', status_code=400)

        if product.status != Product.Status.PUBLISHED or product.seller.status != SellerProfile.Status.ACTIVE:
            raise APIError(code=PRODUCT_NOT_PURCHASABLE, message='Product is not available for purchase.', status_code=400)

        cart, _ = Cart.objects.get_or_create(customer=request.user)

        # Single seller constraint
        existing_item = cart.items.select_related('product__seller').first()
        if existing_item and existing_item.product.seller_id != product.seller_id:
            current_seller = existing_item.product.seller
            raise APIError(
                code=MULTI_SELLER_CART,
                message='Cart can only contain items from a single seller.',
                details={
                    'current_seller': {
                        'id': current_seller.id,
                        'business_name': current_seller.business_name,
                    }
                },
                status_code=409,
            )

        if quantity > product.stock_quantity:
            details = {}
            clamped = clamp_available(product.stock_quantity)
            if clamped is not None:
                details['available'] = clamped
            raise APIError(
                code=INSUFFICIENT_STOCK,
                message=f"Only {product.stock_quantity} units available.",
                details=details,
                status_code=400,
            )

        CartItem.objects.update_or_create(
            cart=cart,
            product=product,
            defaults={
                'quantity': quantity,
                'unit_price_at_add': product.price,
            },
        )

        return Response(render_cart_response(cart), status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsCustomer]

    def patch(self, request, pk):
        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']

        if quantity <= 0:
            raise APIError(code=INVALID_QUANTITY, message='Quantity must be at least 1.', status_code=400)

        try:
            item = CartItem.objects.select_related('cart', 'product').get(
                id=pk,
                cart__customer=request.user,
            )
        except CartItem.DoesNotExist:
            raise Http404

        product = item.product
        if quantity > product.stock_quantity:
            details = {}
            clamped = clamp_available(product.stock_quantity)
            if clamped is not None:
                details['available'] = clamped
            raise APIError(
                code=INSUFFICIENT_STOCK,
                message=f"Only {product.stock_quantity} units available.",
                details=details,
                status_code=400,
            )

        item.quantity = quantity
        item.unit_price_at_add = product.price
        item.save(update_fields=['quantity', 'unit_price_at_add'])

        return Response(render_cart_response(item.cart), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(
                id=pk,
                cart__customer=request.user,
            )
        except CartItem.DoesNotExist:
            raise Http404

        cart = item.cart
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        idempotency_raw = request.headers.get('Idempotency-Key')
        if not idempotency_raw:
            raise APIError(
                code=MISSING_IDEMPOTENCY_KEY,
                message='Missing Idempotency-Key header.',
                status_code=400,
            )
        try:
            idempotency_key = uuid.UUID(idempotency_raw)
        except ValueError:
            raise APIError(
                code=MISSING_IDEMPOTENCY_KEY,
                message='Invalid Idempotency-Key UUID format.',
                status_code=400,
            )

        # Idempotent re-read
        existing_order = Order.objects.filter(
            customer=request.user,
            idempotency_key=idempotency_key,
        ).first()
        if existing_order:
            serializer = CustomerOrderDetailSerializer(existing_order)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        price_acks = {
            ack['product_id']: ack['new_price']
            for ack in data.get('price_acknowledgements', [])
        }

        try:
            with transaction.atomic():
                cart = Cart.objects.filter(customer=request.user).first()
                if not cart or not cart.items.exists():
                    raise APIError(code=EMPTY_CART, message='Cart is empty.', status_code=400)

                cart_items = list(cart.items.select_related('product').all())
                product_ids = sorted([item.product_id for item in cart_items])

                # Ordered select_for_update to avoid deadlocks (BR-04)
                locked_products = {
                    p.id: p
                    for p in Product.objects.select_for_update()
                    .filter(id__in=product_ids)
                    .order_by('id')
                }

                # Revalidate under lock
                for item in cart_items:
                    prod = locked_products.get(item.product_id)
                    if (
                        not prod
                        or prod.status != Product.Status.PUBLISHED
                        or prod.seller.status != SellerProfile.Status.ACTIVE
                    ):
                        raise APIError(
                            code=CART_HAS_ISSUES,
                            message='Cart contains unavailable products.',
                            details={'issue': 'product_unavailable', 'product_id': item.product_id},
                            status_code=409,
                        )

                    if item.quantity > prod.stock_quantity:
                        details = {'product_id': prod.id}
                        clamped = clamp_available(prod.stock_quantity)
                        if clamped is not None:
                            details['available'] = clamped
                        raise APIError(
                            code=INSUFFICIENT_STOCK,
                            message=f"Only {prod.stock_quantity} units available for {prod.name}.",
                            details=details,
                            status_code=409,
                        )

                    if item.unit_price_at_add != prod.price:
                        # Must match exact price acknowledgement
                        if price_acks.get(prod.id) != prod.price:
                            raise APIError(
                                code=CART_HAS_ISSUES,
                                message=f"Price changed for product {prod.id}.",
                                details={
                                    'issue': 'price_changed',
                                    'product_id': prod.id,
                                    'old_price': str(item.unit_price_at_add),
                                    'new_price': str(prod.price),
                                },
                                status_code=409,
                            )

                # Compute totals directly from locked products
                subtotal = Decimal('0.00')
                for item in cart_items:
                    prod = locked_products[item.product_id]
                    subtotal += prod.price * item.quantity

                total = subtotal
                seller = locked_products[cart_items[0].product_id].seller

                order_number = generate_order_number()

                order = Order.objects.create(
                    order_number=order_number,
                    customer=request.user,
                    seller=seller,
                    idempotency_key=idempotency_key,
                    status=Order.Status.PENDING,
                    subtotal=subtotal,
                    total=total,
                    contact_name=data['contact_name'],
                    contact_phone=data['contact_phone'],
                    delivery_address=data['delivery_address'],
                )

                # Create OrderItems and decrement stock
                order_items_to_create = []
                for item in cart_items:
                    prod = locked_products[item.product_id]
                    line_total = prod.price * item.quantity
                    order_items_to_create.append(
                        OrderItem(
                            order=order,
                            product=prod,
                            product_name_snapshot=prod.name,
                            unit_price_snapshot=prod.price,
                            quantity=item.quantity,
                            line_total=line_total,
                        )
                    )
                    Product.objects.filter(id=prod.id).update(
                        stock_quantity=models.F('stock_quantity') - item.quantity
                    )

                OrderItem.objects.bulk_create(order_items_to_create)

                # Record status history
                OrderStatusHistory.objects.create(
                    order=order,
                    from_status=None,
                    to_status=Order.Status.PENDING,
                    changed_by=request.user,
                )

                # Clear cart lines
                cart.items.all().delete()

        except IntegrityError:
            # Handle possible DR-09 collision race
            existing = Order.objects.filter(customer=request.user, idempotency_key=idempotency_key).first()
            if existing:
                serializer = CustomerOrderDetailSerializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)
            raise

        response_serializer = CustomerOrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CustomerOrderListView(ListAPIView):
    permission_classes = [IsCustomer]
    serializer_class = CustomerOrderListSerializer

    def get_queryset(self):
        qs = Order.objects.filter(customer=self.request.user).select_related('seller').prefetch_related('items').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class CustomerOrderDetailView(RetrieveAPIView):
    permission_classes = [IsCustomer]
    serializer_class = CustomerOrderDetailSerializer

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            return (
                Order.objects.select_related('seller')
                .prefetch_related('items', 'history')
                .get(pk=pk, customer=self.request.user)
            )
        except Order.DoesNotExist:
            raise Http404


class CustomerOrderCancelView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, customer=request.user)
        except Order.DoesNotExist:
            raise Http404

        if order.status == Order.Status.CANCELLED:
            raise APIError(code=ALREADY_CANCELLED, message='Order is already cancelled.', status_code=400)

        assert_transition(order.status, Order.Status.CANCELLED, role='customer')

        with transaction.atomic():
            restore_stock(order)
            from_status = order.status
            order.status = Order.Status.CANCELLED
            order.save(update_fields=['status', 'updated_at'])
            OrderStatusHistory.objects.create(
                order=order,
                from_status=from_status,
                to_status=Order.Status.CANCELLED,
                changed_by=request.user,
            )

        return Response(
            {
                'order_number': order.order_number,
                'status': Order.Status.CANCELLED,
            },
            status=status.HTTP_200_OK,
        )


class SellerOrderListView(ListAPIView):
    permission_classes = [IsSeller]
    serializer_class = SellerOrderListSerializer

    def get_queryset(self):
        seller = self.request.user.sellerprofile
        qs = Order.objects.filter(seller=seller).prefetch_related('items').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class SellerOrderDetailView(RetrieveAPIView):
    permission_classes = [IsSeller]
    serializer_class = SellerOrderDetailSerializer

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            return (
                Order.objects.prefetch_related('items', 'history')
                .get(pk=pk, seller=self.request.user.sellerprofile)
            )
        except Order.DoesNotExist:
            raise Http404


class SellerOrderTransitionView(APIView):
    permission_classes = [IsSeller]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, seller=request.user.sellerprofile)
        except Order.DoesNotExist:
            raise Http404

        to_status = request.data.get('to_status')
        if not to_status:
            raise APIError(code=INVALID_TRANSITION, message='to_status is required.', status_code=400)

        if order.status == Order.Status.CANCELLED:
            raise APIError(code=INVALID_TRANSITION, message='Cannot transition from cancelled.', status_code=400)

        assert_transition(order.status, to_status, role='seller')

        with transaction.atomic():
            if to_status == Order.Status.CANCELLED:
                restore_stock(order)

            from_status = order.status
            order.status = to_status
            order.save(update_fields=['status', 'updated_at'])

            OrderStatusHistory.objects.create(
                order=order,
                from_status=from_status,
                to_status=to_status,
                changed_by=request.user,
            )

        return Response(
            {
                'order_number': order.order_number,
                'from_status': from_status,
                'status': to_status,
            },
            status=status.HTTP_200_OK,
        )


class SellerDashboardView(APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        seller = request.user.sellerprofile
        threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)

        product_count = Product.objects.filter(seller=seller).count()
        out_of_stock_count = Product.objects.filter(seller=seller, stock_quantity=0).count()
        low_stock_count = Product.objects.filter(
            seller=seller,
            stock_quantity__gt=0,
            stock_quantity__lte=threshold,
        ).count()

        # Initialize all 6 keys
        orders_by_status = {
            Order.Status.PENDING: 0,
            Order.Status.CONFIRMED: 0,
            Order.Status.PREPARING: 0,
            Order.Status.READY: 0,
            Order.Status.COMPLETED: 0,
            Order.Status.CANCELLED: 0,
        }

        counts = (
            Order.objects.filter(seller=seller)
            .values('status')
            .annotate(cnt=models.Count('id'))
        )
        for c in counts:
            orders_by_status[c['status']] = c['cnt']

        return Response(
            {
                'product_count': product_count,
                'out_of_stock_count': out_of_stock_count,
                'low_stock_count': low_stock_count,
                'orders_by_status': orders_by_status,
            },
            status=status.HTTP_200_OK,
        )


class AdminMetricsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        # ponytail: live COUNT/SUM; materialized view past ~100k orders
        total_orders = Order.objects.count()
        total_sales = (
            Order.objects.exclude(status=Order.Status.CANCELLED)
            .aggregate(sum=models.Sum('total'))['sum']
            or Decimal('0.00')
        )
        published_product_count = Product.objects.filter(status=Product.Status.PUBLISHED).count()
        active_seller_count = SellerProfile.objects.filter(status=SellerProfile.Status.ACTIVE).count()

        orders_by_status = {
            Order.Status.PENDING: 0,
            Order.Status.CONFIRMED: 0,
            Order.Status.PREPARING: 0,
            Order.Status.READY: 0,
            Order.Status.COMPLETED: 0,
            Order.Status.CANCELLED: 0,
        }

        counts = Order.objects.values('status').annotate(cnt=models.Count('id'))
        for c in counts:
            orders_by_status[c['status']] = c['cnt']

        return Response(
            {
                'total_orders': total_orders,
                'total_sales': str(Decimal(total_sales).quantize(Decimal('0.01'))),
                'published_product_count': published_product_count,
                'active_seller_count': active_seller_count,
                'orders_by_status': orders_by_status,
            },
            status=status.HTTP_200_OK,
        )


class AdminOrderListView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = CustomerOrderDetailSerializer

    def get_queryset(self):
        qs = Order.objects.all().select_related('customer', 'seller').prefetch_related('items', 'history').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        seller_param = self.request.query_params.get('seller')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if status_param:
            qs = qs.filter(status=status_param)
        if seller_param:
            qs = qs.filter(seller_id=seller_param)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs


class AdminUserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

        return Response(
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'status': user.status,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

        status_val = request.data.get('status')
        if status_val not in (User.Status.ACTIVE, User.Status.SUSPENDED):
            raise APIError(code='validation_error', message='Invalid status choice.', status_code=400)

        with transaction.atomic():
            user.status = status_val
            user.save(update_fields=['status'])
            if user.role == User.Role.SELLER and hasattr(user, 'sellerprofile'):
                profile = user.sellerprofile
                profile.status = status_val
                profile.save(update_fields=['status', 'updated_at'])

        return Response(
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'status': user.status,
            },
            status=status.HTTP_200_OK,
        )
