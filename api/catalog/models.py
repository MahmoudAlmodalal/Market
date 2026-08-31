from django.db import models
from django.utils.text import slugify

from accounts.models import SellerProfile


class Category(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active'
        HIDDEN = 'hidden'

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft'
        PUBLISHED = 'published'
        REJECTED = 'rejected'
        ARCHIVED = 'archived'

    seller = models.ForeignKey(
        SellerProfile,
        on_delete=models.PROTECT,
        related_name='products',
        db_index=False,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='products',
    )
    name = models.CharField(max_length=200)
    description = models.TextField(max_length=5000, blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    moderation_note = models.TextField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=0),
                name='chk_product_price_non_negative',
            ),
            models.CheckConstraint(
                condition=models.Q(stock_quantity__gte=0),
                name='chk_product_stock_non_negative',
            ),
        ]
        indexes = [
            models.Index(fields=['status', '-created_at'], name='idx_prod_status_created'),
            models.Index(fields=['seller', 'status'], name='idx_prod_seller_status'),
        ]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='products/')
    sort_order = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ['sort_order']
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'sort_order'],
                name='uniq_product_sort_order',
            ),
        ]

    def __str__(self):
        return f"{self.product.name} (image #{self.sort_order})"
