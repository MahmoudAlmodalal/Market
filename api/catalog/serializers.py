from django.conf import settings
from rest_framework import serializers

from accounts.models import SellerProfile
from catalog.models import Category, Product, ProductImage
from catalog.services import stock_state


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class SellerSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ['id', 'business_name', 'description']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'sort_order']


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    stock_state = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.business_name', read_only=True)
    category = CategorySimpleSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'primary_image',
            'stock_state',
            'seller_name',
            'category',
        ]

    def get_primary_image(self, obj):
        # Prefer prefetched images if available
        images = getattr(obj, 'prefetched_images', None)
        if images is None:
            images = obj.images.all()
        if images:
            first_img = sorted(images, key=lambda img: img.sort_order)[0]
            if first_img.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first_img.image.url)
                return first_img.image.url
        return None

    def get_stock_state(self, obj):
        return stock_state(obj.stock_quantity)


class ProductDetailSerializer(serializers.ModelSerializer):
    stock_state = serializers.SerializerMethodField()
    available_quantity = serializers.SerializerMethodField()
    category = CategorySimpleSerializer(read_only=True)
    seller = SellerSimpleSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock_state',
            'available_quantity',
            'category',
            'seller',
            'images',
            'created_at',
        ]

    def get_stock_state(self, obj):
        return stock_state(obj.stock_quantity)

    def get_available_quantity(self, obj):
        threshold = getattr(settings, 'LOW_STOCK_THRESHOLD', 5)
        if obj.stock_quantity <= threshold:
            return obj.stock_quantity
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Omit available_quantity key if stock_quantity > threshold
        if ret.get('available_quantity') is None:
            ret.pop('available_quantity', None)
        return ret


class SellerProductListSerializer(serializers.ModelSerializer):
    stock_state = serializers.SerializerMethodField()
    category = CategorySimpleSerializer(read_only=True)
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'stock_quantity',
            'stock_state',
            'status',
            'category',
            'image_count',
            'created_at',
        ]

    def get_stock_state(self, obj):
        return stock_state(obj.stock_quantity)

    def get_image_count(self, obj):
        return getattr(obj, 'image_count', obj.images.count())


class SellerProductDetailSerializer(serializers.ModelSerializer):
    stock_state = serializers.SerializerMethodField()
    category = CategorySimpleSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(status=Category.Status.ACTIVE),
        source='category',
        write_only=True,
        required=False,
        allow_null=True,
    )
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock_quantity',
            'stock_state',
            'status',
            'moderation_note',
            'category',
            'category_id',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'moderation_note', 'created_at', 'updated_at']

    def get_stock_state(self, obj):
        return stock_state(obj.stock_quantity)

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price must be non-negative.')
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock quantity must be non-negative.')
        return value

    def validate_description(self, value):
        if len(value) > 5000:
            raise serializers.ValidationError('Description must not exceed 5000 characters.')
        return value


class SellerProductCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(status=Category.Status.ACTIVE),
        source='category',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock_quantity',
            'category_id',
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price must be non-negative.')
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock quantity must be non-negative.')
        return value

    def validate_description(self, value):
        if len(value) > 5000:
            raise serializers.ValidationError('Description must not exceed 5000 characters.')
        return value

    def create(self, validated_data):
        seller = self.context['request'].user.sellerprofile
        validated_data['seller'] = seller
        validated_data['status'] = Product.Status.DRAFT
        return super().create(validated_data)


class AdminProductSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
    seller = SellerSimpleSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock_quantity',
            'status',
            'moderation_note',
            'category',
            'seller',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'name',
            'description',
            'price',
            'stock_quantity',
            'category',
            'seller',
            'images',
            'created_at',
            'updated_at',
        ]

    def validate(self, attrs):
        status = attrs.get('status')
        moderation_note = attrs.get('moderation_note', self.instance.moderation_note if self.instance else '')
        if status == Product.Status.REJECTED and not moderation_note:
            raise serializers.ValidationError({
                'moderation_note': 'Moderation note is required when rejecting a product.'
            })
        return attrs
