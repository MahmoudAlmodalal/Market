from django.contrib import admin
from ai.models import AIContentSuggestion


@admin.register(AIContentSuggestion)
class AIContentSuggestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'suggestion_type', 'target_type', 'target_id', 'confidence', 'review_status', 'requested_by', 'created_at']
    list_filter = ['suggestion_type', 'review_status', 'created_at']
    search_fields = ['input_payload', 'structured_output']
