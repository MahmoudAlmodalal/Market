from django.conf import settings
from django.core.files.images import get_image_dimensions
from django.db import transaction
from django.db.models import Count, Max, Prefetch, Q
from django.http import Http404
from rest_framework import status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Category, Product, ProductImage
from catalog.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductPublicSerializer,
    ProductWriteSerializer,
    SellerProductSerializer,
)
from common.errors import APIError, VALIDATION_ERROR
from common.pagination import StandardPagination
from common.permissions import IsAdmin, IsSeller


class CategoryListView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = []

    def get(self, request):
        return Response(CategorySerializer(Category.objects.filter(status=Category.Status.ACTIVE), many=True).data)


class PublicProductListView(StandardPagination, APIView):
    permission_classes = [AllowAny]
    throttle_classes = []

    def get(self, request):
        image_qs = ProductImage.objects.order_by('sort_order')
        qs = Product.objects.filter(status=Product.Status.PUBLISHED, seller__status='active').select_related('seller', 'category').prefetch_related(Prefetch('images', queryset=image_qs))
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if request.query_params.get('category'):
            qs = qs.filter(category_id=request.query_params['category'])
        if request.query_params.get('seller'):
            qs = qs.filter(seller_id=request.query_params['seller'])
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering not in {'price', '-price', 'created_at', '-created_at'}:
            ordering = '-created_at'
        qs = qs.order_by(ordering)
        page = self.paginate_queryset(qs, request, view=self)
        return self.get_paginated_response(ProductPublicSerializer(page, many=True, context={'request': request}).data)


class PublicProductDetailView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = []

    def get(self, request, pk):
        qs = Product.objects.select_related('seller', 'category').prefetch_related('images')
        product = qs.filter(pk=pk).first()
        if not product:
            raise Http404
        is_owner = request.user.is_authenticated and request.user.role == 'seller' and product.seller.user_id == request.user.id
        is_admin = request.user.is_authenticated and request.user.role == 'admin'
        if product.status != Product.Status.PUBLISHED and not is_owner and not is_admin:
            raise Http404
        return Response(ProductDetailSerializer(product, context={'request': request}).data)


class SellerProductListCreateView(APIView):
    permission_classes = [IsSeller]

    def get_queryset(self, request):
        return Product.objects.filter(seller=request.user.sellerprofile).select_related('category', 'seller').annotate(image_count=Count('images'))

    def get(self, request):
        qs = self.get_queryset(request)
        if request.query_params.get('status'):
            qs = qs.filter(status=request.query_params['status'])
        if request.query_params.get('search'):
            value = request.query_params['search']
            qs = qs.filter(Q(name__icontains=value) | Q(description__icontains=value))
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs.order_by('-created_at'), request, view=self)
        return paginator.get_paginated_response(SellerProductSerializer(page, many=True).data)

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save(seller=request.user.sellerprofile, status=Product.Status.DRAFT)
        return Response(SellerProductSerializer(product).data, status=status.HTTP_201_CREATED)


class SellerProductDetailView(APIView):
    permission_classes = [IsSeller]

    def get_object(self, request, pk):
        try:
            return Product.objects.select_related('category', 'seller').get(pk=pk, seller=request.user.sellerprofile)
        except Product.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        return Response(SellerProductSerializer(self.get_object(request, pk)).data)

    def patch(self, request, pk):
        product = self.get_object(request, pk)
        serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SellerProductSerializer(product).data)

    def delete(self, request, pk):
        product = self.get_object(request, pk)
        product.status = Product.Status.ARCHIVED
        product.save(update_fields=['status', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class SellerPublishView(APIView):
    permission_classes = [IsSeller]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, seller=request.user.sellerprofile)
        except Product.DoesNotExist:
            raise Http404
        if product.status == Product.Status.PUBLISHED:
            return Response({'id': product.id, 'status': product.status})
        if product.status in {Product.Status.REJECTED, Product.Status.ARCHIVED} or not product.images.exists():
            raise APIError(VALIDATION_ERROR, 'Product cannot be published.', {'status': product.status, 'requires_image': not product.images.exists()})
        product.status = Product.Status.PUBLISHED
        product.save(update_fields=['status', 'updated_at'])
        return Response({'id': product.id, 'status': product.status})


class SellerImageView(APIView):
    permission_classes = [IsSeller]
    parser_classes = [MultiPartParser, FormParser]

    def get_product(self, request, pk):
        try:
            return Product.objects.get(pk=pk, seller=request.user.sellerprofile)
        except Product.DoesNotExist:
            raise Http404

    def post(self, request, pk):
        product = self.get_product(request, pk)
        if product.images.count() >= 5:
            raise APIError(VALIDATION_ERROR, 'A product may have at most five images.')
        image = request.FILES.get('image')
        if not image:
            raise APIError(VALIDATION_ERROR, 'An image file is required.')
        if image.size > 2 * 1024 * 1024:
            raise APIError(VALIDATION_ERROR, 'Image must be at most 2 MB.')
        try:
            from PIL import Image
            image.seek(0)
            opened = Image.open(image)
            opened.verify()
            mime = Image.MIME.get(opened.format)
            if mime not in {'image/jpeg', 'image/png', 'image/webp'}:
                raise ValueError
        except Exception:
            raise APIError(VALIDATION_ERROR, 'Only JPEG, PNG, and WebP images are supported.')
        raw_order = request.data.get('sort_order')
        if raw_order in (None, ''):
            raw_order = (product.images.aggregate(max_order=Max('sort_order'))['max_order'] or -1) + 1
        try:
            sort_order = int(raw_order)
        except (ValueError, TypeError):
            raise APIError(VALIDATION_ERROR, 'sort_order must be an integer.')
        if sort_order < 0:
            raise APIError(VALIDATION_ERROR, 'sort_order must not be negative.')
        if ProductImage.objects.filter(product=product, sort_order=sort_order).exists():
            raise APIError(VALIDATION_ERROR, 'sort_order is already taken.')
        obj = ProductImage.objects.create(product=product, image=image, sort_order=sort_order)
        return Response(ProductImageSerializer(obj).data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, image_id):
        product = self.get_product(request, pk)
        try:
            image = ProductImage.objects.get(pk=image_id, product=product)
        except ProductImage.DoesNotExist:
            raise Http404
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [JSONParser]

    def get_object(self, pk):
        try:
            return Product.objects.select_related('seller', 'category').get(pk=pk)
        except Product.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        product = self.get_object(pk)
        return Response(SellerProductSerializer(product).data)

    @transaction.atomic
    def patch(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        requested_status = request.data.get('status')
        if requested_status is not None and requested_status not in Product.Status.values:
            raise APIError(VALIDATION_ERROR, 'Invalid product status.')
        if requested_status == Product.Status.REJECTED and not request.data.get('moderation_note') and not product.moderation_note:
            raise APIError(VALIDATION_ERROR, 'moderation_note is required when rejecting a product.')
        for field in ('status', 'moderation_note'):
            if field in request.data:
                setattr(product, field, request.data[field])
        serializer.save()
        product.save()
        return Response(SellerProductSerializer(product).data)
