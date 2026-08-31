from rest_framework import serializers
from ai.models import AIContentSuggestion


class SuggestDescriptionInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    category_id = serializers.IntegerField(required=False, allow_null=True)
    attributes = serializers.DictField(required=False)
    notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)


class SuggestTagsInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=5000, required=False, allow_blank=True)


class ModerateInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()


class AcceptSuggestionInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False, allow_null=True)


class AISuggestionAdminSerializer(serializers.ModelSerializer):
    requested_by_email = serializers.EmailField(source='requested_by.email', read_only=True)
    reviewed_by_email = serializers.EmailField(source='reviewed_by.email', read_only=True, allow_null=True)

    class Meta:
        model = AIContentSuggestion
        fields = [
            'id',
            'target_type',
            'target_id',
            'suggestion_type',
            'input_payload',
            'structured_output',
            'confidence',
            'review_status',
            'requested_by_email',
            'reviewed_by_email',
            'created_at',
            'updated_at',
        ]
