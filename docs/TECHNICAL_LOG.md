# Project Technical Log - February 2026

This log tracks significant technical updates, bug fixes, and feature enhancements for the NeginTS application.

---

## [2026-02-19] - Website & Product System Refinement

### 🚀 Features & Enhancements
- **Dynamic Product Categories**:
    - Replaced static category rendering with dynamic fetching from `ProductCategory` model.
    - Implemented a robust filtering logic in `ProductsListClient` that supports:
        - `categoryId` (ObjectId matching).
        - Legacy `displayCategory` (String/Slug matching).
    - Added synchronization between URL query parameters and category selection state.
- **Product Page Resilience**:
    - Updated `ProductPage` and `generateMetadata` to fetch products by either `slug` or `_id`.
    - Prevents 404 errors for legacy products or internal links missing slugs.
- **SEO & Metadata**:
    - Implemented `BreadcrumbList` schema on single product pages.
    - Added dynamic OpenGraph and Twitter metadata for improved social sharing.

### 🐛 Bug Fixes
- **Header Overlap Fix**:
    - Resolved global content overlap with the fixed header by adding a `main-content` layout wrapper with top padding.
    - Cleaned up redundant `main-content` classes from individual pages to maintain consistent spacing.
- **Hero & Navigation Links**:
    - Corrected the "View Products" CTA in the Hero section (previously linked to internal section anchors).
    - Updated all homepage category links (tagline and service pillars) to use the correct `/products?category=...` query format.
- **Related Products Links**:
    - Fixed broken links in the "Related Products" section by adding an `_id` fallback for products without slugs.
- **Branding Update**:
    - Corrected brand name from "نوین طب سازه" (Novin Teb Sazeh) to "نگین تجهیز سپهر" (Negin Tajhiz Sepehr) in the FAQ and Process sections.
- **Hydration Fix**:
    - Added `suppressHydrationWarning` to the root `body` tag to prevent mismatches caused by dynamic theme variables and manual DOM attributes.

---

## [Previous Updates] - Cart & Currency System
- **Default Currency**: Set Iranian Rial (IRT/Toman) as the default currency for the website.
- **Exchange Rate Integration**: Implemented logic to use real-time or stored exchange rates for price conversions in the cart and checkout.
- **Mongoose Model Validation**: Improved `Package` and `ProductCategory` models with better validation and indexing.
