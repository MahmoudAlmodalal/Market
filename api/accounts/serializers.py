from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import SellerProfile
from common.errors import APIError, INVALID_CREDENTIALS, ACCOUNT_SUSPENDED

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(max_length=120)
    role = serializers.ChoiceField(choices=[User.Role.CUSTOMER, User.Role.SELLER])

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return normalized

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters.')
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data['name']
        role = validated_data['role']

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                name=name,
                password=password,
                role=role,
            )
            if role == User.Role.SELLER:
                SellerProfile.objects.create(
                    user=user,
                    business_name=name,
                    status=SellerProfile.Status.ACTIVE,
                )

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise APIError(
                code=INVALID_CREDENTIALS,
                message='Invalid email or password.',
                status_code=401,
            )

        if user.status == User.Status.SUSPENDED:
            raise APIError(
                code=ACCOUNT_SUSPENDED,
                message='Account is suspended.',
                status_code=401,
            )

        if not user.check_password(password):
            raise APIError(
                code=INVALID_CREDENTIALS,
                message='Invalid email or password.',
                status_code=401,
            )

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
