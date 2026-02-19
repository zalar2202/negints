# Panel Implementation Overview

## Scope (this app)

- **Auth:** Login/logout, httpOnly cookie (`logatech_auth_token`), RouteGuard for `/panel/*`.
- **Layout:** Sidebar + Header; routes under **`/panel/*`** (not a route group name like `(dashboard)`).
- **Features:** **User management** (CRUD, list with server-side pagination), **Notifications** (FCM, dropdown, full page, send page).
- **State:** Redux (users, notifications), Context (auth, theme).

Companies, transactions, packages, payments, promotions are **not** implemented in this app.

---

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind v4 + CSS custom properties (no SASS in build)
- **Auth:** JWT in **httpOnly cookie** (see [../auth/COOKIE_AUTHENTICATION.md](../auth/COOKIE_AUTHENTICATION.md))
- **State:** Redux Toolkit (users, notifications), React Context (auth, theme)
- **Forms:** Formik + Yup
- **HTTP:** Axios (withCredentials for cookies)
- **UI:** Sonner toasts, Lucide icons, custom table/layout components

---

## Route structure

| Area | Path | Notes |
|------|------|--------|
| Login | `/login` | Auth layout |
| Panel | `/panel/*` | Dashboard layout; requires auth |
| Panel home | `/panel/dashboard` | |
| Users | `/panel/users`, `/panel/users/create`, `/panel/users/[id]`, `/panel/users/[id]/edit` | |
| Notifications | `/panel/notifications`, `/panel/notifications/send` | |
| Dev/test | `/panel/firebase-test`, `/panel/backend-notification-test`, `/panel/test-connection`, `/panel/test-axios`, `/panel/debug-auth`, `/panel/components-demo`, `/panel/register-admin` | |

---

## Key docs

- Setup: [../setup/DATABASE_AUTH.md](../setup/DATABASE_AUTH.md), [../setup/AUTH_TROUBLESHOOTING.md](../setup/AUTH_TROUBLESHOOTING.md)
- Auth: [../auth/COOKIE_AUTHENTICATION.md](../auth/COOKIE_AUTHENTICATION.md)
- Notifications: [../notifications/README.md](../notifications/README.md)
- UI: [../ui/DARK_MODE.md](../ui/DARK_MODE.md), [../ui/TABLE_COMPONENTS.md](../ui/TABLE_COMPONENTS.md)
- Pagination: [PAGINATION_PATTERNS.md](PAGINATION_PATTERNS.md)
- Redux: [REDUX_GUIDE.md](REDUX_GUIDE.md)
- File upload: [FILE_UPLOAD.md](FILE_UPLOAD.md)

Detailed phase-by-phase plans from earlier in the project are omitted here; the above reflects the current app.
