import io
from PIL import Image
from django.db import transaction
from django.db.models import Max, Prefetch
from django.http import Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import SellerProfile, User
from catalog.filters import ProductFilter
from catalog.models import Category, Product, ProductImage
from catalog.serializers import (
    AdminProductSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductListSerializer,
    SellerProductCreateSerializer,
    SellerProductDetailSerializer,
    SellerProductListSerializer,
)
from common.permissions import IsAdmin, IsSeller


class CategoryListView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = []  # Exempt from AnonRateThrottle per NFR-07/AD-05

    def get(self, request):
        categories = Category.objects.filter(status=Category.Status.ACTIVE).order_by('id')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductListView(ListAPIView):
    permission_classes = [AllowAny]
    throttle_classes = []  # Exempt from AnonRateThrottle per NFR-07/AD-05
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter

    def get_queryset(self):
        # DR-04 index (status, -created_at) + seller status active check
        return (
            Product.objects.filter(
                status=Product.Status.PUBLISHED,
                seller__status=SellerProfile.Status.ACTIVE,
            )
            .select_related('seller', 'category')
            .prefetch_related(
                Prefetch(
                    'images',
                    queryset=ProductImage.objects.order_by('sort_order'),
                    to_attr='prefetched_images',
                )
            )
            .order_by('-created_at')
        )


class ProductDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    throttle_classes = []  # Exempt from AnonRateThrottle per NFR-07/AD-05
    serializer_class = ProductDetailSerializer

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            product = (
                Product.objects.select_related('seller', 'category')
                .prefetch_related('images')
                .get(pk=pk)
            )
        except Product.DoesNotExist:
            raise Http404

        user = self.request.user
        is_admin = bool(
            user
            and user.is_authenticated
            and (user.role == User.Role.ADMIN or user.is_staff or user.is_superuser)
        )
        is_owner = bool(
            user
            and user.is_authenticated
            and user.role == User.Role.SELLER
            and hasattr(user, 'sellerprofile')
            and product.seller_id == user.sellerprofile.id
        )

        if product.status == Product.Status.PUBLISHED:
            if product.seller.status == SellerProfile.Status.ACTIVE or is_owner or is_admin:
                return product

        if is_owner or is_admin:
            return product

        raise Http404


class SellerProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSeller]

    def get_queryset(self):
        seller = self.request.user.sellerprofile
        status_filter = self.request.query_params.get('status')
        search_filter = self.request.query_params.get('search')

        qs = (
            Product.objects.filter(seller=seller)
            .select_related('category')
            .prefetch_related('images')
            .order_by('-created_at')
        )
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search_filter:
            qs = qs.filter(name__icontains=search_filter)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return SellerProductListSerializer
        if self.action == 'create':
            return SellerProductCreateSerializer
        return SellerProductDetailSerializer

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.status = Product.Status.ARCHIVED
        product.save(update_fields=['status', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        product = self.get_object()
        if product.status == Product.Status.PUBLISHED:
            return Response({'id': product.id, 'status': Product.Status.PUBLISHED}, status=status.HTTP_200_OK)

        if product.status in (Product.Status.REJECTED, Product.Status.ARCHIVED):
            raise ValidationError(
                f"Cannot publish product with status '{product.status}'."
            )

        if not product.images.exists():
            raise ValidationError('Product must have at least one image before publishing.')

        product.status = Product.Status.PUBLISHED
        product.save(update_fields=['status', 'updated_at'])
        return Response({'id': product.id, 'status': Product.Status.PUBLISHED}, status=status.HTTP_200_OK)


class SellerProductImageView(APIView):
    permission_classes = [IsSeller]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _sniff_image_type(self, file_obj):
        file_obj.seek(0)
        try:
            img = Image.open(file_obj)
            img.verify()
            fmt = img.format
            file_obj.seek(0)
            if fmt in ('JPEG', 'PNG', 'WEBP'):
                return fmt.lower()
        except Exception:
            pass
        file_obj.seek(0)
        return None

    def post(self, request, product_id):
        try:
            product = Product.objects.get(
                id=product_id,
                seller=request.user.sellerprofile,
            )
        except Product.DoesNotExist:
            raise Http404

        if product.images.count() >= 5:
            raise ValidationError('Product cannot have more than 5 images.')

        image_file = request.FILES.get('image')
        if not image_file:
            raise ValidationError({'image': 'Image file is required.'})

        # Max 2 MB
        if image_file.size > 2 * 1024 * 1024:
            raise ValidationError({'image': 'Image file size must not exceed 2MB.'})

        # Sniff real MIME type
        img_format = self._sniff_image_type(image_file)
        if not img_format:
            raise ValidationError({'image': 'Invalid image type. Only JPEG, PNG, and WebP are allowed.'})

        sort_order = request.data.get('sort_order')
        if sort_order is not None and str(sort_order).strip() != '':
            try:
                sort_order = int(sort_order)
            except (ValueError, TypeError):
                raise ValidationError({'sort_order': 'Sort order must be an integer.'})

            if product.images.filter(sort_order=sort_order).exists():
                raise ValidationError({'sort_order': 'An image with this sort order already exists.'})
        else:
            # Auto-assign next sort_order
            max_order = product.images.aggregate(Max('sort_order'))['sort_order__max']
            sort_order = 0 if max_order is None else max_order + 1

        img_instance = ProductImage.objects.create(
            product=product,
            image=image_file,
            sort_order=sort_order,
        )

        return Response(
            {
                'id': img_instance.id,
                'image': request.build_absolute_uri(img_instance.image.url) if request else img_instance.image.url,
                'sort_order': img_instance.sort_order,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, product_id, image_id):
        try:
            product = Product.objects.get(
                id=product_id,
                seller=request.user.sellerprofile,
            )
            img = product.images.get(id=image_id)
        except (Product.DoesNotExist, ProductImage.DoesNotExist):
            raise Http404

        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProductDetailView(RetrieveAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.all().select_related('seller', 'category').prefetch_related('images')

    def patch(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
