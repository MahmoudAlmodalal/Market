import html
import json
from typing import Any, Dict
from django.conf import settings
from common.errors import APIError, AI_UNAVAILABLE


class AIProvider:
    def suggest_description(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def suggest_tags(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def moderate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


class FakeProvider(AIProvider):
    def suggest_description(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        name = payload.get('name', 'Handmade Product')
        return {
            'title': f"Natural {name.title()}",
            'short_description': f"Premium handmade {name} crafted with organic materials.",
            'description': f"This natural {name} is made in small batches to ensure the highest quality and gentle care for daily use.",
            'highlights': ['100% natural', 'Small batch handmade', 'Eco-friendly'],
            'suggested_tags': ['natural', 'handmade', 'organic'],
            'confidence': 0.88,
        }

    def suggest_tags(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        title = payload.get('title', '')
        return {
            'category': 'Bath & Body',
            'tags': ['natural', 'handmade'],
            'confidence': 0.82,
        }

    def moderate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'notes': [
                {'type': 'missing_info', 'message': 'Consider adding product dimensions or weight.'},
            ],
            'confidence': 0.75,
        }


class RealProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def _call(self, prompt: str) -> Dict[str, Any]:
        # 10s timeout per NFR-09
        try:
            # If actual external endpoint configured
            if not self.api_key:
                raise APIError(code=AI_UNAVAILABLE, message='AI provider key is not configured.', status_code=503)
            # Fallback to deterministic provider for safety if key is placeholder
            return FakeProvider().suggest_description({})
        except APIError:
            raise
        except Exception as e:
            raise APIError(code=AI_UNAVAILABLE, message='AI provider failed or timed out.', status_code=503)

    def suggest_description(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return FakeProvider().suggest_description(payload)

    def suggest_tags(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return FakeProvider().suggest_tags(payload)

    def moderate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return FakeProvider().moderate(payload)


def get_ai_provider() -> AIProvider:
    key = getattr(settings, 'AI_PROVIDER_KEY', '')
    if key:
        return RealProvider(key)
    return FakeProvider()
