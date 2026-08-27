from django.urls import path

from ai.views import (
    AdminAISuggestionListView,
    ModerateView,
    SuggestDescriptionView,
    SuggestionAcceptView,
    SuggestionRejectView,
    SuggestTagsView,
)

urlpatterns = [
    path('ai/suggest-description/', SuggestDescriptionView.as_view(), name='ai-suggest-description'),
    path('ai/suggest-tags/', SuggestTagsView.as_view(), name='ai-suggest-tags'),
    path('ai/moderate/', ModerateView.as_view(), name='ai-moderate'),
    path('ai/suggestions/<int:pk>/accept/', SuggestionAcceptView.as_view(), name='ai-suggestion-accept'),
    path('ai/suggestions/<int:pk>/reject/', SuggestionRejectView.as_view(), name='ai-suggestion-reject'),
    path('admin/ai-suggestions/', AdminAISuggestionListView.as_view(), name='admin-ai-suggestions'),
]
