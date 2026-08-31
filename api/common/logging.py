import json
import logging
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Structured JSON log formatter (TK-40, NFR-05)."""

    def format(self, record):
        log_data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
        }
        for attr in ('event', 'user_id', 'resource_id', 'reason'):
            val = getattr(record, attr, None)
            if val is not None:
                log_data[attr] = val

        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_data)


logger = logging.getLogger('souqi')


def log_event(event: str, user_id=None, resource_id=None, reason=None, level=logging.INFO, **extra):
    # Ensure sensitive data is never logged (SEC-05)
    clean_extra = {k: v for k, v in extra.items() if 'password' not in k.lower() and 'token' not in k.lower()}
    logger.log(
        level,
        f"Event: {event}",
        extra={
            'event': event,
            'user_id': user_id,
            'resource_id': resource_id,
            'reason': reason,
            **clean_extra,
        },
    )
