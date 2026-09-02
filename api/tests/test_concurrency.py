import threading
import uuid
from decimal import Decimal
import pytest
from django.db import connection
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from catalog.models import Category, Product


@pytest.mark.django_db(transaction=True)
def test_concurrent_checkout_race_t30():
    """
    T-30 Concurrency Test: Two concurrent checkout threads attempting to buy the
    last remaining unit (stock=1). Exactly one must succeed (201) and one must fail
    with 409 insufficient_stock. Final stock must be 0, never negative.
    """
    seller_user = User.objects.create_user(email='seller_race@test.com', name='Seller Race', password='SecurePass123!', role=User.Role.SELLER)
    seller = SellerProfile.objects.create(user=seller_user, business_name='Race Shop')
    cat = Category.objects.create(name='Limited Items', slug='limited')
    product = Product.objects.create(seller=seller, category=cat, name='Rare Antique', price=Decimal('100.00'), stock_quantity=1, status=Product.Status.PUBLISHED)

    cust1 = User.objects.create_user(email='buyer_race1@test.com', name='Buyer 1', password='SecurePass123!', role=User.Role.CUSTOMER)
    cust2 = User.objects.create_user(email='buyer_race2@test.com', name='Buyer 2', password='SecurePass123!', role=User.Role.CUSTOMER)

    # Set up carts
    client1 = APIClient()
    client1.force_authenticate(user=cust1)
    client1.post('/api/cart/items/', {'product_id': product.id, 'quantity': 1}, format='json')

    client2 = APIClient()
    client2.force_authenticate(user=cust2)
    client2.post('/api/cart/items/', {'product_id': product.id, 'quantity': 1}, format='json')

    results = []

    def perform_checkout(client, user):
        connection.close()  # Force new DB connection for thread
        resp = client.post(
            '/api/checkout/',
            {
                'contact_name': user.name,
                'contact_phone': '+970591234567',
                'delivery_address': 'Gaza Center',
            },
            format='json',
            HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()),
        )
        results.append(resp.status_code)

    t1 = threading.Thread(target=perform_checkout, args=(client1, cust1))
    t2 = threading.Thread(target=perform_checkout, args=(client2, cust2))

    t1.start()
    t2.start()
    t1.join()
    t2.join()

    # One 201, one 409
    assert sorted(results) == [201, 409]

    product.refresh_from_db()
    assert product.stock_quantity == 0
