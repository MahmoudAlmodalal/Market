import html
import re
from decimal import Decimal, InvalidOperation


TAG_RE = re.compile(r'^[\w\s-]{2,30}$')
NOTE_TYPES = {'missing_info', 'suspicious_claims', 'inappropriate_terms'}


def _text(value, min_len=0, max_len=None):
    if not isinstance(value, str) or len(value) < min_len or (max_len is not None and len(value) > max_len):
        return False
    return True


def validate_and_escape(suggestion_type, output):
    if not isinstance(output, dict):
        return None
    try:
        confidence = Decimal(str(output.get('confidence')))
    except (InvalidOperation, TypeError):
        return None
    if confidence < 0 or confidence > 1:
        return None
    if suggestion_type == 'description':
        if not _text(output.get('title'), 3, 160) or not _text(output.get('short_description'), 0, 300) or not _text(output.get('description'), 20, 5000):
            return None
        highlights = output.get('highlights')
        tags = output.get('suggested_tags')
        if not isinstance(highlights, list) or not 1 <= len(highlights) <= 6 or not all(_text(v, 0, 120) for v in highlights):
            return None
        if not isinstance(tags, list) or len(tags) > 10 or not all(isinstance(v, str) and TAG_RE.fullmatch(v) for v in tags):
            return None
        return {'title': html.escape(output['title']), 'short_description': html.escape(output['short_description']), 'description': html.escape(output['description']), 'highlights': [html.escape(v) for v in highlights], 'suggested_tags': [html.escape(v) for v in tags], 'confidence': confidence}
    if suggestion_type == 'tags':
        tags = output.get('tags')
        if not isinstance(tags, list) or len(tags) > 10 or not all(isinstance(v, str) and TAG_RE.fullmatch(v) for v in tags):
            return None
        category = output.get('category')
        if category is not None and not isinstance(category, str):
            return None
        return {'category': html.escape(category) if category is not None else None, 'tags': [html.escape(v) for v in tags], 'confidence': confidence}
    if suggestion_type == 'moderation':
        notes = output.get('notes')
        if not isinstance(notes, list) or not notes or not all(isinstance(n, dict) and n.get('type') in NOTE_TYPES and _text(n.get('message'), 1, 500) for n in notes):
            return None
        return {'notes': [{'type': n['type'], 'message': html.escape(n['message'])} for n in notes], 'confidence': confidence}
    return None
