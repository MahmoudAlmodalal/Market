from django.contrib import admin
from orders.models import Cart, CartItem, Order, OrderItem, OrderNumberCounter, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name_snapshot', 'unit_price_snapshot', 'quantity', 'line_total']


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'seller', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'contact_name', 'contact_phone']
    inlines = [OrderItemInline, OrderStatusHistoryInline]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'created_at', 'updated_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart', 'product', 'quantity', 'unit_price_at_add', 'created_at']


@admin.register(OrderNumberCounter)
class OrderNumberCounterAdmin(admin.ModelAdmin):
    list_display = ['year', 'last_seq']
