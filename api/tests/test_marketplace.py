import io
import uuid

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from ai.models import AIContentSuggestion
from catalog.models import Category, Product
from orders.models import Cart, Order


@pytest.fixture
def users(db):
    customer = User.objects.create_user('customer@test.example', 'CustomerPass123!', name='Customer')
    seller = User.objects.create_user('seller@test.example', 'SellerPass123!', name='Seller', role='seller')
    seller_profile = SellerProfile.objects.create(user=seller, business_name='Seller Shop')
    admin = User.objects.create_superuser('admin@test.example', 'AdminPass123!', name='Admin')
    category = Category.objects.create(name='Home')
    product = Product.objects.create(seller=seller_profile, category=category, name='Lamp', description='A useful lamp', price='10.00', stock_quantity=5, status='published')
    return {'customer': customer, 'seller': seller, 'admin': admin, 'profile': seller_profile, 'category': category, 'product': product}


def auth_client(email, password):
    client = APIClient()
    response = client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
    assert response.status_code == 200, response.data
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return client


def image_file():
    stream = io.BytesIO()
    Image.new('RGB', (2, 2), 'red').save(stream, format='PNG')
    return SimpleUploadedFile('lamp.png', stream.getvalue(), content_type='image/png')


def test_registration_and_suspended_token(users):
    response = APIClient().post('/api/auth/register/', {'email': 'new@test.example', 'password': 'StrongPass123!', 'name': 'New', 'role': 'customer'}, format='json')
    assert response.status_code == 201
    customer = users['customer']
    client = auth_client(customer.email, 'CustomerPass123!')
    customer.status = 'suspended'; customer.save(update_fields=['status'])
    assert client.get('/api/auth/me/').status_code == 401


def test_catalog_and_stock_disclosure(users):
    client = APIClient()
    response = client.get('/api/products/')
    assert response.status_code == 200
    detail = client.get(f"/api/products/{users['product'].id}/")
    assert detail.status_code == 200
    assert detail.data['available_quantity'] == 5
    users['product'].stock_quantity = 20; users['product'].save(update_fields=['stock_quantity'])
    detail = client.get(f"/api/products/{users['product'].id}/")
    assert 'available_quantity' not in detail.data


def test_cart_checkout_idempotency_and_restore(users):
    client = auth_client(users['customer'].email, 'CustomerPass123!')
    add = client.post('/api/cart/items/', {'product_id': users['product'].id, 'quantity': 2}, format='json')
    assert add.status_code == 201
    key = str(uuid.uuid4())
    checkout = client.post('/api/checkout/', {'contact_name': 'C', 'contact_phone': '1', 'delivery_address': 'A'}, format='json', HTTP_IDEMPOTENCY_KEY=key)
    assert checkout.status_code == 201, checkout.data
    assert Order.objects.count() == 1
    retry = client.post('/api/checkout/', {'contact_name': 'Different', 'contact_phone': '2', 'delivery_address': 'B'}, format='json', HTTP_IDEMPOTENCY_KEY=key)
    assert retry.status_code == 200
    assert Order.objects.count() == 1
    product = Product.objects.get(pk=users['product'].id)
    assert product.stock_quantity == 3
    cancel = client.post(f"/api/orders/{Order.objects.first().id}/cancel/", {}, format='json')
    assert cancel.status_code == 200
    assert Product.objects.get(pk=product.id).stock_quantity == 5


def test_seller_publish_and_image_upload(users):
    client = auth_client(users['seller'].email, 'SellerPass123!')
    created = client.post('/api/seller/products/', {'name': 'New Lamp', 'description': 'Another lamp', 'price': '4.00', 'stock_quantity': 1, 'category_id': users['category'].id}, format='json')
    assert created.status_code == 201
    pid = created.data['id']
    upload = client.post(f'/api/seller/products/{pid}/images/', {'image': image_file()}, format='multipart')
    assert upload.status_code == 201, upload.data
    assert client.post(f'/api/seller/products/{pid}/publish/', {}, format='json').status_code == 200


def test_ai_suggestion_review_and_admin_metrics(users):
    seller = auth_client(users['seller'].email, 'SellerPass123!')
    suggestion = seller.post('/api/ai/suggest-description/', {'name': 'Lamp', 'category_id': users['category'].id, 'attributes': {}, 'notes': ''}, format='json')
    assert suggestion.status_code == 200, suggestion.data
    assert suggestion.data['status'] == 'pending'
    accepted = seller.post(f"/api/ai/suggestions/{suggestion.data['suggestion_id']}/accept/", {'product_id': users['product'].id}, format='json')
    assert accepted.status_code == 200, accepted.data
    assert AIContentSuggestion.objects.get(pk=suggestion.data['suggestion_id']).review_status == 'accepted'
    admin = auth_client(users['admin'].email, 'AdminPass123!')
    assert admin.get('/api/admin/metrics/').status_code == 200
