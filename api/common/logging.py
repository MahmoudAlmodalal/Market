import json
import logging


class JsonFormatter(logging.Formatter):
    allowed = ('event', 'user_id', 'resource_id', 'reason')

    def format(self, record):
        payload = {'event': getattr(record, 'event', record.name)}
        for key in self.allowed[1:]:
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        return json.dumps(payload, default=str)


def log_event(event, *, user_id=None, resource_id=None, reason=None, logger=None):
    target = logger or logging.getLogger('souqi')
    target.info(event, extra={'event': event, 'user_id': user_id, 'resource_id': resource_id, 'reason': reason})
