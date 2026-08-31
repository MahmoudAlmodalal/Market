import io
from decimal import Decimal
from PIL import Image
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from accounts.models import SellerProfile, User
from catalog.models import Category, Product, ProductImage
from catalog.services import stock_state


def create_test_image(color=(200, 100, 100), fmt='JPEG'):
    file_io = io.BytesIO()
    image = Image.new('RGB', (100, 100), color=color)
    image.save(file_io, format=fmt)
    ext = 'jpg' if fmt == 'JPEG' else fmt.lower()
    return SimpleUploadedFile(f"test.{ext}", file_io.getvalue(), content_type=f"image/{ext}")


@pytest.mark.django_db
class TestCatalog:
    @pytest.fixture
    def seller_user(self):
        user = User.objects.create_user(email='seller1@test.com', name='Seller One', password='password123', role=User.Role.SELLER)
        SellerProfile.objects.create(user=user, business_name='Seller Shop')
        return user

    @pytest.fixture
    def category(self):
        return Category.objects.create(name='Soaps', slug='soaps')

    def test_stock_state_helper(self):
        assert stock_state(0) == 'out_of_stock'
        assert stock_state(-1) == 'out_of_stock'
        assert stock_state(3) == 'low_stock'
        assert stock_state(5) == 'low_stock'
        assert stock_state(6) == 'available'
        assert stock_state(50) == 'available'

    def test_public_catalog_list_and_detail(self, seller_user, category):
        product = Product.objects.create(
            seller=seller_user.sellerprofile,
            category=category,
            name='Lavender Soap',
            price=Decimal('20.00'),
            stock_quantity=4,
            status=Product.Status.PUBLISHED,
        )
        ProductImage.objects.create(product=product, image=create_test_image(), sort_order=0)

        client = APIClient()
        # List
        resp = client.get('/api/products/')
        assert resp.status_code == 200
        results = resp.json()['results']
        assert len(results) >= 1
        item = [r for r in results if r['id'] == product.id][0]
        assert item['name'] == 'Lavender Soap'
        assert item['price'] == '20.00'
        assert item['stock_state'] == 'low_stock'
        assert 'stock_quantity' not in item  # Never exposed to public

        # Detail - available_quantity exposed because <= threshold (4 <= 5)
        detail_resp = client.get(f'/api/products/{product.id}/')
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        assert detail_data['available_quantity'] == 4

        # When stock > 5, available_quantity is omitted
        product.stock_quantity = 10
        product.save()
        detail_resp2 = client.get(f'/api/products/{product.id}/')
        assert 'available_quantity' not in detail_resp2.json()

    def test_draft_product_hidden_from_public_visible_to_owner(self, seller_user, category):
        draft_prod = Product.objects.create(
            seller=seller_user.sellerprofile,
            category=category,
            name='Draft Soap',
            price=Decimal('15.00'),
            stock_quantity=5,
            status=Product.Status.DRAFT,
        )
        client = APIClient()
        assert client.get(f'/api/products/{draft_prod.id}/').status_code == 404

        # Owner can view
        client.force_authenticate(user=seller_user)
        assert client.get(f'/api/products/{draft_prod.id}/').status_code == 200

    def test_seller_crud_and_publish(self, seller_user, category):
        client = APIClient()
        client.force_authenticate(user=seller_user)

        # Create
        create_resp = client.post('/api/seller/products/', {
            'name': 'Artisan Candle',
            'description': 'Handmade wax candle',
            'price': '30.00',
            'stock_quantity': 10,
            'category_id': category.id,
        }, format='json')
        assert create_resp.status_code == 201
        prod_id = create_resp.json()['id']
        assert create_resp.json()['status'] == 'draft'

        # Publish without image fails (400)
        pub_fail = client.post(f'/api/seller/products/{prod_id}/publish/')
        assert pub_fail.status_code == 400

        # Upload image
        img_resp = client.post(f'/api/seller/products/{prod_id}/images/', {
            'image': create_test_image(fmt='JPEG'),
        }, format='multipart')
        assert img_resp.status_code == 201
        assert img_resp.json()['sort_order'] == 0

        # Publish succeeds
        pub_ok = client.post(f'/api/seller/products/{prod_id}/publish/')
        assert pub_ok.status_code == 200
        assert pub_ok.json()['status'] == 'published'

        # Soft delete archives product
        del_resp = client.delete(f'/api/seller/products/{prod_id}/')
        assert del_resp.status_code == 204
        prod = Product.objects.get(id=prod_id)
        assert prod.status == Product.Status.ARCHIVED
