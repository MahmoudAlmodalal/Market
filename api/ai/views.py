from decimal import Decimal
from django.db import transaction
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.models import User
from ai.models import AIContentSuggestion
from ai.provider import get_ai_provider
from ai.serializers import (
    AcceptSuggestionInputSerializer,
    AISuggestionAdminSerializer,
    ModerateInputSerializer,
    SuggestDescriptionInputSerializer,
    SuggestTagsInputSerializer,
)
from ai.validation import (
    validate_description_output,
    validate_moderation_output,
    validate_tags_output,
)
from catalog.models import Category, Product
from common.permissions import IsAdmin, IsSellerOrAdmin


class UserScopedRateThrottle(ScopedRateThrottle):
    """Ensure AI rate limit is keyed per user_id, not seller profile (TK-06, TK-36)."""

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"throttle_{self.scope}_{request.user.id}"
        return super().get_cache_key(request, view)


class SuggestDescriptionView(APIView):
    permission_classes = [IsSellerOrAdmin]
    throttle_classes = [UserScopedRateThrottle]
    throttle_scope = 'ai'

    def post(self, request):
        serializer = SuggestDescriptionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        provider = get_ai_provider()
        raw_output = provider.suggest_description(serializer.validated_data)

        is_valid, reason, output = validate_description_output(raw_output)
        confidence = Decimal(str(output.get('confidence', 0.0))).quantize(Decimal('0.01'))

        suggestion = AIContentSuggestion.objects.create(
            target_type='product',
            target_id=None,
            suggestion_type=AIContentSuggestion.Type.DESCRIPTION,
            input_payload=serializer.validated_data,
            structured_output=output,
            confidence=confidence,
            review_status=AIContentSuggestion.Status.PENDING if is_valid else AIContentSuggestion.Status.REJECTED,
            requested_by=request.user,
        )

        if not is_valid:
            return Response(
                {
                    'suggestion_id': suggestion.id,
                    'status': 'needs_regeneration',
                    'reason': reason,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                'suggestion_id': suggestion.id,
                'status': 'pending',
                'output': output,
            },
            status=status.HTTP_200_OK,
        )


class SuggestTagsView(APIView):
    permission_classes = [IsSellerOrAdmin]
    throttle_classes = [UserScopedRateThrottle]
    throttle_scope = 'ai'

    def post(self, request):
        serializer = SuggestTagsInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        provider = get_ai_provider()
        raw_output = provider.suggest_tags(serializer.validated_data)

        is_valid, reason, output = validate_tags_output(raw_output)
        confidence = Decimal(str(output.get('confidence', 0.0))).quantize(Decimal('0.01'))

        suggestion = AIContentSuggestion.objects.create(
            target_type='product',
            target_id=None,
            suggestion_type=AIContentSuggestion.Type.TAGS,
            input_payload=serializer.validated_data,
            structured_output=output,
            confidence=confidence,
            review_status=AIContentSuggestion.Status.PENDING if is_valid else AIContentSuggestion.Status.REJECTED,
            requested_by=request.user,
        )

        if not is_valid:
            return Response(
                {
                    'suggestion_id': suggestion.id,
                    'status': 'needs_regeneration',
                    'reason': reason,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                'suggestion_id': suggestion.id,
                'status': 'pending',
                'output': output,
            },
            status=status.HTTP_200_OK,
        )


class ModerateView(APIView):
    permission_classes = [IsSellerOrAdmin]
    throttle_classes = [UserScopedRateThrottle]
    throttle_scope = 'ai'

    def post(self, request):
        serializer = ModerateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data['product_id']

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise Http404

        is_admin = request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser
        if not is_admin and (not hasattr(request.user, 'sellerprofile') or product.seller_id != request.user.sellerprofile.id):
            raise Http404

        provider = get_ai_provider()
        raw_output = provider.moderate({'product_id': product_id, 'name': product.name, 'description': product.description})

        is_valid, reason, output = validate_moderation_output(raw_output)
        confidence = Decimal(str(output.get('confidence', 0.0))).quantize(Decimal('0.01'))

        suggestion = AIContentSuggestion.objects.create(
            target_type='product',
            target_id=product.id,
            suggestion_type=AIContentSuggestion.Type.MODERATION,
            input_payload={'product_id': product_id},
            structured_output=output,
            confidence=confidence,
            review_status=AIContentSuggestion.Status.PENDING if is_valid else AIContentSuggestion.Status.REJECTED,
            requested_by=request.user,
        )

        if not is_valid:
            return Response(
                {
                    'suggestion_id': suggestion.id,
                    'status': 'needs_regeneration',
                    'reason': reason,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                'suggestion_id': suggestion.id,
                'status': 'pending',
                'output': output,
            },
            status=status.HTTP_200_OK,
        )


class AcceptSuggestionView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def post(self, request, pk):
        try:
            suggestion = AIContentSuggestion.objects.get(pk=pk)
        except AIContentSuggestion.DoesNotExist:
            raise Http404

        if suggestion.review_status != AIContentSuggestion.Status.PENDING:
            raise ValidationError('Suggestion is already reviewed.')

        if suggestion.suggestion_type == AIContentSuggestion.Type.MODERATION:
            raise ValidationError('Moderation output is advisory and cannot be accepted.')

        serializer = AcceptSuggestionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data.get('product_id')

        if suggestion.target_id is None:
            if not product_id:
                raise ValidationError({'product_id': 'product_id is required when suggestion has no bound target.'})
            target_product_id = product_id
        else:
            if product_id and product_id != suggestion.target_id:
                raise ValidationError({'product_id': 'product_id does not match the suggestion target.'})
            target_product_id = suggestion.target_id

        try:
            product = Product.objects.get(id=target_product_id)
        except Product.DoesNotExist:
            raise Http404

        is_admin = request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser
        if not is_admin and (not hasattr(request.user, 'sellerprofile') or product.seller_id != request.user.sellerprofile.id):
            raise Http404

        with transaction.atomic():
            if suggestion.suggestion_type == AIContentSuggestion.Type.DESCRIPTION:
                out = suggestion.structured_output
                if 'title' in out:
                    product.name = out['title']
                if 'description' in out:
                    product.description = out['description']
                product.save(update_fields=['name', 'description', 'updated_at'])
            elif suggestion.suggestion_type == AIContentSuggestion.Type.TAGS:
                category_name = suggestion.structured_output.get('category')
                if category_name:
                    category = Category.objects.filter(name=category_name).first()
                    if category:
                        product.category = category
                        product.save(update_fields=['category', 'updated_at'])

            suggestion.review_status = AIContentSuggestion.Status.ACCEPTED
            suggestion.reviewed_by = request.user
            suggestion.target_id = product.id
            suggestion.save(update_fields=['review_status', 'reviewed_by', 'target_id', 'updated_at'])

        return Response(
            {
                'suggestion_id': suggestion.id,
                'review_status': 'accepted',
                'product_id': product.id,
                'product_status': product.status,
            },
            status=status.HTTP_200_OK,
        )


class RejectSuggestionView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def post(self, request, pk):
        try:
            suggestion = AIContentSuggestion.objects.get(pk=pk)
        except AIContentSuggestion.DoesNotExist:
            raise Http404

        if suggestion.review_status != AIContentSuggestion.Status.PENDING:
            raise ValidationError('Suggestion is already reviewed.')

        suggestion.review_status = AIContentSuggestion.Status.REJECTED
        suggestion.reviewed_by = request.user
        suggestion.save(update_fields=['review_status', 'reviewed_by', 'updated_at'])

        return Response(
            {
                'suggestion_id': suggestion.id,
                'review_status': 'rejected',
            },
            status=status.HTTP_200_OK,
        )


class AdminAISuggestionListView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AISuggestionAdminSerializer

    def get_queryset(self):
        qs = AIContentSuggestion.objects.all().select_related('requested_by', 'reviewed_by').order_by('-created_at')
        status_param = self.request.query_params.get('review_status')
        type_param = self.request.query_params.get('suggestion_type')
        if status_param:
            qs = qs.filter(review_status=status_param)
        if type_param:
            qs = qs.filter(suggestion_type=type_param)
        return qs
