from django.conf import settings
from django.db import models

from accounts.models import SellerProfile, User
from catalog.models import Product


class Cart(models.Model):
    customer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.customer.email}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    quantity = models.PositiveIntegerField()
    unit_price_at_add = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['cart', 'product'],
                name='uniq_cart_product',
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gte=1),
                name='chk_cartitem_quantity_gte_1',
            ),
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in cart {self.cart_id}"


class OrderNumberCounter(models.Model):
    year = models.SmallIntegerField(primary_key=True)
    last_seq = models.IntegerField(default=1000)

    def __str__(self):
        return f"Year {self.year}: seq {self.last_seq}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending'
        CONFIRMED = 'confirmed'
        PREPARING = 'preparing'
        READY = 'ready'
        COMPLETED = 'completed'
        CANCELLED = 'cancelled'

    order_number = models.CharField(max_length=32, unique=True)
    customer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='orders',
        db_index=False,
    )
    seller = models.ForeignKey(
        SellerProfile,
        on_delete=models.PROTECT,
        related_name='orders',
        db_index=False,
    )
    idempotency_key = models.UUIDField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    contact_name = models.CharField(max_length=120)
    contact_phone = models.CharField(max_length=30)
    delivery_address = models.TextField()
    stock_restored = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['customer', 'idempotency_key'],
                name='uniq_order_customer_idempotency',
            ),
            models.CheckConstraint(
                condition=models.Q(subtotal__gte=0) & models.Q(total__gte=0),
                name='chk_order_totals_non_negative',
            ),
        ]
        indexes = [
            models.Index(fields=['customer', '-created_at'], name='idx_order_customer_created'),
            models.Index(fields=['seller', 'status'], name='idx_order_seller_status'),
        ]

    def __str__(self):
        return f"Order {self.order_number} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items',
    )
    product_name_snapshot = models.CharField(max_length=200)
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gte=1),
                name='chk_orderitem_quantity_gte_1',
            ),
            models.CheckConstraint(
                condition=models.Q(line_total=models.F('unit_price_snapshot') * models.F('quantity')),
                name='chk_orderitem_line_total_match',
            ),
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product_name_snapshot} (Order {self.order_id})"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='history',
        db_index=False,
    )
    from_status = models.CharField(max_length=16, null=True, blank=True)
    to_status = models.CharField(max_length=16)
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'order status histories'
        indexes = [
            models.Index(fields=['order', 'created_at'], name='idx_history_order_created'),
        ]

    def __str__(self):
        return f"{self.order.order_number}: {self.from_status} -> {self.to_status}"
