import pytest
from common.errors import APIError
from orders.state import assert_transition, ALLOWED_TRANSITIONS


def test_order_state_machine_valid_transitions():
    # Customer transitions
    assert_transition('pending', 'cancelled', 'customer')
    assert_transition('confirmed', 'cancelled', 'customer')

    # Seller transitions
    assert_transition('pending', 'confirmed', 'seller')
    assert_transition('confirmed', 'preparing', 'seller')
    assert_transition('preparing', 'ready', 'seller')
    assert_transition('ready', 'completed', 'seller')
    assert_transition('ready', 'cancelled', 'seller')

    # Admin transitions
    assert_transition('pending', 'confirmed', 'admin')
    assert_transition('preparing', 'cancelled', 'admin')


def test_order_state_machine_forbidden_transitions():
    # Customer cannot advance order
    with pytest.raises(APIError) as exc_info:
        assert_transition('pending', 'confirmed', 'customer')
    assert exc_info.value.code == 'invalid_transition'

    # Cannot transition from terminal states
    with pytest.raises(APIError):
        assert_transition('completed', 'cancelled', 'seller')

    with pytest.raises(APIError):
        assert_transition('cancelled', 'pending', 'admin')
