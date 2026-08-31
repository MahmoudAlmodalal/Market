from django.urls import path
from orders.views import (
    AdminMetricsView,
    AdminOrderListView,
    AdminUserDetailView,
    CartItemDetailView,
    CartItemView,
    CartView,
    CheckoutView,
    CustomerOrderCancelView,
    CustomerOrderDetailView,
    CustomerOrderListView,
    SellerDashboardView,
    SellerOrderDetailView,
    SellerOrderListView,
    SellerOrderTransitionView,
)

urlpatterns = [
    # Cart
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart-items'),
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),

    # Checkout
    path('checkout/', CheckoutView.as_view(), name='checkout'),

    # Customer Orders
    path('orders/', CustomerOrderListView.as_view(), name='customer-order-list'),
    path('orders/<int:pk>/', CustomerOrderDetailView.as_view(), name='customer-order-detail'),
    path('orders/<int:pk>/cancel/', CustomerOrderCancelView.as_view(), name='customer-order-cancel'),

    # Seller Orders & Dashboard
    path('seller/orders/', SellerOrderListView.as_view(), name='seller-order-list'),
    path('seller/orders/<int:pk>/', SellerOrderDetailView.as_view(), name='seller-order-detail'),
    path('seller/orders/<int:pk>/transition/', SellerOrderTransitionView.as_view(), name='seller-order-transition'),
    path('seller/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),

    # Admin Metrics, Orders, Users
    path('admin/metrics/', AdminMetricsView.as_view(), name='admin-metrics'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
