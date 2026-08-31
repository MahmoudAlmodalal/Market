import django_filters
from django.db.models import Q
from catalog.models import Product


class ProductFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    category = django_filters.NumberFilter(field_name='category_id')
    seller = django_filters.NumberFilter(field_name='seller_id')
    ordering = django_filters.OrderingFilter(
        fields=(
            ('price', 'price'),
            ('created_at', 'created_at'),
        ),
    )

    class Meta:
        model = Product
        fields = ['search', 'category', 'seller']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        # ponytail: ILIKE scan; add pg_trgm GIN past ~10k products
        return queryset.filter(Q(name__icontains=value) | Q(description__icontains=value))
