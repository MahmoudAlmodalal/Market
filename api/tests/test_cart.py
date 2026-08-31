from decimal import Decimal
import pytest
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from catalog.models import Category, Product


@pytest.mark.django_db
class TestCart:
    @pytest.fixture
    def setup_data(self):
        customer = User.objects.create_user(email='buyer@test.com', name='Buyer', password='password123', role=User.Role.CUSTOMER)
        seller1_user = User.objects.create_user(email='seller_a@test.com', name='Seller A', password='password123', role=User.Role.SELLER)
        seller1 = SellerProfile.objects.create(user=seller1_user, business_name='Seller Shop A')

        seller2_user = User.objects.create_user(email='seller_b@test.com', name='Seller B', password='password123', role=User.Role.SELLER)
        seller2 = SellerProfile.objects.create(user=seller2_user, business_name='Seller Shop B')

        cat = Category.objects.create(name='General', slug='general')

        p1 = Product.objects.create(seller=seller1, category=cat, name='Product 1', price=Decimal('10.00'), stock_quantity=10, status=Product.Status.PUBLISHED)
        p2 = Product.objects.create(seller=seller1, category=cat, name='Product 2', price=Decimal('25.00'), stock_quantity=5, status=Product.Status.PUBLISHED)
        p_other = Product.objects.create(seller=seller2, category=cat, name='Other Seller Prod', price=Decimal('15.00'), stock_quantity=10, status=Product.Status.PUBLISHED)

        return customer, p1, p2, p_other

    def test_empty_cart_bootstrap(self, setup_data):
        customer, _, _, _ = setup_data
        client = APIClient()
        client.force_authenticate(user=customer)

        resp = client.get('/api/cart/')
        assert resp.status_code == 200
        data = resp.json()
        assert data['items'] == []
        assert data['subtotal'] == '0.00'

    def test_add_item_and_replace_quantity(self, setup_data):
        customer, p1, p2, _ = setup_data
        client = APIClient()
        client.force_authenticate(user=customer)

        add_resp = client.post('/api/cart/items/', {'product_id': p1.id, 'quantity': 2}, format='json')
        assert add_resp.status_code == 201
        data = add_resp.json()
        assert len(data['items']) == 1
        assert data['items'][0]['quantity'] == 2
        assert data['subtotal'] == '20.00'

        # Adding same product replaces quantity (replace semantics FR-18)
        add_resp2 = client.post('/api/cart/items/', {'product_id': p1.id, 'quantity': 3}, format='json')
        assert add_resp2.status_code == 201
        data2 = add_resp2.json()
        assert len(data2['items']) == 1
        assert data2['items'][0]['quantity'] == 3
        assert data2['subtotal'] == '30.00'

    def test_multi_seller_cart_rejected(self, setup_data):
        customer, p1, _, p_other = setup_data
        client = APIClient()
        client.force_authenticate(user=customer)

        client.post('/api/cart/items/', {'product_id': p1.id, 'quantity': 1}, format='json')

        # Adding from another seller returns 409 multi_seller_cart
        resp = client.post('/api/cart/items/', {'product_id': p_other.id, 'quantity': 1}, format='json')
        assert resp.status_code == 409
        err = resp.json()['error']
        assert err['code'] == 'multi_seller_cart'
        assert 'current_seller' in err['details']

    def test_cart_item_insufficient_stock(self, setup_data):
        customer, p1, _, _ = setup_data
        client = APIClient()
        client.force_authenticate(user=customer)

        resp = client.post('/api/cart/items/', {'product_id': p1.id, 'quantity': 999}, format='json')
        assert resp.status_code == 400
        assert resp.json()['error']['code'] == 'insufficient_stock'
