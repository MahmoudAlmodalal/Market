import base64
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from accounts.models import SellerProfile, User
from catalog.models import Category, Product, ProductImage


PLACEHOLDER_PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')


class Command(BaseCommand):
    help = 'Create or update the deterministic Souqi demonstration dataset.'

    def handle(self, *args, **options):
        categories = [self.category(name) for name in ('Bath & Body', 'Home', 'Food', 'Accessories')]
        sellers = []
        for index, name in enumerate(('Sara Handmade', 'Omar Goods', 'Noura Market'), 1):
            user, _ = User.objects.get_or_create(email=f'seller{index}@souqi.example', defaults={'name': name, 'role': User.Role.SELLER})
            user.name, user.role, user.status = name, User.Role.SELLER, User.Status.ACTIVE
            user.set_password('SellerPass123!')
            user.save()
            profile, _ = SellerProfile.objects.get_or_create(user=user, defaults={'business_name': name})
            profile.business_name, profile.status = name, SellerProfile.Status.ACTIVE
            profile.save()
            sellers.append(profile)
        for index, name in enumerate(('Omar Customer', 'Lina Customer'), 1):
            user, _ = User.objects.get_or_create(email=f'customer{index}@souqi.example', defaults={'name': name, 'role': User.Role.CUSTOMER})
            user.name, user.role, user.status = name, User.Role.CUSTOMER, User.Status.ACTIVE
            user.set_password('CustomerPass123!')
            user.save()
        admin, _ = User.objects.get_or_create(email='admin@souqi.example', defaults={'name': 'Souqi Admin', 'role': User.Role.ADMIN, 'is_staff': True, 'is_superuser': True})
        admin.name, admin.role, admin.status, admin.is_staff, admin.is_superuser = 'Souqi Admin', User.Role.ADMIN, User.Status.ACTIVE, True, True
        admin.set_password('AdminPass123!')
        admin.save()
        for index in range(12):
            product, _ = Product.objects.get_or_create(name=f'Demo Product {index + 1}', defaults={'seller': sellers[index % 3], 'category': categories[index % 4], 'description': f'Demo product {index + 1} for the Souqi marketplace.', 'price': f'{10 + index * 2}.00', 'stock_quantity': 0 if index == 11 else (5 if index == 0 else 20), 'status': Product.Status.PUBLISHED})
            product.seller = sellers[index % 3]
            product.category = categories[index % 4]
            product.status = Product.Status.PUBLISHED
            product.save()
            if not product.images.exists():
                product_image = ProductImage(product=product, sort_order=0)
                product_image.image.save(f'demo-{index + 1}.png', ContentFile(PLACEHOLDER_PNG), save=True)
        self.stdout.write(self.style.SUCCESS('Demo data is ready.'))
        self.stdout.write('seller1@souqi.example / SellerPass123!')
        self.stdout.write('customer1@souqi.example / CustomerPass123!')
        self.stdout.write('admin@souqi.example / AdminPass123!')

    def category(self, name):
        category, _ = __import__('catalog.models', fromlist=['Category']).Category.objects.get_or_create(name=name)
        category.status = 'active'
        category.save()
        return category
