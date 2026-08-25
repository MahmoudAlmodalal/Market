"""The handler branches `test_errors.py` doesn't reach through a view.

The `APIError` branch is covered end-to-end there; these are the other three.
"""
from django.http import Http404
from rest_framework.exceptions import NotAuthenticated, Throttled, ValidationError

from common.exceptions import exception_handler


def envelope(exc):
    response = exception_handler(exc, {})
    return response.status_code, response.data['error']


def test_validation_error_puts_field_errors_in_details():
    status, error = envelope(ValidationError({'price': ['Must be >= 0.']}))
    assert status == 400
    assert error['code'] == 'validation_error'
    assert 'price' in error['details']


def test_drf_exception_uses_its_own_code():
    status, error = envelope(NotAuthenticated())
    assert status == 401
    assert error['code'] == 'not_authenticated'
    assert error['details'] == {}


def test_throttled_maps_to_rate_limited():
    assert envelope(Throttled(wait=60))[1]['code'] == 'rate_limited'


def test_http404_has_no_drf_attributes_and_still_renders():
    status, error = envelope(Http404('nope'))
    assert status == 404
    assert error['code'] == 'not_found'
