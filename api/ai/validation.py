import html
import re
from decimal import Decimal
from typing import Any, Dict, Tuple

from catalog.models import Category

TAG_REGEX = re.compile(r'^[\w\s-]{2,30}$')


def escape_payload(obj: Any) -> Any:
    if isinstance(obj, str):
        return html.escape(obj)
    if isinstance(obj, list):
        return [escape_payload(item) for item in obj]
    if isinstance(obj, dict):
        return {k: escape_payload(v) for k, v in obj.items()}
    return obj


def validate_description_output(output: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    output = escape_payload(output)
    try:
        title = output.get('title', '')
        short_desc = output.get('short_description', '')
        desc = output.get('description', '')
        highlights = output.get('highlights', [])
        suggested_tags = output.get('suggested_tags', [])
        confidence = float(output.get('confidence', 0.0))

        if not (3 <= len(title) <= 160):
            return False, 'schema_invalid', output
        if len(short_desc) > 300:
            return False, 'schema_invalid', output
        if not (20 <= len(desc) <= 5000):
            return False, 'schema_invalid', output
        if not (1 <= len(highlights) <= 6) or any(len(h) > 120 for h in highlights):
            return False, 'schema_invalid', output
        if not (0 <= len(suggested_tags) <= 10) or any(not TAG_REGEX.match(t) for t in suggested_tags):
            return False, 'schema_invalid', output
        if not (0.0 <= confidence <= 1.0):
            return False, 'schema_invalid', output

        if confidence < 0.5:
            return False, 'low_confidence', output

        return True, '', output
    except Exception:
        return False, 'schema_invalid', output


def validate_tags_output(output: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    output = escape_payload(output)
    try:
        category_name = output.get('category')
        tags = output.get('tags', [])
        confidence = float(output.get('confidence', 0.0))

        if not (0.0 <= confidence <= 1.0):
            return False, 'schema_invalid', output
        if not isinstance(tags, list):
            return False, 'schema_invalid', output

        # AI-07: category dropped unless it exactly matches Category.name
        if category_name and not Category.objects.filter(name=category_name).exists():
            output.pop('category', None)

        if confidence < 0.5:
            return False, 'low_confidence', output

        return True, '', output
    except Exception:
        return False, 'schema_invalid', output


def validate_moderation_output(output: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    output = escape_payload(output)
    try:
        notes = output.get('notes', [])
        confidence = float(output.get('confidence', 0.0))

        if not isinstance(notes, list):
            return False, 'schema_invalid', output
        if not (0.0 <= confidence <= 1.0):
            return False, 'schema_invalid', output

        for note in notes:
            if not isinstance(note, dict):
                return False, 'schema_invalid', output
            note_type = note.get('type')
            if note_type not in ('missing_info', 'suspicious_claims', 'inappropriate_terms'):
                return False, 'schema_invalid', output

        if confidence < 0.5:
            return False, 'low_confidence', output

        return True, '', output
    except Exception:
        return False, 'schema_invalid', output
