from django.db import models
from django.db.models import CheckConstraint, F, Q
from django.utils.text import slugify

from accounts.models import SellerProfile


class Category(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        HIDDEN = 'hidden', 'Hidden'

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    def save(self, *args, **kwargs):
        if not self.pk:
            base = slugify(self.name)
            candidate = base
            index = 2
            while type(self).objects.filter(slug=candidate).exists():
                candidate = f'{base}-{index}'
                index += 1
            self.slug = candidate
        super().save(*args, **kwargs)


class Product(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        REJECTED = 'rejected', 'Rejected'
        ARCHIVED = 'archived', 'Archived'

    seller = models.ForeignKey(SellerProfile, on_delete=models.PROTECT, related_name='products', db_index=False)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    moderation_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            CheckConstraint(condition=Q(price__gte=0), name='product_price_nonnegative'),
            CheckConstraint(condition=Q(stock_quantity__gte=0), name='product_stock_nonnegative'),
        ]
        indexes = [
            models.Index(fields=['status', '-created_at'], name='product_status_created_idx'),
            models.Index(fields=['seller', 'status'], name='product_seller_status_idx'),
        ]


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', db_index=False)
    image = models.ImageField(upload_to='products/')
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']
        constraints = [models.UniqueConstraint(fields=['product', 'sort_order'], name='uniq_product_image_order')]
