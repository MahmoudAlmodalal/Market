"""Health (API.md §10) and the unrouted-URL path, which never reaches the DRF handler."""
import pytest


@pytest.mark.django_db
def test_health_ok(client):
    r = client.get('/api/health/')
    assert r.status_code == 200
    assert r.json() == {'status': 'ok', 'database': 'ok'}


def test_unknown_route_uses_envelope(client, settings):
    settings.DEBUG = False  # DEBUG=True bypasses handler404
    r = client.get('/api/nope/')
    assert r.status_code == 404
    assert r.json()['error']['code'] == 'not_found'
