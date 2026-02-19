# Server-Side Pagination Patterns

## Overview

Use these patterns for **panel list pages** (e.g. users). URL is the **single source of truth**; Redux is synced from the URL. Reference: **User Management** (`src/app/panel/users/page.js`).

---

## Critical: avoid circular dependencies

- ✅ URL is the single source of truth.
- ✅ Redux state is synced **from** URL (for UI only).
- ✅ Fetch using URL params; handlers read from URL, not Redux.
- ✅ Main effect depends on `searchParams` (and dispatch), not Redux list/filters.

---

## Backend response shape

```javascript
{
  data: [...],
  links: { next: "url?page=2&limit=10", prev: "url?page=1&limit=10" },
  meta: { current_page: 1, last_page: 10, total: 100 }
}
```

---

## Frontend

- **Redux slice:** `list`, `pagination` (page, limit, total, pages), `links`, `filters`; handle `fetchItems.fulfilled` by writing `data`, `links`, `meta` into state.
- **Page component:** `useSearchParams`, `useRouter`; `updateUrl(params)` to change URL; one `useEffect` that reads URL → validates → dispatches `setPage`/`setFilters` and `fetchItems(params from URL)`; handlers call `updateUrl` (e.g. page change, filter change).
- **Pagination UI:** `<Pagination currentPage={...} totalPages={...} onPageChange={handlePageChange} ... />`.

Full templates and checklist: see the Cursor rules (`.cursor/rules/logatech-admin-panel.mdc`) under "Server-Side Pagination Patterns". Reference implementation: `src/app/panel/users/page.js`, `src/app/api/users/route.js`, `src/features/users/usersSlice.js`.

---

## URL examples (this app)

```
/panel/users
/panel/users?page=2
/panel/users?search=john
/panel/users?page=2&search=john&status=active
```
