from django.contrib import admin
from catalog.models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'slug']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'seller', 'category', 'price', 'stock_quantity', 'status', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['name', 'description']
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'sort_order']
