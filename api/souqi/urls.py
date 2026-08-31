from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from catalog.views import AdminProductDetailView
from common.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('catalog.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('ai.urls')),
    path('api/admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'common.views.not_found'
handler500 = 'common.views.server_error'
