from django.urls import path
from ai.views import (
    AcceptSuggestionView,
    AdminAISuggestionListView,
    ModerateView,
    RejectSuggestionView,
    SuggestDescriptionView,
    SuggestTagsView,
)

urlpatterns = [
    path('ai/suggest-description/', SuggestDescriptionView.as_view(), name='ai-suggest-description'),
    path('ai/suggest-tags/', SuggestTagsView.as_view(), name='ai-suggest-tags'),
    path('ai/moderate/', ModerateView.as_view(), name='ai-moderate'),
    path('ai/suggestions/<int:pk>/accept/', AcceptSuggestionView.as_view(), name='ai-suggestion-accept'),
    path('ai/suggestions/<int:pk>/reject/', RejectSuggestionView.as_view(), name='ai-suggestion-reject'),
    path('admin/ai-suggestions/', AdminAISuggestionListView.as_view(), name='admin-ai-suggestions'),
]
