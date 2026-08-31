from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from accounts.models import SellerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'status', 'is_staff', 'is_superuser']
    list_filter = ['role', 'status', 'is_staff', 'is_superuser']
    search_fields = ['email', 'name']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name',)}),
        ('Permissions', {'fields': ('role', 'status', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password', 'role'),
        }),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['business_name', 'user__email']
