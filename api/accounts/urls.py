from django.urls import path

from accounts.views import AdminUserDetailView, LoginView, MeView, RefreshAPIView, RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshAPIView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
