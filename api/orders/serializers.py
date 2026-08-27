from rest_framework import serializers

from orders.models import Cart, CartItem, Order, OrderItem, OrderStatusHistory


class CartLineSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.SerializerMethodField()
    line_total = serializers.SerializerMethodField()
    stock_state = serializers.SerializerMethodField()
    issues = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'product_id', 'name', 'unit_price', 'quantity', 'line_total', 'stock_state', 'issues')

    def get_unit_price(self, obj):
        return obj.product.price if obj.product_id else None

    def get_line_total(self, obj):
        return obj.product.price * obj.quantity if obj.product_id else 0

    def get_stock_state(self, obj):
        from catalog.services import stock_state
        return stock_state(obj.product.stock_quantity) if obj.product_id else 'out_of_stock'

    def get_issues(self, obj):
        return self.context.get('issues_by_line', {}).get(obj.id, [])


class CartSerializer(serializers.ModelSerializer):
    seller = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    has_blocking_issues = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'seller', 'items', 'subtotal', 'has_blocking_issues')

    def get_seller(self, obj):
        item = obj.items.select_related('product__seller').first()
        if not item:
            return None
        return {'id': item.product.seller_id, 'business_name': item.product.seller.business_name}

    def get_items(self, obj):
        lines = self.context.get('lines')
        if lines is None:
            lines = obj.items.select_related('product').all()
        return CartLineSerializer(lines, many=True, context=self.context).data

    def get_subtotal(self, obj):
        lines = self.context.get('lines')
        if lines is None:
            lines = obj.items.select_related('product').all()
        return sum((line.product.price * line.quantity for line in lines if line.product_id), 0)

    def get_has_blocking_issues(self, obj):
        return bool(self.context.get('has_blocking_issues', False))


class CartItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    quantity = serializers.IntegerField()

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value


class CheckoutSerializer(serializers.Serializer):
    contact_name = serializers.CharField(required=True, allow_blank=False, max_length=120)
    contact_phone = serializers.CharField(required=True, allow_blank=False, max_length=40)
    delivery_address = serializers.CharField(required=True, allow_blank=False)
    acknowledged_issues = serializers.ListField(child=serializers.DictField(), required=False, default=list)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('product_id', 'product_name_snapshot', 'unit_price_snapshot', 'quantity', 'line_total')


class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'status', 'total', 'item_count', 'created_at')


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    seller = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'status', 'seller', 'items', 'subtotal', 'total', 'contact_name', 'contact_phone', 'delivery_address', 'timeline', 'created_at')

    def get_seller(self, obj):
        return {'id': obj.seller_id, 'business_name': obj.seller.business_name}

    def get_timeline(self, obj):
        return [{'from_status': h.from_status, 'to_status': h.to_status, 'created_at': h.created_at} for h in obj.history.all()]


class SellerOrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'status', 'contact_name', 'total', 'item_count', 'created_at')


class SellerOrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'status', 'items', 'total', 'contact_name', 'contact_phone', 'delivery_address', 'created_at')
