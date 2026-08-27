from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from accounts.models import SellerProfile, User


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=(User.Role.CUSTOMER, User.Role.SELLER))

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'role')

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_password(self, value):
        validate_password(value, self.instance)
        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        if user.role == User.Role.SELLER:
            SellerProfile.objects.create(user=user, business_name=user.name)
        return user


class LoginSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user and user.status == User.Status.SUSPENDED:
            from common.errors import ACCOUNT_SUSPENDED, APIError
            raise APIError(ACCOUNT_SUSPENDED, 'This account is suspended.', status_code=401)
        user = authenticate(request=self.context.get('request'), email=email, password=attrs.get('password'))
        if not user:
            from common.errors import APIError, INVALID_CREDENTIALS
            raise APIError(INVALID_CREDENTIALS, 'Invalid email or password.', status_code=401)
        data = super().validate({'email': email, 'password': attrs.get('password')})
        return {'user': UserPublicSerializer(user).data, 'access': data['access'], 'refresh': data['refresh']}


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('status',)

    def validate_status(self, value):
        if value not in User.Status.values:
            raise serializers.ValidationError('Invalid status.')
        return value
