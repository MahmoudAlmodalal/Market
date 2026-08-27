from django.urls import path

from catalog.views import (
    AdminProductDetailView,
    CategoryListView,
    PublicProductDetailView,
    PublicProductListView,
    SellerImageView,
    SellerProductDetailView,
    SellerProductListCreateView,
    SellerPublishView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', PublicProductListView.as_view(), name='public-product-list'),
    path('products/<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
    path('seller/products/', SellerProductListCreateView.as_view(), name='seller-product-list'),
    path('seller/products/<int:pk>/', SellerProductDetailView.as_view(), name='seller-product-detail'),
    path('seller/products/<int:pk>/publish/', SellerPublishView.as_view(), name='seller-product-publish'),
    path('seller/products/<int:pk>/images/', SellerImageView.as_view(), name='seller-product-images'),
    path('seller/products/<int:pk>/images/<int:image_id>/', SellerImageView.as_view(), name='seller-product-image-delete'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
]
