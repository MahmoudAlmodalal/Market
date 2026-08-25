"""One constant per code in API.md §1.4, plus the base exception that carries them."""
from rest_framework.exceptions import APIException

VALIDATION_ERROR = 'validation_error'
INVALID_CREDENTIALS = 'invalid_credentials'
ACCOUNT_SUSPENDED = 'account_suspended'
INVALID_QUANTITY = 'invalid_quantity'
INSUFFICIENT_STOCK = 'insufficient_stock'
PRODUCT_NOT_PURCHASABLE = 'product_not_purchasable'
MULTI_SELLER_CART = 'multi_seller_cart'
EMPTY_CART = 'empty_cart'
CART_HAS_ISSUES = 'cart_has_issues'
MISSING_IDEMPOTENCY_KEY = 'missing_idempotency_key'
INVALID_TRANSITION = 'invalid_transition'
ALREADY_CANCELLED = 'already_cancelled'
AI_UNAVAILABLE = 'ai_unavailable'
RATE_LIMITED = 'rate_limited'


class APIError(APIException):
    """Raise with an API.md code; `common.exceptions` renders the envelope."""

    def __init__(self, code, message, details=None, status_code=400):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(message)
