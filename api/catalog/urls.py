from django.urls import path
from catalog.views import (
    CategoryListView,
    ProductDetailView,
    ProductListView,
    SellerProductImageView,
    SellerProductViewSet,
)

seller_products_list = SellerProductViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

seller_products_detail = SellerProductViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update',
    'delete': 'destroy',
})

seller_products_publish = SellerProductViewSet.as_view({
    'post': 'publish',
})

urlpatterns = [
    # Public catalog
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # Seller endpoints
    path('seller/products/', seller_products_list, name='seller-product-list'),
    path('seller/products/<int:pk>/', seller_products_detail, name='seller-product-detail'),
    path('seller/products/<int:pk>/publish/', seller_products_publish, name='seller-product-publish'),
    path('seller/products/<int:product_id>/images/', SellerProductImageView.as_view(), name='seller-product-images'),
    path('seller/products/<int:product_id>/images/<int:image_id>/', SellerProductImageView.as_view(), name='seller-product-image-detail'),
]
