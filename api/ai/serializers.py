from rest_framework import serializers

from ai.models import AIContentSuggestion


class SuggestionReviewSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)


class AISuggestionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIContentSuggestion
        fields = ('id', 'target_type', 'target_id', 'suggestion_type', 'input_payload', 'structured_output', 'confidence', 'review_status', 'requested_by', 'reviewed_by', 'created_at')
