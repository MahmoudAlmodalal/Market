from django.urls import path

from orders.views import (
    AdminMetricsView,
    AdminOrderListView,
    CartItemCreateView,
    CartItemDetailView,
    CartView,
    CheckoutView,
    CustomerCancelView,
    CustomerOrderDetailView,
    CustomerOrderListView,
    SellerDashboardView,
    SellerOrderDetailView,
    SellerOrderListView,
    SellerOrderTransitionView,
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemCreateView.as_view(), name='cart-item-create'),
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', CustomerOrderListView.as_view(), name='customer-orders'),
    path('orders/<int:pk>/', CustomerOrderDetailView.as_view(), name='customer-order-detail'),
    path('orders/<int:pk>/cancel/', CustomerCancelView.as_view(), name='customer-order-cancel'),
    path('seller/orders/', SellerOrderListView.as_view(), name='seller-orders'),
    path('seller/orders/<int:pk>/', SellerOrderDetailView.as_view(), name='seller-order-detail'),
    path('seller/orders/<int:pk>/transition/', SellerOrderTransitionView.as_view(), name='seller-order-transition'),
    path('seller/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('admin/metrics/', AdminMetricsView.as_view(), name='admin-metrics'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
]
