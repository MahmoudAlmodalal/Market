from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from common.errors import ACCOUNT_SUSPENDED


class SuspendedAwareJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user.status == 'suspended':
            exc = AuthenticationFailed('This account is suspended.')
            exc.default_code = ACCOUNT_SUSPENDED
            raise exc
        return user
