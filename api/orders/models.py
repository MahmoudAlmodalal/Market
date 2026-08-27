from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, F, Q, UniqueConstraint

from accounts.models import SellerProfile
from catalog.models import Product


class Cart(models.Model):
    customer = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', db_index=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField()
    unit_price_at_add = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['cart', 'product'], name='uniq_cart_product'),
            CheckConstraint(condition=Q(quantity__gte=1), name='cart_item_quantity_positive'),
        ]
        ordering = ['created_at', 'id']


class OrderNumberCounter(models.Model):
    year = models.SmallIntegerField(primary_key=True)
    last_seq = models.IntegerField(default=1000)


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        PREPARING = 'preparing', 'Preparing'
        READY = 'ready', 'Ready'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders', db_index=False)
    seller = models.ForeignKey(SellerProfile, on_delete=models.PROTECT, related_name='orders', db_index=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    contact_name = models.CharField(max_length=120)
    contact_phone = models.CharField(max_length=40)
    delivery_address = models.TextField()
    idempotency_key = models.UUIDField()
    stock_restored = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['customer', 'idempotency_key'], name='uniq_customer_idempotency'),
            CheckConstraint(condition=Q(subtotal__gte=0) & Q(total__gte=0), name='order_totals_nonnegative'),
        ]
        indexes = [
            models.Index(fields=['customer', '-created_at'], name='order_customer_created_idx'),
            models.Index(fields=['seller', 'status'], name='order_seller_status_idx'),
        ]


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    product_name_snapshot = models.CharField(max_length=160)
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            CheckConstraint(condition=Q(quantity__gte=1), name='order_item_quantity_positive'),
            CheckConstraint(condition=Q(line_total=F('unit_price_snapshot') * F('quantity')), name='order_item_line_total_exact'),
        ]


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='history', db_index=False)
    from_status = models.CharField(max_length=16, null=True, blank=True)
    to_status = models.CharField(max_length=16)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_status_changes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['order', 'created_at'], name='history_order_created_idx')]
