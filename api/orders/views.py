import uuid
from datetime import datetime
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.db.models import Count, F, Q, Sum
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from catalog.services import clamped_available
from common.errors import (
    ALREADY_CANCELLED,
    CART_HAS_ISSUES,
    EMPTY_CART,
    INSUFFICIENT_STOCK,
    INVALID_QUANTITY,
    MISSING_IDEMPOTENCY_KEY,
    MULTI_SELLER_CART,
    PRODUCT_NOT_PURCHASABLE,
    APIError,
    VALIDATION_ERROR,
)
from common.permissions import IsAdmin, IsCustomer, IsSeller
from common.pagination import StandardPagination
from orders.models import Cart, CartItem, Order, OrderItem, OrderStatusHistory
from orders.serializers import (
    CartItemWriteSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
    SellerOrderDetailSerializer,
    SellerOrderListSerializer,
)
from orders.services import cart_seller, next_order_number, revalidate, restore_stock
from orders.state import assert_transition


def cart_response(cart, request):
    lines, issues, blocking = revalidate(cart)
    return CartSerializer(cart, context={'request': request, 'lines': lines, 'issues_by_line': issues, 'has_blocking_issues': blocking}).data


def stock_error(product, code=INSUFFICIENT_STOCK, http_status=400):
    details = {}
    available = clamped_available(product.stock_quantity)
    if available is not None:
        details['available'] = available
    message = 'Not enough stock.' if available is None else 'Requested quantity exceeds available stock.'
    raise APIError(code, message, details, http_status)


class CartView(APIView):
    permission_classes = [IsCustomer]

    def get_cart(self, request, create=False):
        cart, _ = Cart.objects.get_or_create(customer=request.user) if create else (Cart.objects.filter(customer=request.user).first(), False)
        return cart

    def get(self, request):
        cart = self.get_cart(request)
        if not cart:
            return Response({'id': None, 'seller': None, 'items': [], 'subtotal': Decimal('0.00'), 'has_blocking_issues': False})
        return Response(cart_response(cart, request))

    def delete(self, request):
        cart = self.get_cart(request, create=True)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemCreateView(APIView):
    permission_classes = [IsCustomer]

    @transaction.atomic
    def post(self, request):
        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data.get('product_id')
        try:
            product = Product.objects.select_for_update().select_related('seller').get(pk=product_id)
        except Product.DoesNotExist:
            raise Http404
        if product.status != Product.Status.PUBLISHED:
            raise APIError(PRODUCT_NOT_PURCHASABLE, 'Product is not available for purchase.')
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        current_seller = cart_seller(cart)
        if current_seller and current_seller.pk != product.seller_id:
            raise APIError(MULTI_SELLER_CART, 'A cart may contain products from one seller only.', {'current_seller': {'id': current_seller.pk, 'business_name': current_seller.business_name}}, 409)
        quantity = serializer.validated_data['quantity']
        if quantity > product.stock_quantity:
            stock_error(product)
        CartItem.objects.update_or_create(cart=cart, product=product, defaults={'quantity': quantity, 'unit_price_at_add': product.price})
        return Response(cart_response(cart, request), status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsCustomer]

    def get_object(self, request, pk):
        try:
            return CartItem.objects.select_related('product').get(pk=pk, cart__customer=request.user)
        except CartItem.DoesNotExist:
            raise Http404

    @transaction.atomic
    def patch(self, request, pk):
        item = self.get_object(request, pk)
        serializer = CartItemWriteSerializer(data={'quantity': request.data.get('quantity')})
        serializer.is_valid(raise_exception=True)
        product = Product.objects.select_for_update().get(pk=item.product_id)
        if product.status != Product.Status.PUBLISHED:
            raise APIError(PRODUCT_NOT_PURCHASABLE, 'Product is not available for purchase.')
        if serializer.validated_data['quantity'] > product.stock_quantity:
            stock_error(product)
        item.quantity = serializer.validated_data['quantity']
        item.unit_price_at_add = product.price
        item.save(update_fields=['quantity', 'unit_price_at_add'])
        return Response(cart_response(item.cart, request))

    def delete(self, request, pk):
        item = self.get_object(request, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsCustomer]

    def _parse_key(self, request):
        raw = request.headers.get('Idempotency-Key')
        try:
            key = uuid.UUID(raw)
            if key.version != 4:
                raise ValueError
            return key
        except (ValueError, AttributeError, TypeError):
            raise APIError(MISSING_IDEMPOTENCY_KEY, 'A valid uuid4 Idempotency-Key header is required.')

    def _order_response(self, order):
        return {
            'order_number': order.order_number,
            'status': order.status,
            'items': [
                {'product_name_snapshot': i.product_name_snapshot, 'unit_price_snapshot': i.unit_price_snapshot, 'quantity': i.quantity, 'line_total': i.line_total}
                for i in order.items.all()
            ],
            'subtotal': order.subtotal,
            'total': order.total,
            'created_at': order.created_at,
        }

    def post(self, request):
        key = self._parse_key(request)
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                existing = Order.objects.filter(customer=request.user, idempotency_key=key).prefetch_related('items').first()
                if existing:
                    return Response(self._order_response(existing), status=status.HTTP_200_OK)
                cart = Cart.objects.filter(customer=request.user).first()
                if not cart or not cart.items.exists():
                    raise APIError(EMPTY_CART, 'Your cart is empty.')
                lines = list(cart.items.select_related('product').order_by('product_id', 'id'))
                product_ids = [line.product_id for line in lines]
                locked_products = list(Product.objects.select_for_update().select_related('seller').filter(id__in=product_ids).order_by('id'))
                locked_by_id = {product.id: product for product in locked_products}
                _, issues_by_line, _ = revalidate(cart, locked_products)
                acknowledgements = {
                    (item.get('product_id'), item.get('code')): str(item.get('new_price'))
                    for item in serializer.validated_data.get('acknowledged_issues', [])
                    if isinstance(item, dict)
                }
                remaining_issues = {}
                for line_id, issues in issues_by_line.items():
                    remaining = []
                    for issue in issues:
                        if issue['code'] == 'price_changed' and acknowledgements.get((cart.items.get(pk=line_id).product_id, 'price_changed')) == issue['new_price']:
                            continue
                        remaining.append(issue)
                    if remaining:
                        remaining_issues[line_id] = remaining
                stock_issue = next((issue for issue_list in remaining_issues.values() for issue in issue_list if issue['code'] == 'insufficient_stock'), None)
                if stock_issue:
                    line_id = next(line_id for line_id, issue_list in remaining_issues.items() if stock_issue in issue_list)
                    product = locked_by_id.get(cart.items.get(pk=line_id).product_id)
                    details = {'product_id': product.id}
                    available = clamped_available(product.stock_quantity)
                    if available is not None:
                        details['available'] = available
                    raise APIError(INSUFFICIENT_STOCK, 'Not enough stock.', details, 409)
                if remaining_issues:
                    details = {'issues': []}
                    for line_id, issue_list in remaining_issues.items():
                        line = cart.items.get(pk=line_id)
                        for issue in issue_list:
                            details['issues'].append({'product_id': line.product_id, **issue})
                    raise APIError(CART_HAS_ISSUES, 'Cart has issues that must be resolved before checkout.', details, 409)
                seller_ids = {locked_by_id[line.product_id].seller_id for line in lines}
                if len(seller_ids) != 1:
                    raise APIError(MULTI_SELLER_CART, 'A cart may contain products from one seller.', status_code=409)
                subtotal = sum((locked_by_id[line.product_id].price * line.quantity for line in lines), Decimal('0.00'))
                order = Order.objects.create(order_number=next_order_number(), customer=request.user, seller=locked_by_id[lines[0].product_id].seller, status=Order.Status.PENDING, subtotal=subtotal, total=subtotal, contact_name=serializer.validated_data['contact_name'], contact_phone=serializer.validated_data['contact_phone'], delivery_address=serializer.validated_data['delivery_address'], idempotency_key=key)
                OrderItem.objects.bulk_create([
                    OrderItem(order=order, product=locked_by_id[line.product_id], product_name_snapshot=locked_by_id[line.product_id].name, unit_price_snapshot=locked_by_id[line.product_id].price, quantity=line.quantity, line_total=locked_by_id[line.product_id].price * line.quantity)
                    for line in lines
                ])
                for line in lines:
                    Product.objects.filter(pk=line.product_id).update(stock_quantity=F('stock_quantity') - line.quantity)
                OrderStatusHistory.objects.create(order=order, from_status=None, to_status=Order.Status.PENDING, changed_by=request.user)
                cart.items.all().delete()
                order = Order.objects.prefetch_related('items').get(pk=order.pk)
                return Response(self._order_response(order), status=status.HTTP_201_CREATED)
        except IntegrityError:
            existing = Order.objects.filter(customer=request.user, idempotency_key=key).prefetch_related('items').first()
            if existing:
                return Response(self._order_response(existing), status=status.HTTP_200_OK)
            raise


class CustomerOrderListView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        qs = Order.objects.filter(customer=request.user).annotate(item_count=Count('items')).order_by('-created_at')
        if request.query_params.get('status'):
            qs = qs.filter(status=request.query_params['status'])
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(OrderListSerializer(page, many=True).data)


class CustomerOrderDetailView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request, pk):
        try:
            order = Order.objects.select_related('seller').prefetch_related('items', 'history').get(pk=pk, customer=request.user)
        except Order.DoesNotExist:
            raise Http404
        return Response(OrderDetailSerializer(order).data)


class CustomerCancelView(APIView):
    permission_classes = [IsCustomer]

    @transaction.atomic
    def post(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk, customer=request.user)
        except Order.DoesNotExist:
            raise Http404
        if order.status == Order.Status.CANCELLED:
            raise APIError(ALREADY_CANCELLED, 'Order is already cancelled.')
        assert_transition(order.status, Order.Status.CANCELLED, 'customer')
        restore_stock(order)
        old_status = order.status
        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])
        OrderStatusHistory.objects.create(order=order, from_status=old_status, to_status=order.status, changed_by=request.user)
        return Response({'order_number': order.order_number, 'status': order.status})


class SellerOrderListView(APIView):
    permission_classes = [IsSeller]

    def get_queryset(self, request):
        return Order.objects.filter(seller=request.user.sellerprofile).annotate(item_count=Count('items')).order_by('-created_at')

    def get(self, request):
        qs = self.get_queryset(request)
        if request.query_params.get('status'):
            qs = qs.filter(status=request.query_params['status'])
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(SellerOrderListSerializer(page, many=True).data)


class SellerOrderDetailView(APIView):
    permission_classes = [IsSeller]

    def get(self, request, pk):
        try:
            order = Order.objects.prefetch_related('items').get(pk=pk, seller=request.user.sellerprofile)
        except Order.DoesNotExist:
            raise Http404
        return Response(SellerOrderDetailSerializer(order).data)


class SellerOrderTransitionView(APIView):
    permission_classes = [IsSeller]

    @transaction.atomic
    def post(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk, seller=request.user.sellerprofile)
        except Order.DoesNotExist:
            raise Http404
        to_status = request.data.get('to_status')
        assert_transition(order.status, to_status, 'seller')
        old_status = order.status
        if to_status == Order.Status.CANCELLED:
            restore_stock(order)
        order.status = to_status
        order.save(update_fields=['status'])
        OrderStatusHistory.objects.create(order=order, from_status=old_status, to_status=to_status, changed_by=request.user)
        return Response({'order_number': order.order_number, 'from_status': old_status, 'status': to_status})


class SellerDashboardView(APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        from catalog.services import stock_state
        products = Product.objects.filter(seller=request.user.sellerprofile)
        from django.conf import settings
        counts = products.aggregate(product_count=Count('id'), out_of_stock_count=Count('id', filter=Q(stock_quantity=0)), low_stock_count=Count('id', filter=Q(stock_quantity__gt=0, stock_quantity__lte=settings.LOW_STOCK_THRESHOLD)))
        statuses = [choice[0] for choice in Order.Status.choices]
        rows = Order.objects.filter(seller=request.user.sellerprofile).values('status').annotate(count=Count('id'))
        by_status = {status: 0 for status in statuses}
        by_status.update({row['status']: row['count'] for row in rows})
        return Response({**counts, 'orders_by_status': by_status})


class AdminMetricsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        orders = Order.objects.all()
        rows = orders.values('status').annotate(count=Count('id'))
        by_status = {status: 0 for status, _ in Order.Status.choices}
        by_status.update({row['status']: row['count'] for row in rows})
        total_sales = orders.exclude(status=Order.Status.CANCELLED).aggregate(value=Sum('total'))['value'] or Decimal('0.00')
        from accounts.models import SellerProfile
        return Response({'total_orders': orders.count(), 'total_sales': total_sales, 'published_product_count': Product.objects.filter(status=Product.Status.PUBLISHED).count(), 'active_seller_count': SellerProfile.objects.filter(status='active').count(), 'orders_by_status': by_status})


class AdminOrderListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = Order.objects.select_related('seller', 'customer').annotate(item_count=Count('items')).order_by('-created_at')
        for field in ('status', 'seller_id'):
            if request.query_params.get(field.replace('_id', '')):
                qs = qs.filter(**{field: request.query_params.get(field.replace('_id', ''))})
        if request.query_params.get('date_from'):
            qs = qs.filter(created_at__date__gte=request.query_params['date_from'])
        if request.query_params.get('date_to'):
            qs = qs.filter(created_at__date__lte=request.query_params['date_to'])
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(OrderListSerializer(page, many=True).data)
