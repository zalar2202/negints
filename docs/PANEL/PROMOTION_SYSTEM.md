# Promotion System Documentation

## Overview
The LogaTech Promotion System allows administrators to create and manage discount codes that users can apply to their carts. Discounts can be either a fixed amount or a percentage of the subtotal.

## Key Features
- **Discount Types:** Supports "Percentage" and "Fixed Amount".
- **Category Restrictions:** Limit promotions to specific service categories (e.g., Design only, excluding Hosting).
- **Sharing:** Easily share promotion details and codes via Web Share API or Clipboard.
- **Usage Limits:** Limit the total number of times a promotion can be used.
- **Minimum Purchase:** Set a minimum subtotal requirement for a promotion to be valid.
- **Date Range:** Define start and end dates for promotion validity.
- **Tracking:** Automatically tracks `usedCount` and associates promotions with generated invoices.

## Data Models

### Promotion Model (`src/models/Promotion.js`)
- `title`: Human-readable title.
- `discountCode`: Unique uppercase code (e.g., "SAVE20").
- `discountType`: `percentage` or `fixed`.
- `discountValue`: Numerical value of the discount.
- `minPurchase`: Minimum subtotal required (default: 0).
- `usageLimit`: Max number of uses (null for unlimited).
- `usedCount`: Current number of successful checkouts using this code.
- `startDate`: Optional start date.
- `endDate`: Optional expiration date.
- `isActive`: Boolean toggle.
- `applicableCategories`: Array of strings representing service categories (e.g. `['design', 'development']`). If empty, the promotion applies to all categories.

### Cart Model (`src/models/Cart.js`)
- `appliedPromotion`: Reference to the currently applied `Promotion`.

### Invoice Model (`src/models/Invoice.js`)
- `promotion`: Embedded object storing:
    - `code`: The code used at checkout.
    - `discountAmount`: The actual dollar amount saved.

## API Endpoints

### Validation
`POST /api/promotions/validate`
- **Body:** `{ code: string, subtotal: number, items: Array }`
    - `items`: Required for category-specific discounts. Should contain objects with `price`, `quantity`, and `category` (or `package.category`).
- **Returns:** Calculated discount amount and promotion details if valid. Note: Discounts are calculated only on items matching the `applicableCategories`.

### Management
`GET /api/promotions` - List promotions.
`POST /api/promotions` - Create promotion.
`PUT /api/promotions/[id]` - Update promotion.
`DELETE /api/promotions/[id]` - Delete promotion.

## Usage Flow
1. **Admin Action:** Create a promotion in the Admin Panel -> Promotions page.
2. **User Action:** Enter the code on the Cart page.
3. **System Action:** Frontend calls `/api/promotions/validate` to show the expected discount.
4. **Checkout:** When the user clicks "Checkout", the backend validates the code again, increments `usedCount`, applies the discount to the `Invoice`, and clears the cart's `appliedPromotion`.

## Accounting Integration
The Admin Accounting page displays "Promotion Savings", representing the total discounts given across all paid invoices.
