from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import F

from catalog.models import Product
from catalog.services import clamped_available, stock_state
from orders.models import Cart, Order, OrderNumberCounter


def cart_seller(cart):
    item = cart.items.select_related('product__seller').first()
    return item.product.seller if item else None


def revalidate(cart, locked_products=None):
    locked = {p.id: p for p in (locked_products or [])}
    lines = list(cart.items.select_related('product').order_by('created_at', 'id'))
    issues_by_line = {}
    has_blocking = False
    for line in lines:
        product = locked.get(line.product_id, line.product)
        issues = []
        if product is None:
            issues.append({'code': 'product_unavailable'})
        elif product.status != Product.Status.PUBLISHED:
            issues.append({'code': 'product_unavailable'})
        else:
            if line.quantity > product.stock_quantity:
                issue = {'code': 'insufficient_stock'}
                available = clamped_available(product.stock_quantity)
                if available is not None:
                    issue['available'] = available
                issues.append(issue)
            if product.price != line.unit_price_at_add:
                issues.append({'code': 'price_changed', 'old_price': str(line.unit_price_at_add), 'new_price': str(product.price)})
        if issues:
            issues_by_line[line.id] = issues
            has_blocking = True
    return lines, issues_by_line, has_blocking


def next_order_number():
    year = datetime.utcnow().year
    counter, _ = OrderNumberCounter.objects.select_for_update().get_or_create(year=year, defaults={'last_seq': 1000})
    counter.last_seq += 1
    counter.save(update_fields=['last_seq'])
    return f'SQ-{year}-{counter.last_seq}'


@transaction.atomic
def restore_stock(order):
    locked_order = Order.objects.select_for_update().get(pk=order.pk)
    if locked_order.stock_restored:
        return locked_order
    for item in locked_order.items.all():
        Product.objects.filter(pk=item.product_id).update(stock_quantity=F('stock_quantity') + item.quantity)
    locked_order.stock_restored = True
    locked_order.save(update_fields=['stock_restored'])
    return locked_order
