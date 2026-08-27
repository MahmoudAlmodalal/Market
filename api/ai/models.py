from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q


class AIContentSuggestion(models.Model):
    class SuggestionType(models.TextChoices):
        DESCRIPTION = 'description', 'Description'
        TAGS = 'tags', 'Tags'
        MODERATION = 'moderation', 'Moderation'

    class ReviewStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'

    target_type = models.CharField(max_length=40, default='product')
    target_id = models.BigIntegerField(null=True, blank=True)
    suggestion_type = models.CharField(max_length=16, choices=SuggestionType.choices)
    input_payload = models.JSONField(default=dict)
    structured_output = models.JSONField(default=dict)
    confidence = models.DecimalField(max_digits=3, decimal_places=2)
    review_status = models.CharField(max_length=16, choices=ReviewStatus.choices, default=ReviewStatus.PENDING)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='ai_suggestions_requested')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_suggestions_reviewed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [CheckConstraint(condition=Q(confidence__gte=0) & Q(confidence__lte=1), name='ai_confidence_range')]
