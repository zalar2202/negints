# NeginTS Admin Panel – Documentation

Documentation for the **admin panel** (protected dashboard) in this repo. The panel lives under `/panel/*` and includes authentication, user management, and notifications.

## Quick links

| Topic | Location |
|-------|----------|
| **First-time setup** (DB, env, seed admin) | [setup/DATABASE_AUTH.md](setup/DATABASE_AUTH.md) |
| **Auth issues** (JWT, FCM token errors) | [setup/AUTH_TROUBLESHOOTING.md](setup/AUTH_TROUBLESHOOTING.md) |
| **Cookie-based auth** (how it works) | [auth/COOKIE_AUTHENTICATION.md](auth/COOKIE_AUTHENTICATION.md) |
| **Notifications** (FCM, UI, testing) | [notifications/README.md](notifications/README.md) |
| **Dark mode** | [ui/DARK_MODE.md](ui/DARK_MODE.md) |
| **Table components** | [ui/TABLE_COMPONENTS.md](ui/TABLE_COMPONENTS.md) |
| **Pagination** (server-side pattern) | [guides/PAGINATION_PATTERNS.md](guides/PAGINATION_PATTERNS.md) |
| **Redux** (store, slices) | [guides/REDUX_GUIDE.md](guides/REDUX_GUIDE.md) |
| **Implementation overview** | [guides/IMPLEMENTATION_PLAN.md](guides/IMPLEMENTATION_PLAN.md) |
| **File upload** | [guides/FILE_UPLOAD.md](guides/FILE_UPLOAD.md) |
| **Common Components** | [ui/COMMON_COMPONENTS.md](ui/COMMON_COMPONENTS.md) |
| **Form Components** | [ui/FORMS.md](ui/FORMS.md) |
| **API Reference** | [API_REFERENCE.md](API_REFERENCE.md) |
| **Code Structure / Libs** | [LIBRARIES.md](LIBRARIES.md) |
| **Accounting & Finance** | [accounting/README.md](accounting/README.md) |

## Panel routes (this app)

- **Login:** `/login` (auth layout)
- **Dashboard:** `/panel/dashboard`
- **Users:** `/panel/users`, `/panel/users/create`, `/panel/users/[id]`, `/panel/users/[id]/edit`
- **Notifications:** `/panel/notifications`, `/panel/notifications/send`
- **Tests / dev:** `/panel/firebase-test`, `/panel/backend-notification-test`, `/panel/test-connection`, `/panel/test-axios`, `/panel/debug-auth`, `/panel/components-demo`, `/panel/register-admin`
- **Settings:** `/panel/settings`
- **Accounting:** `/panel/admin/accounting` (invoices, expenses, finance dashboard)

All panel routes use the same layout (sidebar + header) and require authentication (redirect to `/login` if not logged in).

## Tech stack (panel)

- **Auth:** JWT in **httpOnly cookie** (`negints_secure_token`), not localStorage.
- **State:** Redux Toolkit (users, notifications) + React Context (auth, theme).
- **API:** Next.js API routes under `/api/*`; axios with cookie credentials.
- **Styling:** Tailwind v4 + CSS custom properties (see [ui/DARK_MODE.md](ui/DARK_MODE.md)).

## Folder structure

```
docs/PANEL/
├── README.md                 ← You are here
├── setup/                    # Env, DB, first-run, auth troubleshooting
├── auth/                     # Cookie auth guide
├── notifications/             # FCM, notification UI, testing
├── ui/                        # Dark mode, tables, layout
└── guides/                    # Pagination, Redux, implementation plan, file upload
```
