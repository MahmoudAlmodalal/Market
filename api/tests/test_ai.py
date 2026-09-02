from decimal import Decimal
import pytest
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from ai.models import AIContentSuggestion
from catalog.models import Category, Product


@pytest.mark.django_db
class TestAI:
    @pytest.fixture
    def setup_seller_product(self):
        user = User.objects.create_user(email='aiseller@test.com', name='AI Seller', password='password123', role=User.Role.SELLER)
        seller = SellerProfile.objects.create(user=user, business_name='AI Soap Co')
        cat = Category.objects.create(name='Bath & Body', slug='bath-body')
        prod = Product.objects.create(seller=seller, category=cat, name='Raw Soap', description='Raw desc', price=Decimal('15.00'), stock_quantity=10)
        return user, prod, cat

    def test_suggest_description_and_accept(self, setup_seller_product):
        user, prod, cat = setup_seller_product
        client = APIClient()
        client.force_authenticate(user=user)

        # 1. Suggest description
        resp = client.post('/api/ai/suggest-description/', {
            'name': 'Lavender Organic Soap',
            'category_id': cat.id,
            'attributes': {'weight': '100g'},
        }, format='json')
        assert resp.status_code == 200
        data = resp.json()
        assert data['status'] == 'pending'
        assert 'output' in data
        suggestion_id = data['suggestion_id']

        # 2. Accept suggestion on product
        accept_resp = client.post(f'/api/ai/suggestions/{suggestion_id}/accept/', {
            'product_id': prod.id,
        }, format='json')
        assert accept_resp.status_code == 200
        assert accept_resp.json()['review_status'] == 'accepted'

        # Verify product values updated and status remains draft (AI-08)
        prod.refresh_from_db()
        assert 'Lavender' in prod.name or 'Natural' in prod.name
        assert prod.status == Product.Status.DRAFT

    def test_moderation_cannot_be_accepted(self, setup_seller_product):
        user, prod, _ = setup_seller_product
        client = APIClient()
        client.force_authenticate(user=user)

        mod_resp = client.post('/api/ai/moderate/', {'product_id': prod.id}, format='json')
        assert mod_resp.status_code == 200
        suggestion_id = mod_resp.json()['suggestion_id']

        # Attempting to accept moderation fails with 400
        accept_resp = client.post(f'/api/ai/suggestions/{suggestion_id}/accept/', {'product_id': prod.id}, format='json')
        assert accept_resp.status_code == 400

        # Rejecting succeeds
        reject_resp = client.post(f'/api/ai/suggestions/{suggestion_id}/reject/')
        assert reject_resp.status_code == 200
        assert reject_resp.json()['review_status'] == 'rejected'
