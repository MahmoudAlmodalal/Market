"""Wraps every non-2xx into the API.md §1.2 envelope."""
from rest_framework.exceptions import Throttled, ValidationError
from rest_framework.views import exception_handler as drf_handler

from common.errors import APIError, RATE_LIMITED, VALIDATION_ERROR


def exception_handler(exc, context):
    response = drf_handler(exc, context)
    if response is None:
        return None  # unhandled -> Django's handler500

    if isinstance(exc, APIError):
        code, message, details = exc.code, exc.message, exc.details
    elif isinstance(exc, ValidationError):
        code, message, details = VALIDATION_ERROR, 'Validation failed.', exc.detail
    else:
        # Http404 / Django's PermissionDenied reach here already translated by
        # drf_handler, but the raw exc has no DRF attributes — read the response.
        detail = response.data.get('detail', '') if isinstance(response.data, dict) else ''
        code = RATE_LIMITED if isinstance(exc, Throttled) else getattr(
            detail, 'code', getattr(exc, 'default_code', 'error'))
        message, details = str(detail), {}

    response.data = {'error': {'code': code, 'message': message, 'details': details}}
    return response
