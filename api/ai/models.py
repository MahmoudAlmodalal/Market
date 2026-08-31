from django.db import models
from accounts.models import User


class AIContentSuggestion(models.Model):
    class Type(models.TextChoices):
        DESCRIPTION = 'description'
        TAGS = 'tags'
        MODERATION = 'moderation'

    class Status(models.TextChoices):
        PENDING = 'pending'
        ACCEPTED = 'accepted'
        REJECTED = 'rejected'

    target_type = models.CharField(max_length=32, default='product')
    target_id = models.BigIntegerField(null=True, blank=True)
    suggestion_type = models.CharField(max_length=32, choices=Type.choices)
    input_payload = models.JSONField()
    structured_output = models.JSONField()
    confidence = models.DecimalField(max_digits=3, decimal_places=2)
    review_status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    requested_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='requested_ai_suggestions',
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_ai_suggestions',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(confidence__gte=0.0) & models.Q(confidence__lte=1.0),
                name='chk_ai_confidence_range',
            ),
        ]

    def __str__(self):
        return f"{self.suggestion_type} suggestion #{self.id} ({self.review_status})"
