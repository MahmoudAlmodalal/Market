import uuid
from decimal import Decimal
import pytest
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from catalog.models import Category, Product


@pytest.mark.django_db
def test_full_marketplace_lifecycle_e2e():
    """
    E2E Journey:
    1. Seller registers and receives JWT
    2. Seller creates product, uploads image, and publishes it
    3. Buyer browses catalog and sees published product
    4. Buyer registers and adds product to cart
    5. Buyer completes checkout with Idempotency-Key
    6. Seller views order and transitions it to confirmed -> preparing -> ready -> completed
    7. Admin views metrics and sees order in completed count
    """
    client = APIClient()

    # 1. Seller registers
    seller_resp = client.post('/api/auth/register/', {
        'email': 'artisan.e2e@souqi.com',
        'name': 'Artisan E2E',
        'password': 'StrongPassword123!',
        'role': 'seller',
    }, format='json')
    assert seller_resp.status_code == 201
    seller_token = seller_resp.json()['access']

    # 2. Seller creates product & publishes
    cat = Category.objects.create(name='Handcrafts', slug='handcrafts')
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {seller_token}")

    prod_resp = client.post('/api/seller/products/', {
        'name': 'Embroidered Purse',
        'description': 'Fine silk handmade purse',
        'price': '45.00',
        'stock_quantity': 8,
        'category_id': cat.id,
    }, format='json')
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()['id']

    # Attach image
    import io
    from PIL import Image
    from django.core.files.uploadedfile import SimpleUploadedFile
    f_io = io.BytesIO()
    Image.new('RGB', (50, 50), color=(120, 200, 150)).save(f_io, format='PNG')
    img_file = SimpleUploadedFile('purse.png', f_io.getvalue(), content_type='image/png')
    client.post(f'/api/seller/products/{prod_id}/images/', {'image': img_file}, format='multipart')

    # Publish
    pub_resp = client.post(f'/api/seller/products/{prod_id}/publish/')
    assert pub_resp.status_code == 200

    # 3. Public catalog browse
    client.credentials()  # Clear auth
    cat_resp = client.get('/api/products/')
    assert cat_resp.status_code == 200
    assert any(p['id'] == prod_id for p in cat_resp.json()['results'])

    # 4. Buyer registers & adds to cart
    buyer_resp = client.post('/api/auth/register/', {
        'email': 'buyer.e2e@souqi.com',
        'name': 'Buyer E2E',
        'password': 'StrongPassword123!',
        'role': 'customer',
    }, format='json')
    assert buyer_resp.status_code == 201
    buyer_token = buyer_resp.json()['access']

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {buyer_token}")
    cart_add = client.post('/api/cart/items/', {'product_id': prod_id, 'quantity': 2}, format='json')
    assert cart_add.status_code == 201
    assert cart_add.json()['subtotal'] == '90.00'

    # 5. Checkout
    checkout_resp = client.post('/api/checkout/', {
        'contact_name': 'Buyer E2E',
        'contact_phone': '+970591234567',
        'delivery_address': 'Al-Rimal, Gaza',
    }, format='json', HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()))
    assert checkout_resp.status_code == 201
    order_id = checkout_resp.json()['id']
    assert checkout_resp.json()['total'] == '90.00'

    # 6. Seller manages order fulfillment
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {seller_token}")
    t1 = client.post(f'/api/seller/orders/{order_id}/transition/', {'to_status': 'confirmed'}, format='json')
    assert t1.status_code == 200
    t2 = client.post(f'/api/seller/orders/{order_id}/transition/', {'to_status': 'preparing'}, format='json')
    assert t2.status_code == 200
    t3 = client.post(f'/api/seller/orders/{order_id}/transition/', {'to_status': 'ready'}, format='json')
    assert t3.status_code == 200
    t4 = client.post(f'/api/seller/orders/{order_id}/transition/', {'to_status': 'completed'}, format='json')
    assert t4.status_code == 200
    assert t4.json()['status'] == 'completed'

    # 7. Admin verifies metrics
    admin_user = User.objects.create_superuser(email='admin.e2e@souqi.com', name='Admin', password='StrongPassword123!')
    client.force_authenticate(user=admin_user)
    metrics_resp = client.get('/api/admin/metrics/')
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert metrics['orders_by_status']['completed'] >= 1
