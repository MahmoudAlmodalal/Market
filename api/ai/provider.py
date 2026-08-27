import json
from dataclasses import dataclass
from typing import Any, Protocol

import requests
from django.conf import settings

from common.errors import AI_UNAVAILABLE, APIError


class AIProvider(Protocol):
    def generate(self, suggestion_type: str, payload: dict[str, Any]) -> dict[str, Any]: ...


@dataclass
class FakeProvider:
    def generate(self, suggestion_type, payload):
        if suggestion_type == 'description':
            name = payload.get('name', 'Product')
            return {'title': name, 'short_description': f'Quality {name}.', 'description': f'A carefully prepared {name} made for everyday use.', 'highlights': ['Quality materials'], 'suggested_tags': ['quality'], 'confidence': 0.85}
        if suggestion_type == 'tags':
            return {'category': None, 'tags': ['quality'], 'confidence': 0.8}
        return {'notes': [{'type': 'missing_info', 'message': 'Review product information.'}], 'confidence': 0.75}


class HTTPProvider:
    def generate(self, suggestion_type, payload):
        if not settings.AI_PROVIDER_URL or not settings.AI_PROVIDER_KEY:
            raise APIError(AI_UNAVAILABLE, 'AI provider is unavailable.', status_code=503)
        try:
            response = requests.post(settings.AI_PROVIDER_URL, headers={'Authorization': f'Bearer {settings.AI_PROVIDER_KEY}'}, json={'type': suggestion_type, 'input': payload}, timeout=10)
            response.raise_for_status()
            data = response.json()
            if not isinstance(data, dict):
                raise ValueError
            return data
        except Exception as exc:
            if isinstance(exc, APIError):
                raise
            raise APIError(AI_UNAVAILABLE, 'AI provider is unavailable.', status_code=503) from exc


def get_provider():
    return HTTPProvider() if settings.AI_PROVIDER_KEY else FakeProvider()
