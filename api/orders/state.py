from common.errors import APIError, INVALID_TRANSITION


ALLOWED_TRANSITIONS = {
    ('pending', 'confirmed'): {'seller', 'admin'},
    ('pending', 'cancelled'): {'customer', 'seller', 'admin'},
    ('confirmed', 'preparing'): {'seller', 'admin'},
    ('confirmed', 'cancelled'): {'customer', 'seller', 'admin'},
    ('preparing', 'ready'): {'seller', 'admin'},
    ('preparing', 'cancelled'): {'seller', 'admin'},
    ('ready', 'completed'): {'seller', 'admin'},
    ('ready', 'cancelled'): {'seller', 'admin'},
}


def allowed_targets(from_status, role):
    return sorted(to for (source, to), roles in ALLOWED_TRANSITIONS.items() if source == from_status and role in roles)


def assert_transition(from_status, to_status, role):
    if role not in ALLOWED_TRANSITIONS.get((from_status, to_status), set()):
        raise APIError(INVALID_TRANSITION, 'This order transition is not allowed.', {'allowed': allowed_targets(from_status, role)})
