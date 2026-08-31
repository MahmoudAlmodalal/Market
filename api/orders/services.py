from decimal import Decimal
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone

from catalog.models import Product
from accounts.models import SellerProfile
from orders.models import Order, OrderNumberCounter


def clamp_available(stock_quantity: int):
    threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)
    if stock_quantity <= threshold:
        return max(0, stock_quantity)
    return None


def generate_order_number() -> str:
    """Generate sequential SQ-{YYYY}-{seq} using row lock on OrderNumberCounter (TK-20)."""
    # ponytail: one counter row locked per checkout; real Postgres sequence if that row goes hot
    current_year = timezone.now().year
    counter, _ = OrderNumberCounter.objects.select_for_update().get_or_create(
        year=current_year,
        defaults={'last_seq': 1000},
    )
    counter.last_seq += 1
    counter.save(update_fields=['last_seq'])
    return f"SQ-{current_year}-{counter.last_seq}"


def restore_stock(order: Order) -> None:
    """Restores stock for all items in an order once, guarded by stock_restored (N-08, TK-24)."""
    order = Order.objects.select_for_update().get(id=order.id)
    if order.stock_restored:
        return

    for item in order.items.all():
        Product.objects.filter(id=item.product_id).update(
            stock_quantity=models.F('stock_quantity') + item.quantity
        )

    order.stock_restored = True
    order.save(update_fields=['stock_restored', 'updated_at'])


def revalidate_cart(cart, locked_products_map=None):
    """
    Revalidates cart items against current product status, inventory, and price drift (TK-18).
    Returns (annotated_items, has_blocking_issues).
    """
    items = list(cart.items.select_related('product', 'product__seller').all())
    annotated_items = []
    has_blocking_issues = False

    for item in items:
        product = locked_products_map.get(item.product_id) if locked_products_map else item.product
        issues = []

        # 1. Product existence & published & active seller
        if (
            not product
            or product.status != Product.Status.PUBLISHED
            or product.seller.status != SellerProfile.Status.ACTIVE
        ):
            issues.append({
                'code': 'product_unavailable',
                'message': 'Product is no longer available.',
                'blocking': True,
            })
            has_blocking_issues = True
        else:
            # 2. Stock check
            if item.quantity > product.stock_quantity:
                details = {}
                clamped = clamp_available(product.stock_quantity)
                if clamped is not None:
                    details['available'] = clamped
                issues.append({
                    'code': 'insufficient_stock',
                    'message': f"Only {product.stock_quantity} available.",
                    'details': details,
                    'blocking': True,
                })
                has_blocking_issues = True

            # 3. Price drift check
            if item.unit_price_at_add != product.price:
                issues.append({
                    'code': 'price_changed',
                    'message': f"Price changed from {item.unit_price_at_add} to {product.price}.",
                    'details': {
                        'old_price': str(item.unit_price_at_add),
                        'new_price': str(product.price),
                    },
                    'blocking': True,
                })
                has_blocking_issues = True

        annotated_items.append({
            'cart_item': item,
            'product': product,
            'issues': issues,
        })

    return annotated_items, has_blocking_issues
