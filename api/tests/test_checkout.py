import uuid
from decimal import Decimal
import pytest
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from catalog.models import Category, Product
from orders.models import Order


@pytest.mark.django_db
class TestCheckout:
    @pytest.fixture
    def setup_checkout(self):
        customer = User.objects.create_user(email='buyer2@test.com', name='Buyer Two', password='password123', role=User.Role.CUSTOMER)
        seller_user = User.objects.create_user(email='seller2@test.com', name='Seller Two', password='password123', role=User.Role.SELLER)
        seller = SellerProfile.objects.create(user=seller_user, business_name='Soap Co')
        cat = Category.objects.create(name='Body', slug='body')
        p1 = Product.objects.create(seller=seller, category=cat, name='Body Wash', price=Decimal('15.00'), stock_quantity=10, status=Product.Status.PUBLISHED)
        p2 = Product.objects.create(seller=seller, category=cat, name='Scrub', price=Decimal('20.00'), stock_quantity=5, status=Product.Status.PUBLISHED)
        return customer, seller, p1, p2

    def test_checkout_idempotency_and_stock_deduction(self, setup_checkout):
        customer, seller, p1, p2 = setup_checkout
        client = APIClient()
        client.force_authenticate(user=customer)

        # Add to cart
        client.post('/api/cart/items/', {'product_id': p1.id, 'quantity': 2}, format='json')
        client.post('/api/cart/items/', {'product_id': p2.id, 'quantity': 1}, format='json')

        idem_key = str(uuid.uuid4())
        checkout_payload = {
            'contact_name': 'Buyer Two',
            'contact_phone': '+970591234567',
            'delivery_address': 'Main Street 123',
        }

        # 1. Checkout success (201)
        resp = client.post('/api/checkout/', checkout_payload, format='json', HTTP_IDEMPOTENCY_KEY=idem_key)
        assert resp.status_code == 201
        order_data = resp.json()
        assert order_data['order_number'].startswith('SQ-')
        assert order_data['status'] == 'pending'
        assert order_data['subtotal'] == '50.00'
        assert order_data['total'] == '50.00'
        assert len(order_data['items']) == 2

        # Verify stock deducted
        p1.refresh_from_db()
        p2.refresh_from_db()
        assert p1.stock_quantity == 8  # 10 - 2
        assert p2.stock_quantity == 4  # 5 - 1

        # Verify cart emptied
        cart_resp = client.get('/api/cart/')
        assert len(cart_resp.json()['items']) == 0

        # 2. Idempotent repeat with same key returns 200 with zero side effects
        resp_repeat = client.post('/api/checkout/', checkout_payload, format='json', HTTP_IDEMPOTENCY_KEY=idem_key)
        assert resp_repeat.status_code == 200
        assert resp_repeat.json()['order_number'] == order_data['order_number']

        p1.refresh_from_db()
        assert p1.stock_quantity == 8  # Not deducted again

    def test_customer_cancel_restores_stock(self, setup_checkout):
        customer, seller, p1, _ = setup_checkout
        client = APIClient()
        client.force_authenticate(user=customer)

        client.post('/api/cart/items/', {'product_id': p1.id, 'quantity': 3}, format='json')
        resp = client.post('/api/checkout/', {
            'contact_name': 'Buyer Two',
            'contact_phone': '+970591234567',
            'delivery_address': 'Main Street 123',
        }, format='json', HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()))
        assert resp.status_code == 201
        order_id = resp.json()['id']

        p1.refresh_from_db()
        assert p1.stock_quantity == 7

        # Customer cancel
        cancel_resp = client.post(f'/api/orders/{order_id}/cancel/')
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()['status'] == 'cancelled'

        p1.refresh_from_db()
        assert p1.stock_quantity == 10  # Restored!

        # Repeated cancel returns 400 already_cancelled
        cancel_again = client.post(f'/api/orders/{order_id}/cancel/')
        assert cancel_again.status_code == 400
        assert cancel_again.json()['error']['code'] == 'already_cancelled'
