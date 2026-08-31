# Souqi Design System & UI/UX Specification

**Version:** 2.0 (Commerce-First Design System)  
**Product:** «سوقي» (Souqi) — Local & Home-Based Marketplace  
**Tech Stack:** Next.js 15 (App Router) · Tailwind CSS · Lucide React · Django REST Framework (API)  
**Document Status:** Single Source of Truth (SSOT) for Visual Identity, UI Components, and Design Tokens

---

## 1. Design Direction

### 1.1 Brand Personality
> **Friendly · Local · Fresh · Simple · Trustworthy · Modern**

«سوقي» هو منصة تجارة إلكترونية وسوق محلي يربط الحرفيين، الطهاة المنزليين، والمشاريع المحلية بالمستهلكين. الهوية البصرية تعكس دفء الإنتاج اليدوي والمحلي مع احترافية وموثوقية منصة التجارة الحديثة.

### 1.2 Visual Foundation & Commerce-First Approach
المرجع البصري يستند إلى جمالية دافئة وناعمة، وتطبيقها التجاري يخضع لقاعدة التوازن البصري:
* **خلفيات Blush/Pink ناعمة ومحسوبة:** تضفي حميمية وحيوية دون إجهاد العين.
* **لون أساسي Red/Coral مفعم بالطاقة:** مخصص للأفعال الأساسية والتحويلات (CTAs) وإبراز الأسعار.
* **بطاقات بيضاء ناصعة ذات حواف دائرية (Rounded Cards):** تفصل المنتجات وتمنح وضوحًا بصريًا.
* **ظلال ناعمة (Soft Elevation):** طبقات خفيفة تعطي عمقًا بدون فوضى.
* **مساحات بيضاء متوازنة (Generous Whitespace):** تجعل تصفح المنتجات سلسًا ومريحًا.
* **التصميم الموجه للتجارة (Commerce-First):** النظام مصمم ليخدم تدفق التجارة الفعلي:  
  `Discover → Product Details → Cart → Mock Checkout → Order Tracking → Seller Inventory & Fulfillment → Admin Moderation`.

---

## 2. Color System

النظام اللوني مبني على هيكل دقيق من درجات العلامة التجارية والدرجات المحايدة والدرجات الوظيفية.

### 2.1 Primary Brand Palette (Coral / Rose Red)

| Token | HEX | RGB | Use Case |
| :--- | :--- | :--- | :--- |
| `primary-50` | `#FFF1F3` | `255, 241, 243` | Soft tinted backgrounds, selected pill chips, hero tint |
| `primary-100` | `#FFE3E7` | `255, 227, 231` | Hover for light badges, active state of tinted buttons |
| `primary-200` | `#FFC9D1` | `255, 201, 209` | Delicate borders on soft backgrounds, subtle outlines |
| `primary-300` | `#F8AEBB` | `248, 174, 187` | Decorative elements, inactive step markers |
| `primary-400` | `#EB8996` | `235, 137, 150` | Secondary accents, disabled state for light elements |
| **`primary-500`** | **`#E9495E`** | **`233, 73, 94`** | **Main Brand Primary: Main CTAs, active states, key icons** |
| `primary-600` | `#D9364D` | `217, 54, 77` | Primary button hover state, prominent active icons |
| `primary-700` | `#B92B3F` | `185, 43, 63` | Primary button pressed/active state, deep links |
| `primary-800` | `#932338` | `147, 35, 56` | High-contrast text on light pink, dark badges |
| `primary-900` | `#641423` | `100, 20, 35` | Deepest brand tone for contrast-critical text |

### 2.2 Neutral Palette

| Token | HEX | RGB | Use Case |
| :--- | :--- | :--- | :--- |
| `neutral-0` | `#FFFFFF` | `255, 255, 255` | Pure White: Card surfaces, modals, elevated panels |
| `neutral-50` | `#FAFAFA` | `250, 250, 250` | Page background, subtle section contrast |
| `neutral-100` | `#F5F5F5` | `245, 245, 245` | Image placeholders, input fill, table header rows |
| `neutral-200` | `#EAEAEA` | `234, 234, 234` | Primary hairline borders, dividers, card borders |
| `neutral-300` | `#D6D6D6` | `214, 214, 214` | Inactive step lines, disabled borders |
| `neutral-400` | `#A8A8A8` | `168, 168, 168` | Placeholder text, disabled icon fills |
| `neutral-500` | `#737373` | `115, 115, 115` | Muted secondary text, metadata labels, time stamps |
| `neutral-600` | `#525252` | `82, 82, 82` | Secondary body text, table cells |
| `neutral-700` | `#363636` | `54, 54, 54` | Subheadings, active menu items |
| `neutral-800` | `#202020` | `32, 32, 32` | Headings, primary body text, high-contrast labels |
| `neutral-900` | `#111111` | `17, 17, 17` | Maximum contrast titles, key display numbers |

### 2.3 Semantic Palette

| Semantic Role | Token | HEX | Usage |
| :--- | :--- | :--- | :--- |
| **Success** | `success` | `#22A06B` | In-stock badge (`available`), order `completed`, success toasts |
| **Warning** | `warning` | `#E9A23B` | Low stock alert (`low_stock`), cart price changes, pending reviews |
| **Error / Destructive** | `error` | `#D92D3F` | Out of stock (`out_of_stock`), validation errors, `cancelled` state |
| **Info** | `info` | `#3B82F6` | Informational announcements, seller guidance notes |

---

## 3. Background System

يتبع النظام ثلاث طبقات بصرية واضحة لمنع التداخل اللوني:

```text
Background Layering
├── Level 0 (Page Canvas)     : #FFFFFF (Mobile) / #FAFAFA (Desktop main canvas)
├── Level 1 (Surface / Cards) : #FFFFFF (Raised cards with borders/shadows)
└── Level 2 (Brand Soft / Tint): #FFF1F3 (Accented hero containers, selected rows, chips)
```

### 3.1 Hero & Promotional Background Gradients
يُستخدم التدرج التالي فقط في المساحات الترويجية والافتتاحية (Homepage Hero, Seller Onboarding, Empty States):

```css
background: linear-gradient(135deg, #FFF1F3 0%, #FFD9DF 100%);
```

> **Design Rule:** لا يُستخدم التدرج الوردي كخلفية عامة للصفحات أو داخل الجداول وقوائم لوحات التحكم؛ للحفاظ على وضوح البيانات وراحة العين.

---

## 4. Typography

### 4.1 Font Families
* **Arabic (Primary):** `Cairo`, sans-serif (Weights: 400, 500, 600, 700)
* **English / Numbers / Code:** `Inter`, sans-serif (Weights: 400, 500, 600, 700)

### 4.2 Type Scale

| Style Name | Size | Line Height | Weight | Tailwind Class | Recommended Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 48px / 3rem | 1.15 | 700 (Bold) | `text-5xl font-bold leading-tight` | Hero headlines, landing titles |
| **H1** | 36px / 2.25rem | 1.2 | 700 (Bold) | `text-4xl font-bold leading-tight` | Page main titles, category headers |
| **H2** | 30px / 1.875rem | 1.25 | 700 (Bold) | `text-3xl font-bold leading-snug` | Section titles, dashboard widgets |
| **H3** | 24px / 1.5rem | 1.3 | 700 (Bold) | `text-2xl font-bold leading-snug` | Modal headers, product detail name |
| **H4** | 20px / 1.25rem | 1.35 | 600 (Semi) | `text-xl font-semibold leading-normal` | Card group titles, table titles |
| **Body Large** | 18px / 1.125rem | 1.6 | 400 (Regular) | `text-lg font-normal leading-relaxed` | Hero subheadings, lead paragraphs |
| **Body** | 16px / 1rem | 1.6 | 400 (Regular) | `text-base font-normal leading-relaxed` | Standard body copy, descriptions |
| **Body Small** | 14px / 0.875rem | 1.5 | 400 (Regular) | `text-sm font-normal leading-normal` | Form labels, table cells, secondary info |
| **Caption** | 12px / 0.75rem | 1.4 | 500 (Medium) | `text-xs font-medium leading-normal` | Timestamps, metadata, micro-badges |
| **Button / Action** | 15px / 0.9375rem | 1.0 | 600 (Semi) | `text-[15px] font-semibold leading-none` | Buttons, navigation links, tabs |

### 4.3 Price Display Rule
يجب أن يكون السعر مميزًا وواضحًا ومقروءًا فوريًا:
* **حجم الخط:** 20px–24px (Product Card) / 28px–32px (Product Details)
* **الوزن:** `font-weight: 700` (Bold)
* **اللون:** `#202020` (Neutral-800) مع رمز العملة (`₪`) بوزن `600` وبحجم أصغر قليلاً أو ملتصق به بشكل منسق.
* **تنسيق السلسلة:** تُعرض الأسعار كما هي مرسلة من الـ API (مثل `"25.00 ₪"` أو `"25 ₪"`) دون تقريب أو تلاعب طرفي.

---

## 5. Spacing System

مبني على وحدة أساسية 4px (**4px Base Grid**):

| Token | Size | Rem | Usage |
| :--- | :--- | :--- | :--- |
| `space-1` | 4px | 0.25rem | Icon-to-text gaps, fine padding, badge inline space |
| `space-2` | 8px | 0.5rem | Small chip gap, tight group elements, input icon offsets |
| `space-3` | 12px | 0.75rem | Badge padding, compact button padding, card inner gap |
| `space-4` | 16px | 1.0rem | Standard card padding, form field vertical gap, mobile page gutter |
| `space-5` | 20px | 1.25rem | Medium component spacing, grid column gaps on tablets |
| `space-6` | 24px | 1.5rem | Section spacing, desktop grid gutters, modal padding |
| `space-8` | 32px | 2.0rem | Component clusters, desktop card inner padding |
| `space-10` | 40px | 2.5rem | Dashboard card rows spacing, medium section headers |
| `space-12` | 48px | 3.0rem | Major page section spacing |
| `space-16` | 64px | 4.0rem | Large page dividers, landing section paddings |
| `space-20` | 80px | 5.0rem | Landing page major breaks |
| `space-24` | 96px | 6.0rem | Hero vertical padding |

---

## 6. Border Radius

| Token | Radius | Usage |
| :--- | :--- | :--- |
| `radius-sm` | 8px | Checkboxes, tooltips, nested small items, notification toasts |
| `radius-md` | 12px | Inputs, textareas, standard buttons, select dropdowns |
| `radius-lg` | 16px | Product thumbnail images, drawer containers, sub-panels |
| `radius-xl` | 20px–24px | **Product cards (20px)**, Content cards (24px), Modals (24px) |
| `radius-2xl` | 32px | Hero promo banners, onboarding splash cards |
| `radius-full` | 9999px | Avatars, pills, chips, search bar, stock badges, circular icon buttons |

---

## 7. Shadows & Elevation

| Elevation Level | Value | Usage |
| :--- | :--- | :--- |
| **Shadow Small (`--shadow-sm`)** | `0 2px 8px rgba(0, 0, 0, 0.05)` | Rest state of cards, category chips on hover, inputs on focus |
| **Shadow Medium (`--shadow-md`)** | `0 8px 24px rgba(0, 0, 0, 0.08)` | Card hover states, dropdown menus, popovers |
| **Shadow Large (`--shadow-lg`)** | `0 16px 40px rgba(0, 0, 0, 0.10)` | Modals, floating cart drawer, major overlay dialogs |
| **Brand Glow (`--shadow-glow`)** | `0 8px 20px rgba(233, 73, 94, 0.18)` | Primary CTA button hover/active, highlighted promotion card |

---

## 8. Button System

### 8.1 Button Variants

```text
┌────────────────────────────────────────────────────────┐
│  [ Primary: #E9495E ]      [ Secondary: #FFF1F3 ]      │
│  [ Outline: Border #E9495E] [ Ghost: Transparent ]     │
└────────────────────────────────────────────────────────┘
```

| Variant | Background | Border | Text Color | Shadow | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#E9495E` | None | `#FFFFFF` | `--shadow-glow` on hover | Core conversion (Add to Cart, Checkout, Save) |
| **Secondary** | `#FFF1F3` | None | `#D9364D` | None | Alternative action (Continue Shopping, Edit Draft) |
| **Outline** | Transparent | 1.5px `#E9495E` | `#D9364D` | None | Secondary emphasis, View Details, Filter toggles |
| **Ghost** | Transparent | None | `#525252` | None | Tertiary actions, Cancel, Close modal, Text links |
| **Destructive** | `#D92D3F` | None | `#FFFFFF` | `0 4px 12px rgba(217,45,63,0.2)` | Delete product, Cancel order, Suspend account |

### 8.2 Button States (Primary)
* **Default:** `bg-[#E9495E] text-white shadow-none`
* **Hover:** `bg-[#D9364D] shadow-[0_8px_20px_rgba(233,73,94,0.25)] scale-[1.01]`
* **Pressed / Active:** `bg-[#B92B3F] scale-[0.99]`
* **Disabled:** `bg-[#F5B8C1] text-white cursor-not-allowed opacity-70`
* **Loading:** `bg-[#E9495E] text-transparent relative cursor-wait` (Displays centered SVG spinner)

### 8.3 Dimensions & Spacing
* **Large (Hero/Checkout):** Height 52px, Radius 12px, Padding `0 24px`, Font 16px SemiBold
* **Default (Standard CTA):** Height 48px, Radius 12px, Padding `0 20px`, Font 15px SemiBold
* **Compact / Table:** Height 36px, Radius 8px, Padding `0 14px`, Font 13px Medium

---

## 9. Product Card Component (Core Component)

الـ `ProductCard` هو الركيزة الأساسية لتجربة التصفح والاكتشاف في سوقي.

```text
┌──────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────┐ │
│ │                                    [♥]   │ │  <- 1:1 Aspect Ratio Image
│ │              Product Image               │ │  <- Radius 16px, Bg #F8F8F8
│ │                                          │ │  <- Optional Top-Left Badge
│ └──────────────────────────────────────────┘ │
│                                              │
│  صابون طبيعي باللافندر                        │  <- Cairo 16px / SemiBold #202020
│  مشروع بيتي للصابون • مستحضرات طبيعية        │  <- Cairo 13px / Regular #737373
│                                              │
│  25 ₪                     ● متوفر           │  <- Price 20px Bold / StockBadge
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │         + إضافة للسلة                  │  │  <- Primary Button (44px, R:12px)
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 9.1 Anatomy & Specifications
* **Container:** Width 100% (Mobile/Grid responsive), Max Desktop Width `280px–300px`, Background `#FFFFFF`, Radius `20px`, Border `1px solid #EAEAEA`, Padding `12px`.
* **Image Box:** Aspect ratio `1:1`, Radius `16px`, Object-fit `cover`, Background `#F8F8F8`.
* **Badge Position:** Absolute top-left inside image (`8px` offset) for status badges (New, AI Suggested).
* **Favorite Toggle:** Absolute top-right (`8px` offset), 36px circular button `#FFFFFF` with soft shadow, Heart icon.
* **Product Title:** 16px SemiBold, 2-line clamp (`line-clamp-2`), color `#202020`.
* **Seller & Category Meta:** 13px Regular, color `#737373`, single line clamp with dot separator.
* **Price & Stock Row:** Flexbox row with `justify-between` and `items-center`.
  * Price: `text-xl font-bold text-[#202020]`.
  * Stock: `StockBadge` component.
* **Action Button:** Full width, 44px height, radius 12px, "+ إضافة للسلة" (أو "غير متوفر" مع `disabled` عند نفاد الكمية).

### 9.2 States & Behaviors
* **Hover (Desktop):** Card elevates (`--shadow-md`), image slightly scales `1.03` with smooth transition (`transition: transform 0.3s ease`).
* **Out of Stock:** Button transitions to `bg-[#F5F5F5] text-[#A8A8A8] cursor-not-allowed`, text: "غير متوفر حالياً", button has `aria-disabled="true"`.

---

## 10. Product Images & Gallery

### 10.1 Image Guidelines
* **Aspect Ratio:** Fixed `1:1` for catalog cards and gallery thumbnails; `1:1` or `4:3` for detail view.
* **Fit:** `object-fit: cover` with fallback placeholder background `#F8F8F8`.
* **Corners:** `border-radius: 16px` on main view, `12px` on thumbnails.

### 10.2 Gallery Component (Product Details)
* **Desktop:** 2-column layout:
  * Left: Main large active image (100% width, radius 20px) + horizontal thumbnail row below (4 thumbnails, 72x72px, radius 12px with 2px primary border on active thumbnail).
  * Right: Product details, seller card, stock status, purchase action.
* **Mobile:** Swipeable carousel with active bullet indicators + bottom sticky CTA bar.

---

## 11. Stock Status Component

التوافق مع قواعد المخزون في الـ PRD (`Available`, `Low Stock`, `Out of Stock`):

| Stock State | Visual Indicator | Badge Label | Badge Style | Action Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `available` | `●` Green | متوفر | `bg-[#E8F8F0] text-[#22A06B] border-[#B7ECCF]` | زر الشراء مفعل بالكامل |
| `low_stock` | `●` Amber/Orange | متبقي 3 فقط *(أو متبقي N)* | `bg-[#FFF6E9] text-[#E9A23B] border-[#FCE2B8]` | زر الشراء مفعل + تنبيه حث |
| `out_of_stock` | `●` Red / Gray | غير متوفر | `bg-[#F5F5F5] text-[#737373] border-[#EAEAEA]` | **زر الشراء معطل تماماً (Disabled)** |

> **UX Rule:** لا تظهر الكميات العددية الدقيقة للجمهور إلا إذا كانت الكمية أقل من عتبة المخزون المنخفض (`LOW_STOCK_THRESHOLD <= 5`) لتحفيز الشراء، بينما يرى البائع والـ Admin الأرقام الدقيقة دائماً.

---

## 12. Badges & Tags

### 12.1 Semantic Badges

```text
[ جديد ]  [ متبقي 3 فقط ]  [ غير متوفر ]  [ ✨ اقتراح ذكي ]
```

* **New Badge:** `bg-[#FFF1F3] text-[#E9495E] font-semibold text-xs px-2.5 py-1 rounded-full`
* **Low Stock Badge:** `bg-[#FFF6E9] text-[#E9A23B] font-semibold text-xs px-2.5 py-1 rounded-full`
* **Out of Stock Badge:** `bg-[#F5F5F5] text-[#737373] font-medium text-xs px-2.5 py-1 rounded-full`
* **AI Suggested Badge:** `bg-[#F0F5FF] text-[#3B82F6] border border-[#D0E2FF] text-xs px-2.5 py-1 rounded-full flex items-center gap-1`

### 12.2 AI Assistance Philosophy
يُعرض الذكاء الاصطناعي في واجهات سوقي كـ **مساعد ومرشد للبائع** (`AI Assistant`) وليس كجهة نشر تلقائي. أي محتوى مولد يحمل شارة `AI Suggestion` ويتطلب موافقة يدوية من البائع قبل اعتماده.

---

## 13. Form Inputs & Form Controls

### 13.1 Input Specifications
* **Height:** 48px (Standard), 40px (Compact/Table)
* **Radius:** `12px`
* **Border:** `1.5px solid #EAEAEA`
* **Background:** `#FFFFFF` (Rest) / `#FAFAFA` (Disabled)
* **Padding:** `0 16px` (with icon: `0 16px 0 44px` or RTL appropriate)
* **Typography:** 15px Regular `#202020`, Placeholder `#A8A8A8`

```text
حقل الإدخال: اسم المنتج
┌──────────────────────────────────────────────┐
│ صابون طبيعي باللافندر                       │
└──────────────────────────────────────────────┘
```

### 13.2 Input States
* **Default:** `border-[#EAEAEA] bg-white`
* **Hover:** `border-[#D6D6D6]`
* **Focus:** `border-[#E9495E] ring-4 ring-[#FFF1F3] outline-none`
* **Error:** `border-[#D92D3F] ring-4 ring-[#FDE8EA]` + نص الخطأ أسفل الحقل باللون الأحمر 13px.
* **Disabled:** `bg-[#F5F5F5] border-[#EAEAEA] text-[#A8A8A8] cursor-not-allowed`

---

## 14. Search Bar Component

شريط البحث هو أداة الاستكشاف الرئيسية في المنصة:

```text
┌──────────────────────────────────────────────────────────┐
│ 🔍  ابحث عن منتج، متجر، أو تصنيف...                      │
└──────────────────────────────────────────────────────────┘
```

* **Desktop:** العرض: `440px–560px`، الارتفاع: `48px`، الحواف: `9999px` (Pill Shape)، الخلفية: `#FFFFFF`، الإطار: `1.5px solid #EAEAEA`، ظل خفيف عند التركيز.
* **Mobile:** العرض: `100%`، الارتفاع: `44px`، يوضع أسفل الـ Navbar مباشرة مع زر تصفية سريع.
* **Features:** بحث مباشر (Instant Filter)، زر مسح النص السريع (Clear `×`)، وقائمة اقتراحات منسدلة ناعمة.

---

## 15. Navigation Systems

### 15.1 Customer Navigation (Top Bar)
* **Desktop (Height 72px, Sticky, Glassmorphism `bg-white/95 backdrop-blur-md`):**
  * **Right (RTL):** Logo «سوقي» باللون `#E9495E` مع أيقونة المتجر.
  * **Center:** شريط البحث الرئيسي + روابط التصفح (الرئيسية، المنتجات، المتاجر المحلية).
  * **Left (RTL):** أيقونة السلة (مع Badge عدد العناصر بلون `#E9495E`) + قائمة حساب المستخدم (أو أزرار تسجيل الدخول).
* **Mobile (Height 60px Top + 64px Bottom Nav):**
  * Top Bar: الشعار + زر الإشعارات/البحث + السلة.
  * Bottom Nav: 5 أزرار رئيسية: [الرئيسية] · [المنتجات] · [السلة (مع Badge)] · [طلباتي] · [حسابي].

### 15.2 Seller & Admin Navigation (Sidebar Shell)
* **Sidebar Width:** 260px (Desktop), Collapsible Drawer (Mobile).
* **Background:** `#FFFFFF` مع إطار جانبي ناعم `#EAEAEA`.
* **Active Item Style:** `bg-[#FFF1F3] text-[#E9495E] font-semibold rounded-xl mx-3 px-4 py-3 border-r-4 border-[#E9495E]`.
* **Inactive Item Style:** `text-[#525252] hover:bg-[#F5F5F5] hover:text-[#202020] rounded-xl mx-3 px-4 py-3`.

---

## 16. Cart Component & UX Rules

### 16.1 Single-Seller Rule & Multi-Seller Dialog
وفقًا للمتطلبات المعمارية (`OD04`), تدعم السلة **بائعًا واحدًا لكل طلب**:
* رأس السلة يعرض بوضوح اسم المتجر الحالي: `"منتجات من متجر: مشغل الياسمين"`.
* عند محاولة إضافة منتج من بائع آخر، يظهر `MultiSellerDialog`:
  * نص الحوار: *"سلتك تحتوي حالياً على منتجات من متجر [بائع أ]. الطلب في سوقي يتم من متجر واحد في المرة الواحدة."*
  * الإجراءات: **[تفريغ السلة وإضافة المنتج الجديد]** (Primary) أو **[الإبقاء على السلة الحالية]** (Ghost).

### 16.2 Cart Line Item Structure
```text
┌─────────────────────────────────────────────────────────────┐
│ ┌─────┐  صابون طبيعي باللافندر                    25 ₪      │
│ │ img │  سعر القطعة: 25 ₪                                   │
│ └─────┘  [ − ]  2  [ + ]               الإجمالي: 50 ₪   🗑   │
└─────────────────────────────────────────────────────────────┘
```
* **Quantity Stepper:** أزرار مريحة `[ − ]` و `[ + ]` مع إدخال رقمي، وتحديث فوري للمجموع.
* **Issue Notices (معالجة تغيرات الأسعار والمخزون):**
  * **تغير السعر (`price_changed`):** صندوق تنبيه أصفر: *"تغير سعر هذا المنتج من 20 ₪ إلى 25 ₪"* + مربع اختيار *"أوافق على السعر الجديد"*.
  * **نقص المخزون (`insufficient_stock`):** صندوق أحمر: *"الكمية المتبقية 3 فقط"* + زر سريع *"تعديل الكمية إلى 3"*.
  * **نفاد المنتج (`product_unavailable`):** زر إزالة المنتج مع تعطيل زر إتمام الطلب حتى الحل.

---

## 17. Mock Checkout Layout

الـ MVP يعتمد على **Mock Checkout** بدون بوابات دفع حقيقية أو تعقيدات شحن خارجية:

```text
Desktop Layout (12 Columns)
┌──────────────────────────────────────┬───────────────────────────────┐
│ بيانات التوصيل والاستلام (7 Cols)   │ ملخص الطلب (5 Cols Sticky)   │
│                                      │                               │
│ • الاسم الكامل (مطلوب)               │ • صابون طبيعي x 2     50 ₪    │
│ • رقم الهاتف (مطلوب للتواصل)         │ • شمعة معطرة x 1      30 ₪    │
│ • عنوان التوصيل / المدينة (مطلوب)     │ ───────────────────────────── │
│ • ملاحظات للبائع (اختياري)           │ المجموع الفرعي:       80 ₪    │
│                                      │ رسوم التوصيل:        يحدد لاحقاً│
│ [ طريقة الدفع: الدفع عند الاستلام ]  │ الإجمالي:            80 ₪    │
│                                      │                               │
│                                      │ [ ✨ تأكيد وإرسال الطلب ]     │
└──────────────────────────────────────┴───────────────────────────────┘
```

* **زر التأكيد (`SubmitButton`):** يستخدم `Idempotency-Key` لمنع تكرار الطلب، ويتحول لحالة التحميل فور النقر لمنع النقرات المتعددة.

---

## 18. Order Status & Tracking Component

### 18.1 Order Status Stepper
يعتمد النظام تسلسل الحالات الست المعتمدة في الـ PRD:

```text
  (1) Pending    ──▶   (2) Confirmed   ──▶   (3) Preparing   ──▶   (4) Ready   ──▶   (5) Completed
 قيد الانتظار          تم التأكيد             جاري التجهيز          جاهز للتسليم       مكتمل
```
* **الحالة النشطة:** دائرة بلون `#E9495E` مع وهج ناعم ونص عريض.
* **الحالات السابقة المنجزة:** علامة `✓` خضراء `#22A06B`.
* **الحالات اللاحقة:** دائرة رمادية `#D6D6D6`.
* **حالة الإلغاء (`Cancelled`):** حالة نهائية منفصلة؛ يظهر شريط أحمر بارز `#D92D3F` يوضح إلغاء الطلب مع سبب الإلغاء، ويُتاح الإلغاء للعميل فقط في حالتي `Pending` و `Confirmed`.

---

## 19. Seller Dashboard

واجهة عملية ومنظمة بأعلى درجات الكفاءة:

### 19.1 KPI Metrics Tiles
4 بطاقات إحصائية رئيسية تعتمد خلفية بيضاء مع أيقونة ملونة:
1. **إجمالي المنتجات:** عدد المنتجات النشطة.
2. **الطلبات الجديدة:** عدد الطلبات قيد الانتظار.
3. **تنبيه المخزون:** المنتجات ذات المخزون المنخفض (`Low Stock`) أو النافدة (`Out of Stock`).
4. **المبيعات التقديرية:** إجمالي المبيعات المكتملة.

### 19.2 Products Table & Actions
* عرض الكمية الفعلية للمخزون (`stock_quantity`) والتي لا تظهر للجمهور.
* أزرار سريعة لكل سطر: [تعديل] · [نشر/تعطيل] · [تحديث المخزون].
* شارة حالة المنتج: `Draft` / `Published` / `Under Review` / `Rejected` (مع عرض ملاحظة المراجعة `moderation_note`).

---

## 20. Admin Dashboard

لوحة التحكم الإدارية تعتمد لغة بصرية متزنة ومحايدة لتقليل الإجهاد البصري:

```text
Sidebar:
• نظرة عامة (Overview)
• مراجعة المنتجات (Product Moderation)
• إدارة الطلبات (Orders Management)
• المستخدمين والمتاجر (Users & Sellers)
• التصنيفات (Categories)
• اقتراحات الذكاء الاصطناعي (AI Review Queue)
• الإعدادات (Settings)
```

* **قاعدة مراجعة المنتجات:** في حال رفض منتج، يُلزم المشرف بإدخال `moderation_note` توضيحية، ويكون زر الرفض معطلاً حتى كتابة السبب.
* **إدارة المستخدمين:** زر إيقاف فوري للحسابات المخالفة (`Suspend`) يمنع الدخول ويلغي الجلسات النشطة فوراً.

---

## 21. AI Assistance Components

مكونات الذكاء الاصطناعي مدمجة في مسار عمل البائع:

### 21.1 AI Description & Tag Generator Panel
* **المظهر:** صندوق جانبي محاط بإطار ناعم وخلفية `#FFF1F3`، يحمل شارة `✨ مساعد سوقي الذكي`.
* **سير العمل:**
  1. البائع يدخل اسم المنتج وبعض الكلمات المفتاحية.
  2. ينقر على `[ توليد وصف بالذكاء الاصطناعي ]`.
  3. يظهر الـ Skeleton Loader الخاص بالذكاء الاصطناعي.
  4. تظهر النتيجة مع خيارين واضحين: **[استخدام هذا الاقتراح]** (يعبئ الحقل تلقائياً) أو **[تعديل / رفض]**.
* **قاعدة الأمان:** لا يتم نشر أو حفظ أي منتج تلقائياً دون ضغط البائع على زر الحفظ النهائي (`Save/Publish`).

---

## 22. Modal & Dialog System

```text
┌────────────────────────────────────────────────────────┐
│ عنوان الحوار                                       ✕   │
│ وصف توضيحي يحدد الغرض من الإجراء وسياقه.               │
├────────────────────────────────────────────────────────┤
│ محتوى الحوار أو النموذج...                             │
│                                                        │
├────────────────────────────────────────────────────────┤
│ [ إلغاء / تراجع ]                  [ تأكيد الإجراء ]   │
└────────────────────────────────────────────────────────┘
```
* **الأبعاد:** Desktop: `480px–600px` (عرض مخصص)، Mobile: `calc(100% - 32px)`.
* **الزوايا:** `24px`، الظل: `--shadow-lg`.
* **الخلفية المعتمة (Backdrop):** `rgba(0, 0, 0, 0.45)` مع `backdrop-blur-sm`.
* **إمكانية الوصول:** إغلاق بـ `Esc`، حصر التركيز داخل الحوار (`Focus Trap`)، وإعادة التركيز للزر المشغل عند الإغلاق.

---

## 23. Toasts & Notifications

تظهر الإشعارات أعلى أو أسفل الشاشة بارتفاع متناسق وظلال ناعمة:

* **Success (نجاح):** أيقونة `✓` خضراء + خلفية بيضاء مع إطار أخضر `#22A06B` — *"تمت إضافة المنتج إلى السلة بنجاح"*.
* **Error (خطأ):** أيقونة `✕` حمراء + خلفية بيضاء مع إطار أحمر `#D92D3F` — *"تعذر إتمام العملية، يرجى المحاولة لاحقاً"*.
* **Warning (تنبيه):** أيقونة `!` برتقالية — *"الكمية المتبقية غير كافية"*.
* **Info (معلومة):** أيقونة `i` زرقاء — *"تم تحديث تفاصيل الطلب"*.

---

## 24. Loading States & Skeletons

> **قاعدة صارمة:** لا يُسمح بظهور شاشات بيضاء فارغة أو مؤشرات دوارة عائمة تغطي الشاشة دون سياق.

### 24.1 Product Card Skeleton
* مستطيل علوي بنسبة 1:1 مع وميض انسيابي (`animate-pulse bg-neutral-100 rounded-2xl`).
* سطران للنصوص (عرض 80% وعرض 50%).
* سطر سفلي للسعر والزر.

---

## 25. Empty States

يجب أن تكون الشاشات الفارغة مشجعة وذات خطوة عمل واضحة:

```text
                    🛒
              سلتك فارغة حالياً
  لم تقم بإضافة أي منتجات من المشاريع المحلية بعد.
  استكشف أفضل المنتجات اليدوية والمصنوعة بحب!

           [ 🔍 تصفح المنتجات الآن ]
```

---

## 26. Error States & Error Recovery

جميع رسائل الأخطاء يجب أن تكون **قابلة للتنفيذ (Actionable)** وتشرح كيفية المتابعة:

| الخطأ | الرسالة المعروضة | الإجراء التصحيحي |
| :--- | :--- | :--- |
| انقطاع الاتصال | *"تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت."* | زر **[ إعادة المحاولة ]** |
| منتج غير موجود (404) | *"هذا المنتج لم يعد متوفراً أو تم حذفه من قبل البائع."* | زر **[ العودة للسوق ]** |
| سلة فارغة عند الشراء | *"سلتك فارغة، يرجى إضافة منتجات قبل إتمام الطلب."* | زر **[ تصفح المنتجات ]** |
| تعارض سلة متعددة المتاجر | *"لا يمكن الجمع بين منتجات متاجر مختلفة في طلب واحد."* | حوار **`MultiSellerDialog`** |

---

## 27. Grid & Responsive Layout System

### 27.1 Grid Specifications

| الجهاز | العرض | الأعمدة | المسافة بين الأعمدة (Gutter) | هامش الصفحة (Padding) | Max Container |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `< 768px` | 4 أعمدة | 16px | 16px | 100% |
| **Tablet** | `768px – 1023px`| 8 أعمدة | 20px | 24px | 100% |
| **Desktop** | `≥ 1024px` | 12 عمود | 24px | 32px | 1200px |

### 27.2 Product Catalog Grid Distribution
* **Mobile (xs/sm):** 1 إلى 2 عمود حسب حجم الشاشة.
* **Tablet (md):** 2 إلى 3 أعمدة.
* **Desktop (lg/xl):** 4 أعمدة متساوية ومنظمة.

---

## 28. Breakpoints

```css
/* Tailwind Breakpoints */
screens: {
  'xs': '480px',   /* Large phones */
  'sm': '640px',   /* Small tablets / landscape phones */
  'md': '768px',   /* Tablets */
  'lg': '1024px',  /* Laptops / Desktops */
  'xl': '1280px',  /* Desktop standard */
  '2xl': '1440px', /* Wide monitors */
}
```

---

## 29. Iconography System

نظام موحد مبني على مكتبة **`Lucide React`**:
* **سُمك الخط (Stroke Width):** `1.8px–2.0px`
* **النهايات (Caps):** `Round` و `Line Join: Round`
* **قائمة الأيقونات الأساسية في سوقي:**
  * `Home`, `Store`, `ShoppingBag`, `ShoppingCart`, `User`, `Heart`, `Package`, `Truck`, `CheckCircle`, `AlertCircle`, `XCircle`, `Info`, `Search`, `Plus`, `Minus`, `Trash2`, `Edit3`, `ChevronRight`, `ChevronLeft`, `Sparkles`, `SlidersHorizontal`.

---

## 30. Illustration & Visual Assets

* **الأسلوب:** رسومات مسطحة ناعمة (Flat with Soft Depth)، زوايا دائرية، ألوان متوافقة مع الـ Palette (`#FFF1F3`, `#E9495E`, `#22A06B`).
* **مواقع الاستخدام المحددة:**
  * الشاشات الفارغة (Empty Cart, Empty Orders).
  * بطاقة الترحيب بتسجيل البائعين الجدد.
  * صفحة إتمام الطلب بنجاح (`Order Success`).
  * صفحات الأخطاء (404, 500).

---

## 31. Component Architecture (Next.js 15)

هيكلية مجلدات الواجهة البرمجية في React / Next.js:

```text
src/
├── app/
│   ├── layout.tsx                # Base HTML & Cairo/Inter font configuration
│   ├── globals.css               # Design Tokens & Tailwind Directives
│   ├── (customer)/
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          # Catalog Discovery
│   │   │   └── [id]/page.tsx     # Product Details
│   │   ├── cart/page.tsx         # Cart View
│   │   ├── checkout/page.tsx     # Mock Checkout
│   │   └── orders/
│   │       ├── page.tsx          # Orders List
│   │       └── [id]/page.tsx     # Order Tracking & Details
│   ├── (seller)/
│   │   └── seller/
│   │       ├── dashboard/page.tsx
│   │       ├── products/page.tsx
│   │       └── orders/page.tsx
│   └── (admin)/
│       └── admin/
│           ├── dashboard/page.tsx
│           ├── moderation/page.tsx
│           ├── orders/page.tsx
│           └── users/page.tsx
│
├── components/
│   ├── ui/                       # Atom Components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   └── Stepper.tsx
│   ├── navigation/               # Nav Components
│   │   ├── Navbar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── product/                  # Product Specifics
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── StockBadge.tsx
│   │   └── QuantityStepper.tsx
│   ├── cart/                     # Cart Logic Components
│   │   ├── CartLineItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── MultiSellerDialog.tsx
│   ├── checkout/                 # Checkout Form & Order Summary
│   │   ├── DeliveryForm.tsx
│   │   └── CheckoutSummary.tsx
│   ├── orders/                   # Order Components
│   │   ├── OrderProgressStepper.tsx
│   │   └── OrderTimeline.tsx
│   └── ai/                       # AI Assistant Components
│       ├── AIDescriptionPanel.tsx
│       └── AISuggestionBadge.tsx
```

---

## 32. Technical Design Tokens (CSS Variables)

ضع هذه المتغيرات في ملف `globals.css` ليتم استهلاكها مباشرة في المشروع:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Primary Brand Tokens (Coral / Rose Red) */
  --color-primary-50: #FFF1F3;
  --color-primary-100: #FFE3E7;
  --color-primary-200: #FFC9D1;
  --color-primary-300: #F8AEBB;
  --color-primary-400: #EB8996;
  --color-primary-500: #E9495E;
  --color-primary-600: #D9364D;
  --color-primary-700: #B92B3F;
  --color-primary-800: #932338;
  --color-primary-900: #641423;

  /* Primary Aliases */
  --color-primary: var(--color-primary-500);
  --color-primary-hover: var(--color-primary-600);
  --color-primary-active: var(--color-primary-700);
  --color-primary-soft: var(--color-primary-50);

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F5F5F5;
  --color-neutral-200: #EAEAEA;
  --color-neutral-300: #D6D6D6;
  --color-neutral-400: #A8A8A8;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #363636;
  --color-neutral-800: #202020;
  --color-neutral-900: #111111;

  /* Functional Surfaces */
  --color-bg-page: var(--color-neutral-50);
  --color-bg-surface: var(--color-white);
  --color-border: var(--color-neutral-200);
  --color-text-main: var(--color-neutral-800);
  --color-text-muted: var(--color-neutral-500);

  /* Semantic Feedback */
  --color-success: #22A06B;
  --color-success-soft: #E8F8F0;
  --color-warning: #E9A23B;
  --color-warning-soft: #FFF6E9;
  --color-error: #D92D3F;
  --color-error-soft: #FDE8EA;
  --color-info: #3B82F6;
  --color-info-soft: #F0F5FF;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.10);
  --shadow-glow: 0 8px 20px rgba(233, 73, 94, 0.18);

  /* Layout */
  --container-max-width: 1200px;
  --page-padding-mobile: 16px;
  --page-padding-desktop: 32px;
}
```

---

## 33. Visual Language Balance Rule (The 80 / 15 / 5 Rule)

لضمان مظهر تجاري راقٍ ومريح دون مبالغة في اللون الوردي أو الأحمر:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  80% Neutral & White Surfaces                                         │
│  (Clean background, white cards, high-readability dark typography)     │
├────────────────────────────────────────┬───────────────────────────────┤
│  15% Soft Blush Pink (#FFF1F3)         │  5% Primary Red (#E9495E)    │
│  (Hero tints, badges, selected chips)  │  (CTAs, key prices, badges)   │
└────────────────────────────────────────┴───────────────────────────────┘
```

---

## 34. Homepage Structure (Wireframe & Information Architecture)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo سوقي]        [ابحث عن منتج أو متجر...]           [طلباتي] [🛒 2] [👤 حسابي]│
├──────────────────────────────────────────────────────────────────────────────┤
│ HERO SECTION (Background: Soft Pink Gradient #FFF1F3 -> #FFD9DF)             │
│                                                                              │
│    ✨ من يد صانعيها إليك مباشرة                                             │
│    اكتشف أشهى المأكولات، الحرف اليدوية، والمنتجات المنزلية الأصيلة          │
│                                                                              │
│    [ 🔍 ابحث في المنتجات المحلية...               ] [ تصفح السوق ]           │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ CATEGORIES SECTION                                                           │
│ [ 🍰 مأكولات وحلويات ] [ 🌿 عناية وصابون ] [ 🧶 حرف وأشغال ] [ 🕯 شموع وديكور ]│
├──────────────────────────────────────────────────────────────────────────────┤
│ FEATURED LOCAL PRODUCTS (Grid 4 Columns)                                     │
│                                                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ [Image 1:1]  │ │ [Image 1:1]  │ │ [Image 1:1]  │ │ [Image 1:1]  │          │
│ │ صابون طبيعي  │ │ كعك بيتي     │ │ شمعة صويا    │ │ حقيبة كروشيه │          │
│ │ 25 ₪  ●متوفر │ │ 40 ₪  ●متوفر │ │ 35 ₪ ●متبقي2 │ │ 60 ₪  ●متوفر │          │
│ │ [+ أضف للسلة]│ │ [+ أضف للسلة]│ │ [+ أضف للسلة]│ │ [+ أضف للسلة]│          │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │
├──────────────────────────────────────────────────────────────────────────────┤
│ TRUST & COMMUNITY BANNER                                                     │
│ 🛡️ دعم مباشر للمشاريع المنزلية • 📦 استلام وتنسيق موثوق • 🤝 منتجات طازجة وصنع محلي│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 35. Core Component Design Specs (Deep Dive)

### 35.1 `ProductCard` Specification
* **Purpose:** عرض تفاصيل المنتج في شبكة العرض والبحث وتسهيل إضافته للسلة.
* **Anatomy:** Container > ImageWrapper > Badges > WishlistBtn > InfoWrapper (Title, Seller, Category) > PriceStockRow > CTAButton.
* **Accessibility:**
  * صورة المنتج تحتوي دائماً على `alt={product.name}`.
  * زر الإضافة يحتوي على `aria-label={`إضافة ${product.name} إلى السلة`}`.
  * عند نفاد المخزون، يُضاف `aria-disabled="true"` وتظل الزر قابلاً للوصول عبر لوحة المفاتيح لقراءة سبب التعطيل.

### 35.2 `CartLineItem` Specification
* **Purpose:** إدارة كمية المنتج في السلة ومراجعة التنبيهات المرتبطة بالمخزون والأسعار.
* **Anatomy:** RowContainer > ProductThumbnail (64x64px) > TitleAndMeta > PriceTag > QuantityStepper > LineTotal > RemoveButton.
* **States:**
  * **Normal:** إمكانية تعديل الكمية حتى حد المخزون المتوفر.
  * **Price Changed:** وميض تنبيه + Checkbox للموافقة.
  * **Insufficient Stock:** تحديد الكمية بالحد الأقصى المتبقي.

### 35.3 `OrderProgressStepper` Specification
* **Purpose:** إعطاء العميل رؤية فورية وواضحة لمرحلة تجهيز واستلام طلبه.
* **Anatomy:** StepperTrack > StepNodes (Icon + Label) > ConnectingBar.
* **States:** `Completed` (Green check), `Current` (Coral pulse), `Upcoming` (Gray outline), `Cancelled` (Red alert state).

---

## 36. Design Principles for Developers

يجب على أي مطور يساهم في واجهات منصة «سوقي» الالتزام التام بالقواعد التالية:

1. **Commerce First over Decoration:** لا تضف زخارف أو تدرجات لونية كثيفة تعيق مسار الشراء والتصفح السريع.
2. **Single-Seller Cart Integrity:** لا تسمح أبدًا بدمج منتجات متجرين مختلفين في سلة واحدة، واستخدم `MultiSellerDialog` دائمًا.
3. **Honest Stock States:** التزم بحالات المخزون الثلاث (`Available`, `Low Stock`, `Out of Stock`) وعطّل أزرار الشراء فور نفاد المخزون.
4. **Authoritative Server Pricing:** لا تحسب أو تعدل الأسعار طرفيًا؛ استعرض السلسلة النصية المرسلة من الخادم مباشرة.
5. **No Blind AI Automation:** كل ما يخرج من الـ AI هو اقتراح (`Suggestion`) يتطلب زر قبول يدوي وتأكيد من البائع.
6. **Actionable Error Feedback:** أي رسالة خطأ تظهر للمستخدم يجب أن تقدم حلًا أو زرًا لإعادة المحاولة.
7. **Strict Token Adherence:** استخدم متغيرات الـ CSS والـ Tailwind Classes المعرفة في هذا الملف حصريًا، وتجنب استخدام ألوان HEX عشوائية داخل المكونات.
8. **Accessibility by Default:** تأكد من تباين الألوان (4.5:1 للنصوص)، وجود `Focus Ring` واضح، وتسميات `aria-*` لكافة الأزرار التفاعلية.
9. **Resilient Loading & Empty States:** كل صفحة أو قائمة يجب أن تبنى بحالاتها الأربع: التحميل (Skeleton)، البيانات (Default)، الفراغ (Empty)، والخطأ (Error).
