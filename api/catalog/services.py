from django.conf import settings


def stock_state(stock_quantity: int) -> str:
    """Derive stock_state from quantity and system threshold (FR-09)."""
    threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)
    if stock_quantity <= 0:
        return 'out_of_stock'
    if stock_quantity <= threshold:
        return 'low_stock'
    return 'available'
