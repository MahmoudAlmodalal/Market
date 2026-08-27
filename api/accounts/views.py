from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.models import SellerProfile, User
from accounts.serializers import (
    AdminUserUpdateSerializer,
    LoginSerializer,
    RefreshSerializer,
    RegisterSerializer,
    UserPublicSerializer,
)
from common.errors import APIError, VALIDATION_ERROR
from common.permissions import IsAdmin


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({'user': UserPublicSerializer(user).data, 'access': str(refresh.access_token), 'refresh': str(refresh)}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class RefreshAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(serializer.validated_data['refresh'])
            return Response({'access': str(token.access_token)})
        except Exception:
            raise APIError('invalid_credentials', 'Invalid refresh token.', status_code=401)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserPublicSerializer(request.user).data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            from django.http import Http404
            raise Http404

    def get(self, request, pk):
        return Response(UserPublicSerializer(self.get_object(pk)).data | {'status': self.get_object(pk).status})

    @transaction.atomic
    def patch(self, request, pk):
        user = self.get_object(pk)
        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if user.role == User.Role.SELLER:
            SellerProfile.objects.filter(user=user).update(status=user.status)
        return Response(UserPublicSerializer(user).data | {'status': user.status})
