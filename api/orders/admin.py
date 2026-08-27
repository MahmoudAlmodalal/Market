from django.contrib import admin

from orders.models import Cart, CartItem, Order, OrderItem, OrderNumberCounter, OrderStatusHistory

for model in (Cart, CartItem, Order, OrderItem, OrderNumberCounter, OrderStatusHistory):
    admin.site.register(model)
