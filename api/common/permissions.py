from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    role = None

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == self.role)


class IsCustomer(RolePermission):
    role = 'customer'


class IsSeller(RolePermission):
    role = 'seller'


class IsAdmin(RolePermission):
    role = 'admin'
