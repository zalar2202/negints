# Redux Guide (Panel)

## Overview

The panel uses **Redux Toolkit** for list/UI data and **React Context** for auth and theme. Redux runs on the client only (`"use client"` where used).

---

## What lives where

| Context | Use |
|--------|-----|
| **AuthContext** | User, login/logout; token is in httpOnly cookie (not in Redux/localStorage) |
| **ThemeContext** | Light/dark theme |
| **Redux** | Users list, notifications list, pagination, filters, loading/error for those features |

---

## Redux in this app

**Slices present:**

- **users** – `src/features/users/usersSlice.js` (list, pagination, filters, fetchUsers, etc.)
- **notifications** – `src/features/notifications/notificationsSlice.js` (list, unread count, fetch, mark read, etc.)

**Not in this app:** Companies, Transactions, Packages, Payments, Promotions (no slices or routes for them).

---

## Key files

| File | Role |
|------|------|
| `src/lib/store.js` | Store config; registers users + notifications reducers |
| `src/lib/StoreProvider.js` | Client provider wrapping app |
| `src/lib/hooks.js` | `useAppDispatch`, `useAppSelector` |
| `src/features/users/usersSlice.js` | Users state + async thunks |
| `src/features/notifications/notificationsSlice.js` | Notifications state + async thunks |

---

## Usage

```javascript
"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUsers, setPage } from "@/features/users/usersSlice";

const dispatch = useAppDispatch();
const { list, loading, pagination } = useAppSelector((state) => state.users);

useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
}, [dispatch]);
```

---

## Adding a new feature slice

1. Create `src/features/[feature]/[feature]Slice.js` (initial state, reducers, extraReducers for async thunks).
2. Register the reducer in `src/lib/store.js`.
3. Call the API from the slice (e.g. via service in `src/services/`). Use the same pagination pattern as users when the list is paginated (see [PAGINATION_PATTERNS.md](PAGINATION_PATTERNS.md)).
