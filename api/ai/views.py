from django.db import transaction
from django.http import Http404
from rest_framework import serializers, status
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from accounts.models import User
from ai.models import AIContentSuggestion
from ai.provider import get_provider
from ai.serializers import AISuggestionListSerializer, SuggestionReviewSerializer
from ai.validation import validate_and_escape
from catalog.models import Category, Product
from common.errors import APIError, VALIDATION_ERROR
from common.pagination import StandardPagination


class IsSellerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.role in {User.Role.SELLER, User.Role.ADMIN})


class UserAIThrottle(SimpleRateThrottle):
    scope = 'ai'

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': request.user.pk}


class AIGenerateView(APIView):
    permission_classes = [IsSellerOrAdmin]
    throttle_classes = [UserAIThrottle]
    suggestion_type = None

    def build_payload(self, request):
        return request.data.copy()

    def post(self, request):
        payload = self.build_payload(request)
        if self.suggestion_type == 'moderation':
            product_id = payload.get('product_id')
            qs = Product.objects.filter(pk=product_id)
            if request.user.role == User.Role.SELLER:
                qs = qs.filter(seller__user=request.user)
            if not product_id or not qs.exists():
                raise Http404
        output = get_provider().generate(self.suggestion_type, payload)
        clean = validate_and_escape(self.suggestion_type, output)
        reason = None if clean is not None and float(clean['confidence']) >= 0.5 else ('schema_invalid' if clean is None else 'low_confidence')
        stored = clean or {'confidence': 0}
        suggestion = AIContentSuggestion.objects.create(target_type='product', target_id=payload.get('product_id') if self.suggestion_type == 'moderation' else None, suggestion_type=self.suggestion_type, input_payload=payload, structured_output=stored, confidence=stored['confidence'], review_status=AIContentSuggestion.ReviewStatus.REJECTED if reason else AIContentSuggestion.ReviewStatus.PENDING, requested_by=request.user)
        if reason:
            return Response({'suggestion_id': suggestion.id, 'status': 'needs_regeneration', 'reason': reason})
        if self.suggestion_type == 'tags' and clean.get('category') is not None and not Category.objects.filter(name=clean['category']).exists():
            clean.pop('category', None)
            suggestion.structured_output = clean
            suggestion.save(update_fields=['structured_output'])
        return Response({'suggestion_id': suggestion.id, 'status': 'pending', 'output': clean})


class SuggestDescriptionView(AIGenerateView):
    suggestion_type = 'description'


class SuggestTagsView(AIGenerateView):
    suggestion_type = 'tags'


class ModerateView(AIGenerateView):
    suggestion_type = 'moderation'


class SuggestionReviewBase(APIView):
    permission_classes = [IsSellerOrAdmin]

    def get_suggestion(self, pk):
        try:
            return AIContentSuggestion.objects.get(pk=pk)
        except AIContentSuggestion.DoesNotExist:
            raise Http404

    def get_product(self, request, suggestion, requested_id=None):
        target_id = suggestion.target_id
        if target_id is None:
            if requested_id is None:
                raise APIError(VALIDATION_ERROR, 'product_id is required.')
            target_id = requested_id
        elif requested_id is not None and int(requested_id) != target_id:
            raise APIError(VALIDATION_ERROR, 'product_id does not match the suggestion target.')
        qs = Product.objects.filter(pk=target_id)
        if request.user.role == User.Role.SELLER:
            qs = qs.filter(seller__user=request.user)
        product = qs.first()
        if not product:
            raise Http404
        return product


class SuggestionAcceptView(SuggestionReviewBase):
    @transaction.atomic
    def post(self, request, pk):
        suggestion = self.get_suggestion(pk)
        if suggestion.review_status != AIContentSuggestion.ReviewStatus.PENDING:
            raise APIError(VALIDATION_ERROR, 'Suggestion has already been reviewed.')
        if suggestion.suggestion_type == AIContentSuggestion.SuggestionType.MODERATION:
            raise APIError(VALIDATION_ERROR, 'Moderation suggestions are advisory and cannot be accepted.')
        serializer = SuggestionReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = self.get_product(request, suggestion, serializer.validated_data.get('product_id'))
        output = suggestion.structured_output
        if suggestion.suggestion_type == AIContentSuggestion.SuggestionType.DESCRIPTION:
            product.name = output.get('title', product.name)
            product.description = output.get('description', product.description)
        elif suggestion.suggestion_type == AIContentSuggestion.SuggestionType.TAGS:
            category_name = output.get('category')
            if category_name is not None:
                product.category = Category.objects.filter(name=category_name).first()
        product.save()
        suggestion.target_id = product.id
        suggestion.review_status = AIContentSuggestion.ReviewStatus.ACCEPTED
        suggestion.reviewed_by = request.user
        suggestion.save(update_fields=['target_id', 'review_status', 'reviewed_by'])
        return Response({'suggestion_id': suggestion.id, 'review_status': suggestion.review_status, 'product_id': product.id, 'product_status': product.status})


class SuggestionRejectView(SuggestionReviewBase):
    def post(self, request, pk):
        suggestion = self.get_suggestion(pk)
        if suggestion.review_status != AIContentSuggestion.ReviewStatus.PENDING:
            raise APIError(VALIDATION_ERROR, 'Suggestion has already been reviewed.')
        suggestion.review_status = AIContentSuggestion.ReviewStatus.REJECTED
        suggestion.reviewed_by = request.user
        suggestion.save(update_fields=['review_status', 'reviewed_by'])
        return Response({'suggestion_id': suggestion.id, 'review_status': suggestion.review_status})


class AdminAISuggestionListView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def get(self, request):
        if request.user.role != User.Role.ADMIN:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        qs = AIContentSuggestion.objects.all().order_by('-created_at')
        for key in ('review_status', 'suggestion_type'):
            if request.query_params.get(key):
                qs = qs.filter(**{key: request.query_params[key]})
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(AISuggestionListSerializer(page, many=True).data)
