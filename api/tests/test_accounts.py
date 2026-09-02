import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from rest_framework.test import APIClient

from accounts.models import SellerProfile

User = get_user_model()


@pytest.mark.django_db
class TestUserModelAndAuth:
    def test_create_user_success(self):
        user = User.objects.create_user(
            email="jane.doe@example.com",
            name="Jane Doe",
            password="securePassword123!",
        )
        assert user.pk is not None
        assert user.email == "jane.doe@example.com"
        assert user.name == "Jane Doe"
        assert user.role == User.Role.CUSTOMER
        assert user.status == User.Status.ACTIVE
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.check_password("securePassword123!") is True

    def test_create_user_missing_email_raises_value_error(self):
        with pytest.raises(ValueError, match="Email is required."):
            User.objects.create_user(email="", name="Jane Doe", password="password123")

    def test_case_insensitive_email_uniqueness_dr_01(self):
        User.objects.create_user(
            email="alex@example.com",
            name="Alex One",
            password="password123",
        )
        with pytest.raises(IntegrityError):
            User.objects.create(
                email="ALEX@example.com",
                name="Alex Two",
            )

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            name="Admin Super",
            password="adminPassword123!",
        )
        assert admin.is_staff is True
        assert admin.is_superuser is True
        assert admin.role == User.Role.ADMIN

    def test_register_customer_api(self):
        client = APIClient()
        response = client.post('/api/auth/register/', {
            'email': 'customer@test.com',
            'name': 'Customer Test',
            'password': 'SecureBuyerPass123!',
            'role': 'customer',
        }, format='json')
        assert response.status_code == 201
        data = response.json()
        assert data['user']['email'] == 'customer@test.com'
        assert data['user']['role'] == 'customer'
        assert 'access' in data
        assert 'refresh' in data

    def test_register_seller_creates_seller_profile_api(self):
        client = APIClient()
        response = client.post('/api/auth/register/', {
            'email': 'seller@test.com',
            'name': 'Seller Business',
            'password': 'SecureSellerPass123!',
            'role': 'seller',
        }, format='json')
        assert response.status_code == 201
        data = response.json()
        assert data['user']['email'] == 'seller@test.com'
        assert data['user']['role'] == 'seller'

        user = User.objects.get(email='seller@test.com')
        assert hasattr(user, 'sellerprofile')
        assert user.sellerprofile.business_name == 'Seller Business'
        assert user.sellerprofile.status == SellerProfile.Status.ACTIVE

    def test_register_admin_role_rejected(self):
        client = APIClient()
        response = client.post('/api/auth/register/', {
            'email': 'badadmin@test.com',
            'name': 'Hacker',
            'password': 'password123',
            'role': 'admin',
        }, format='json')
        assert response.status_code == 400
        assert response.json()['error']['code'] == 'validation_error'

    def test_login_and_me_api(self):
        User.objects.create_user(email='login@test.com', name='Login User', password='password123')
        client = APIClient()
        response = client.post('/api/auth/login/', {
            'email': 'LOGIN@test.com',
            'password': 'password123',
        }, format='json')
        assert response.status_code == 200
        access = response.json()['access']

        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me_resp = client.get('/api/auth/me/')
        assert me_resp.status_code == 200
        assert me_resp.json()['email'] == 'login@test.com'

    def test_suspended_user_login_rejected(self):
        user = User.objects.create_user(email='suspended@test.com', name='Suspended User', password='password123')
        user.status = User.Status.SUSPENDED
        user.save()

        client = APIClient()
        response = client.post('/api/auth/login/', {
            'email': 'suspended@test.com',
            'password': 'password123',
        }, format='json')
        assert response.status_code == 401
        assert response.json()['error']['code'] == 'account_suspended'
