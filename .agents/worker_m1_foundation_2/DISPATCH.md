## 2026-08-31T08:46:51Z

You are the Foundation & Core UI Worker (worker_m1_foundation_2) for Souqi Marketplace.

Working directory: /home/mahmoud/Desktop/p3/.agents/worker_m1_foundation_2
Workspace root: /home/mahmoud/Desktop/p3
Original Request path: /home/mahmoud/Desktop/p3/.agents/ORIGINAL_REQUEST.md
Specification file: /home/mahmoud/Desktop/p3/SOUQI_UI_IMPLEMENTATION_PLAN.md
Project plan: /home/mahmoud/Desktop/p3/PROJECT.md
Design spec: /home/mahmoud/Desktop/p3/design.md

Your Task (Milestone M1):
Implement the complete Foundation, Bilingual Core, Navigation Shell, and Atomic UI Primitives for Souqi Marketplace.

Owned Files:
1. `lib/utils.ts` (exporting `cn` helper using clsx + tailwind-merge)
2. `types/index.ts`, `types/i18n.ts`, `types/catalog.ts`, `types/cart.ts`, `types/order.ts`, `types/user.ts` (Core TypeScript domain models matching schemas in spec_report.md and SOUQI_UI_IMPLEMENTATION_PLAN.md)
3. `lib/i18n/dictionaries.ts`, `lib/i18n/ar.json`, `lib/i18n/en.json` (Full bilingual translation keys for Arabic and English)
4. `lib/context/LocaleContext.tsx` (React Context provider managing locale 'ar' | 'en', direction 'rtl' | 'ltr', translation hook `useTranslation()`, document direction sync, and language toggle)
5. `app/layout.tsx` (Root redirect / layout ensuring default route redirects to `/ar`)
6. `app/[locale]/layout.tsx` (Locale wrapper layout with DirectionProvider, Cairo/Inter font injection, MobileContainer, AppHeader, BottomNav, and safe-area padding)
7. `components/layout/MobileContainer.tsx` (Max-width 430px centered shell with responsive container styling, shadow, and safe-area support)
8. `components/layout/AppHeader.tsx` (Sticky header with Souqi coral logo, neighborhood selector chip, notification bell with unread dot, and LanguageToggle)
9. `components/layout/BottomNav.tsx` (Fixed bottom bar with 5 tabs: Home, Catalog, Cart with item counter badge, Orders, Profile; active coral state)
10. `components/layout/LanguageToggle.tsx` (Bilingual switcher between AR and EN with route preservation)
11. `components/ui/Button.tsx` (Primary #E9495E, Secondary #FFF1F3, Outline, Ghost, Destructive variants; loading state spinner, active scale feedback)
12. `components/ui/Input.tsx` (Bilingual text input with focus ring, error message support, clear icon)
13. `components/ui/Badge.tsx` (Semantic chips: success, warning, error, info/AI, soft backgrounds)
14. `components/ui/Card.tsx` (20px rounded-card, shadow-soft, hover elevation)
15. `components/ui/Modal.tsx` (Dialog overlay with backdrop blur, focus trap, Escape to dismiss)
16. `components/ui/Drawer.tsx` (Slide-up bottom sheet with spring entrance and drag/close handle)
17. `components/ui/Tabs.tsx` (Horizontal selectable tabs with active coral underline/pill indicator)
18. `components/ui/QuantityStepper.tsx` (Numeric counter with clamp at min 1 and max stock limit)
19. `components/ui/Skeleton.tsx` (Pulse animated placeholder cards and lines)
20. `components/ui/Toast.tsx` (Floating feedback notifications with auto-dismiss)
