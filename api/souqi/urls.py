from django.contrib import admin
from django.urls import include, path

from common.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('catalog.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('ai.urls')),
]

handler404 = 'common.views.not_found'
handler500 = 'common.views.server_error'
