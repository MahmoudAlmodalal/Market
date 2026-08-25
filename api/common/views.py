from django.db import connections
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """API.md §10 — its own body shape, deliberately not the error envelope."""
    try:
        with connections['default'].cursor() as cursor:
            cursor.execute('SELECT 1')
    except Exception:
        return Response({'status': 'error', 'database': 'unreachable'}, status=503)
    return Response({'status': 'ok', 'database': 'ok'})


def _envelope(code, message, status):
    return JsonResponse({'error': {'code': code, 'message': message, 'details': {}}}, status=status)


# Unrouted URLs never reach DRF's handler — these are what make the DoD hold.
def not_found(request, exception):
    return _envelope('not_found', 'Not found.', 404)


def server_error(request):
    return _envelope('server_error', 'Internal server error.', 500)
