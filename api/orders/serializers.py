from decimal import Decimal
from rest_framework import serializers

from catalog.serializers import SellerSimpleSerializer
from catalog.services import stock_state
from orders.models import Cart, CartItem, Order, OrderItem, OrderStatusHistory


class CartItemAddSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['from_status', 'to_status', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'product_id',
            'product_name_snapshot',
            'unit_price_snapshot',
            'quantity',
            'line_total',
        ]


class CustomerOrderListSerializer(serializers.ModelSerializer):
    seller = SellerSimpleSerializer(read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'total',
            'item_count',
            'seller',
            'created_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class CustomerOrderDetailSerializer(serializers.ModelSerializer):
    seller = SellerSimpleSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderStatusHistorySerializer(source='history', many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'seller',
            'items',
            'subtotal',
            'total',
            'contact_name',
            'contact_phone',
            'delivery_address',
            'timeline',
            'created_at',
        ]


class SellerOrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'total',
            'item_count',
            'contact_name',
            'created_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class SellerOrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderStatusHistorySerializer(source='history', many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'items',
            'subtotal',
            'total',
            'contact_name',
            'contact_phone',
            'delivery_address',
            'timeline',
            'created_at',
        ]


class PriceAcknowledgementSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    new_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class CheckoutSerializer(serializers.Serializer):
    contact_name = serializers.CharField(max_length=120)
    contact_phone = serializers.CharField(max_length=30)
    delivery_address = serializers.CharField(max_length=500)
    price_acknowledgements = PriceAcknowledgementSerializer(many=True, required=False, default=list)
