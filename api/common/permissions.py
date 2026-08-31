from rest_framework.permissions import BasePermission
from accounts.models import User


class IsCustomer(BasePermission):
    """Allows access only to authenticated users with customer role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.CUSTOMER
        )


class IsSeller(BasePermission):
    """Allows access only to authenticated users with seller role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SELLER
        )


class IsAdmin(BasePermission):
    """Allows access only to authenticated admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )


class IsSellerOrAdmin(BasePermission):
    """Allows access only to authenticated sellers or admins."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in (User.Role.SELLER, User.Role.ADMIN) or request.user.is_staff or request.user.is_superuser)
        )
