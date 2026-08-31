import io
from decimal import Decimal
from PIL import Image
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import SellerProfile, User
from catalog.models import Category, Product, ProductImage


def create_placeholder_image(color=(100, 150, 200), text="Souqi"):
    file_io = io.BytesIO()
    image = Image.new('RGB', (400, 400), color=color)
    image.save(file_io, format='PNG')
    return ContentFile(file_io.getvalue(), name=f"{text.lower().replace(' ', '_')}.png")


class Command(BaseCommand):
    help = 'Seeds demo data for Souqi marketplace (TK-38).'

    def handle(self, *args, **options):
        with transaction.atomic():
            # 1. Admin
            admin_user, _ = User.objects.get_or_create(
                email='admin@souqi.com',
                defaults={
                    'name': 'Souqi Admin',
                    'role': User.Role.ADMIN,
                    'is_staff': True,
                    'is_superuser': True,
                    'status': User.Status.ACTIVE,
                },
            )
            admin_user.set_password('password123')
            admin_user.save()

            # 2. Customers
            customers = [
                ('omar@souqi.com', 'Omar Nasser'),
                ('layla@souqi.com', 'Layla Khalil'),
            ]
            for email, name in customers:
                cust, _ = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'name': name,
                        'role': User.Role.CUSTOMER,
                        'status': User.Status.ACTIVE,
                    },
                )
                cust.set_password('password123')
                cust.save()

            # 3. Sellers
            sellers_data = [
                ('sara@souqi.com', 'Sara Handmade', 'Sara Al-Najjar', 'Artisan organic soaps and bath essentials crafted with love in Gaza.'),
                ('gaza.crafts@souqi.com', 'Gaza Crafts', 'Tariq Mansour', 'Traditional Palestinian embroidery, ceramic mugs, and handcrafted clay pottery.'),
                ('artisan@souqi.com', 'Artisan Olive Wood', 'Ibrahim Salameh', 'Exquisite carved olive wood kitchenware and decorative home items.'),
            ]
            seller_profiles = {}
            for email, biz_name, contact_name, desc in sellers_data:
                seller_user, _ = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'name': contact_name,
                        'role': User.Role.SELLER,
                        'status': User.Status.ACTIVE,
                    },
                )
                seller_user.set_password('password123')
                seller_user.save()

                profile, _ = SellerProfile.objects.get_or_create(
                    user=seller_user,
                    defaults={
                        'business_name': biz_name,
                        'description': desc,
                        'status': SellerProfile.Status.ACTIVE,
                    },
                )
                seller_profiles[biz_name] = profile

            # 4. Categories
            categories_data = [
                ('Bath & Body', 'bath-body'),
                ('Home & Living', 'home-living'),
                ('Ceramics & Pottery', 'ceramics-pottery'),
                ('Jewelry & Accessories', 'jewelry-accessories'),
            ]
            categories = {}
            for cat_name, cat_slug in categories_data:
                cat, _ = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={
                        'slug': cat_slug,
                        'status': Category.Status.ACTIVE,
                    },
                )
                categories[cat_name] = cat

            # 5. 12 Products (with placeholder images, stock 5 and stock 0 included)
            products_data = [
                ('Natural Lavender Soap', 'Sara Handmade', 'Bath & Body', '25.00', 15, 'Cold-pressed natural lavender soap with organic essential oils.'),
                ('Olive Oil Soap Bar', 'Sara Handmade', 'Bath & Body', '18.50', 5, 'Traditional pure Palestinian olive oil soap with gentle moisturizing qualities.'), # low stock (5)
                ('Dead Sea Mineral Body Scrub', 'Sara Handmade', 'Bath & Body', '45.00', 0, 'Exfoliating salt scrub enriched with natural Dead Sea minerals.'), # out of stock (0)
                ('Organic Herbal Bath Salts', 'Sara Handmade', 'Bath & Body', '30.00', 20, 'Soothing bath soak blend with dried chamomile and rose petals.'),

                ('Handmade Ceramic Coffee Cup', 'Gaza Crafts', 'Ceramics & Pottery', '35.00', 12, 'Hand-thrown earthenware coffee mug with traditional floral glaze.'),
                ('Decorative Clay Serving Bowl', 'Gaza Crafts', 'Ceramics & Pottery', '65.00', 8, 'Large hand-painted ceramic serving dish for dining and display.'),
                ('Embroidered Tatreez Cushion Cover', 'Gaza Crafts', 'Home & Living', '80.00', 10, 'Authentic hand-embroidered Palestinian tatreez cushion cover.'),
                ('Handwoven Table Runner', 'Gaza Crafts', 'Home & Living', '55.00', 14, 'Heritage patterned runner woven on traditional looms.'),

                ('Carved Olive Wood Salad Bowls Set', 'Artisan Olive Wood', 'Home & Living', '120.00', 6, 'Set of two hand-carved olive wood bowls showcasing rich grain patterns.'),
                ('Olive Wood Coasters (Set of 6)', 'Artisan Olive Wood', 'Home & Living', '40.00', 25, 'Rustic drink coasters made from seasoned natural olive branches.'),
                ('Handmade Olive Wood Cutting Board', 'Artisan Olive Wood', 'Home & Living', '75.00', 9, 'Heavy-duty organic culinary chopping block treated with food-safe oil.'),
                ('Traditional Olive Wood Rosary / Misbaha', 'Artisan Olive Wood', 'Jewelry & Accessories', '28.00', 30, 'Smoothly polished 33-bead olive wood prayer beads.'),
            ]

            colors = [
                (140, 180, 220),
                (180, 210, 160),
                (230, 190, 150),
                (210, 170, 210),
            ]

            for idx, (p_name, s_biz, c_name, price, stock, desc) in enumerate(products_data):
                seller_prof = seller_profiles[s_biz]
                category_obj = categories[c_name]

                product, created = Product.objects.get_or_create(
                    seller=seller_prof,
                    name=p_name,
                    defaults={
                        'category': category_obj,
                        'price': Decimal(price),
                        'stock_quantity': stock,
                        'description': desc,
                        'status': Product.Status.PUBLISHED,
                    },
                )
                if not created:
                    product.price = Decimal(price)
                    product.stock_quantity = stock
                    product.status = Product.Status.PUBLISHED
                    product.save()

                if not product.images.exists():
                    img_file = create_placeholder_image(color=colors[idx % len(colors)], text=p_name)
                    ProductImage.objects.create(
                        product=product,
                        image=img_file,
                        sort_order=0,
                    )

        self.stdout.write(self.style.SUCCESS("Successfully seeded demo database."))
        self.stdout.write("==================================================")
        self.stdout.write("Demo Accounts (Password: password123):")
        self.stdout.write("  Admin:    admin@souqi.com")
        self.stdout.write("  Customer: omar@souqi.com, layla@souqi.com")
        self.stdout.write("  Sellers:  sara@souqi.com, gaza.crafts@souqi.com, artisan@souqi.com")
        self.stdout.write("==================================================")
