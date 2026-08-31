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


def allowed_targets(from_status: str, role: str):
    return [
        to_s
        for (from_s, to_s), roles in ALLOWED_TRANSITIONS.items()
        if from_s == from_status and role in roles
    ]


def assert_transition(from_status: str, to_status: str, role: str):
    """Validate status transition against permitted role matrix (BR-01, BR-03)."""
    allowed_roles = ALLOWED_TRANSITIONS.get((from_status, to_status), set())
    if role not in allowed_roles:
        targets = allowed_targets(from_status, role)
        raise APIError(
            code=INVALID_TRANSITION,
            message=f"Cannot transition order from '{from_status}' to '{to_status}' as {role}.",
            details={'allowed': targets},
            status_code=400,
        )
