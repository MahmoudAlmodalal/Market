from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from common.errors import APIError, ACCOUNT_SUSPENDED
from accounts.models import User


class SuspendedAwareJWTAuthentication(JWTAuthentication):
    """JWT authentication that immediately rejects suspended accounts (SEC-10)."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user and getattr(user, 'status', None) == User.Status.SUSPENDED:
            raise APIError(
                code=ACCOUNT_SUSPENDED,
                message='Account is suspended.',
                status_code=401,
            )
        return user
