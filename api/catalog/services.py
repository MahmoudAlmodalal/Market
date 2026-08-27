from django.conf import settings


def stock_state(stock_quantity):
    if stock_quantity <= 0:
        return 'out_of_stock'
    if stock_quantity <= settings.LOW_STOCK_THRESHOLD:
        return 'low_stock'
    return 'available'


def clamped_available(stock_quantity):
    return stock_quantity if stock_quantity <= settings.LOW_STOCK_THRESHOLD else None
