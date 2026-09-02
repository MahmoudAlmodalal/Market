## 2026-08-31T09:23:53Z

You are the Worker assigned to Milestone M2: Feed, Discovery & Catalog for Souqi Marketplace.

Working Directory: /home/mahmoud/Desktop/p3/.agents/teamwork_preview_worker_m2_feed_1
Project Root: /home/mahmoud/Desktop/p3
Original Request: /home/mahmoud/Desktop/p3/ORIGINAL_REQUEST.md
Specification: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md (Phases 3.1 & 3.2)
Context: /home/mahmoud/Desktop/p3/PROJECT.md

Scope & Exclusively Owned Files:
1. `lib/mock/categories.ts`: Comprehensive mock category fixtures (at least 8 categories with Arabic and English names, slugs, icons, product counts).
2. `lib/mock/products.ts`: Rich mock products fixture dataset (at least 12 products across categories with realistic prices, stock states: 'available' | 'low_stock' | 'out_of_stock', images, descriptions, seller info, tags, AI suggested flags, etc.) and filtering helper functions.
3. `lib/mock/stories.ts`: Promotional stories & banners fixtures.
4. `components/feed/CategoryFilterStrip.tsx`: Horizontal scrollable pill strip with active category selection state, smooth RTL/LTR scrolling.
5. `components/feed/HeroCarousel.tsx`: Mobile 16:9 promotional banner carousel with rounded-card (20px), slide indicators, auto-play support, swipe gestures, and CTA buttons.
6. `components/feed/StoriesStrip.tsx`: Circular / story cards strip for merchant highlights / promotions.
7. `components/feed/FilterDrawer.tsx`: Slide-up drawer modal for multi-attribute filtering (Price range slider/inputs, Category selection, Availability/Stock filter, Sort order: price, -price, created_at, -created_at).
8. `components/feed/index.ts`: Barrel export.
9. `components/catalog/ProductCard.tsx`: 20px radius card, 1:1 aspect ratio image container, 2-line title clamp in Cairo, tabular price in Inter font, stock status badge, quick-add CTA button integrated with CartContext, interactive hover/touch feedback.
10. `components/catalog/CatalogGrid.tsx`: Fluid 2-column mobile / 4-column responsive grid with 16px margins and gutters, supporting 4-state lifecycle (Default, Loading Skeleton, Empty, Error + Retry).
11. `components/catalog/ProductCardSkeleton.tsx`: Pulse skeleton card matching exact ProductCard dimensions to prevent CLS.
12. `components/catalog/index.ts`: Barrel export.
13. `app/[locale]/page.tsx`: Home marketplace feed screen assembling HeroCarousel, CategoryFilterStrip, StoriesStrip, SearchBar, CatalogGrid with quick filters, and dynamic locale awareness.
14. `app/[locale]/catalog/page.tsx`: Dedicated catalog browsing page with search, active filters bar, sort dropdown, FilterDrawer trigger, and CatalogGrid.
