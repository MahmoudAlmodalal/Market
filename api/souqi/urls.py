from django.contrib import admin
from django.urls import path

from common.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
]

handler404 = 'common.views.not_found'
handler500 = 'common.views.server_error'
