from rest_framework import serializers

from catalog.models import Category, Product, ProductImage
from catalog.services import stock_state


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class SellerSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField(source='pk')
    business_name = serializers.CharField()
    description = serializers.CharField()


class ProductPublicSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    stock_state = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.business_name')
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'primary_image', 'stock_state', 'seller_name', 'category')

    def get_primary_image(self, obj):
        image = next(iter(obj.images.all()), None)
        if not image:
            return None
        request = self.context.get('request')
        url = image.image.url
        return request.build_absolute_uri(url) if request else url

    def get_stock_state(self, obj):
        return stock_state(obj.stock_quantity)


class ProductDetailSerializer(ProductPublicSerializer):
    images = serializers.SerializerMethodField()
    seller = SellerSummarySerializer(read_only=True)
    stock_quantity = serializers.IntegerField(write_only=True, required=False)
    description = serializers.CharField()
    available_quantity = serializers.SerializerMethodField()

    class Meta(ProductPublicSerializer.Meta):
        fields = ('id', 'name', 'description', 'price', 'stock_quantity', 'stock_state', 'available_quantity', 'images', 'seller', 'category')

    def get_images(self, obj):
        request = self.context.get('request')
        return [request.build_absolute_uri(i.image.url) if request else i.image.url for i in obj.images.all()]

    def get_available_quantity(self, obj):
        from django.conf import settings
        return obj.stock_quantity if obj.stock_quantity <= settings.LOW_STOCK_THRESHOLD else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        from django.conf import settings
        if instance.stock_quantity > settings.LOW_STOCK_THRESHOLD:
            data.pop('available_quantity', None)
        data.pop('stock_quantity', None)
        return data


class SellerProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), allow_null=True, required=False)
    stock_state = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'stock_quantity', 'status', 'moderation_note', 'category_id', 'stock_state', 'image_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'moderation_note', 'stock_state', 'image_count', 'created_at', 'updated_at')

    def get_stock_state(self, obj):
        return stock_state(obj.stock_quantity)

    def get_image_count(self, obj):
        return obj.images.count()


class ProductWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Product
        fields = ('name', 'description', 'price', 'stock_quantity', 'category_id')

    def validate_description(self, value):
        if len(value) > 5000:
            raise serializers.ValidationError('Description must be at most 5000 characters.')
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price must not be negative.')
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock must not be negative.')
        return value


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'sort_order')
