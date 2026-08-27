from django.contrib import admin

from accounts.models import SellerProfile, User

admin.site.register(User)
admin.site.register(SellerProfile)
