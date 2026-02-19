# NeginTS

A Next.js 14+ app containing **two applications**: a **public e-commerce website** (NeginTS – Specialized Medical Equipment & Engineering) and a **protected admin panel** (inventory management, orders, notifications, FCM). Built with React 19, Tailwind, Redux Toolkit, and MongoDB.

![Next.js](https://img.shields.io/badge/Next.js-14.x-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.5.0-764abc)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What’s in this repo

| App             | Routes                                                                                 | Purpose                                                                         |
| --------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Website**     | `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`                             | Public e-commerce site; medical equipment catalog and specialized services      |
| **Admin panel** | `/panel/*` (dashboard, users, products, orders, notifications, accounting)              | Protected dashboard; JWT in httpOnly cookie; management, FCM notifications |

- **Login:** `/login` → redirects to `/panel/dashboard` when authenticated.
- **Docs:** [docs/PANEL/README.md](docs/PANEL/README.md) (panel), [docs/WEBSITE/](docs/WEBSITE/) (website).

---

## Features

### Website (public)

- Landing page with hero, services, process, tech stack, FAQ, CTA
- Service pages: Design, Develop, Deploy, Maintain
- Scroll animations, dark mode, responsive layout
- No auth; Server Components where possible

### Admin panel (protected)

- **Auth:** JWT in **httpOnly cookie** (`negints_auth_token`); route guard for `/panel/*`
- **User management:** CRUD, list with server-side pagination, search/filters, avatar upload
- **Notifications:** Firebase Cloud Messaging (push + in-app dropdown and full page); send as admin; 30s polling for unread count
- **Layout:** Sidebar (collapsible), header (notifications bell, theme toggle, user menu)
- **Dark mode:** CSS custom properties; theme persisted in localStorage
- **File upload:** Abstracted storage (local by default; cloud-ready)
- **Accounting:** Invoices (partial payments, PDF), Expenses, Financial Dashboard (Net Profit)
- **State:** Redux (users, notifications) + React Context (auth, theme)

---

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4 + CSS custom properties (no SASS in build)
- **State:** Redux Toolkit (panel business data) + React Context (auth, theme)
- **Forms:** Formik + Yup
- **HTTP:** Axios (withCredentials for cookies)
- **DB:** MongoDB with Mongoose
- **Push:** Firebase Cloud Messaging (FCM)
- **UI:** Sonner toasts, Lucide icons, custom table/layout components
- **Tooling:** ESLint 9, Prettier, React Compiler

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone and install**

```bash
git clone <repository-url>
cd negints-app
npm install
```

2. **Environment**

Create `.env.local` in the project root:

```env
# Database (app reads MONGO_URI)
MONGO_URI=mongodb://localhost:27017/negints-admin

# JWT (required for panel login and API auth)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Storage (panel file uploads)
NEXT_PUBLIC_STORAGE_STRATEGY=local

# Email (SMTP) - Required for notifications/invoices
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@negints.com
SMTP_PASS=your-app-password
```

See [docs/PANEL/setup/EMAIL_SETUP.md](docs/PANEL/setup/EMAIL_SETUP.md) for detailed email configuration.

Optional for notifications (panel): Firebase client + Admin env vars — see [docs/PANEL/notifications/FIREBASE_SETUP.md](docs/PANEL/notifications/FIREBASE_SETUP.md).

3. **Seed admin user** (for panel login)

```bash
npm run seed:admin
```

Creates: **admin@negints.com** / **Admin@123**

4. **Run dev server**

```bash
npm run dev
```

- **Website:** [http://localhost:5555](http://localhost:5555)
- **Panel:** [http://localhost:5555/panel/dashboard](http://localhost:5555/panel/dashboard) (after [http://localhost:5555/login](http://localhost:5555/login))

---

## Project structure

```
negints-app/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login layout + /login
│   │   ├── (website)/           # Public site: /, /services/*
│   │   │   ├── layout.js        # WebsiteHeader, main, WebsiteFooter
│   │   │   ├── (homepage)/
│   │   │   └── services/        # design, develop, deploy, maintain
│   │   ├── panel/               # Protected dashboard
│   │   │   ├── layout.js        # Sidebar + Header
│   │   │   ├── dashboard/
│   │   │   ├── users/           # List, create, [id], [id]/edit
│   │   │   ├── notifications/   # List, send
│   │   │   ├── settings/
│   │   │   └── ...              # firebase-test, backend-notification-test, etc.
│   │   └── api/                 # Auth, users, notifications, upload, files, ...
│   ├── components/
│   │   ├── website/             # Website-only (default exports)
│   │   │   ├── homepage/, layout/, design/, develop/, deploy/, maintain/, shared/
│   │   ├── common/              # Panel: Buttons, Cards, Modals, ThemeToggle, ...
│   │   ├── forms/               # Panel: Input, Select, FileUpload, ...
│   │   ├── tables/              # Panel: Table, TableHeader, TableRow, ...
│   │   └── layout/              # Panel: Sidebar, Header, NotificationDropdown
│   ├── features/                # Redux slices (panel)
│   │   ├── users/
│   │   └── notifications/
│   ├── services/                # API layer (panel)
│   │   ├── users/
│   │   └── notifications/
│   ├── lib/                     # store, StoreProvider, hooks, axios, cookies, jwt, firebase, storage
│   ├── contexts/                # AuthContext, ThemeContext, NotificationContext
│   ├── models/                  # User, Notification (Mongoose)
│   ├── hooks/                   # useScrollAnimation (website), ...
│   ├── styles/                  # tokens.css (shared colors), website.css, panel.css; variables.scss/mixins.scss (reference)
│   ├── constants/               # config, navigation
│   ├── schemas/                 # Yup (auth, notifications, ...)
│   └── scripts/                 # seedAdmin.js, seedUsers.js
├── public/
│   ├── firebase-messaging-sw.js
│   └── assets/storage/          # Local uploads (gitignored)
├── docs/
│   ├── PANEL/                   # Panel docs (setup, auth, notifications, ui, guides)
│   │   ├── README.md            # Entry + quick links
│   │   ├── setup/, auth/, notifications/, ui/, guides/
│   └── WEBSITE/                 # Website specs (Overview, DesignLandingPage, ...)
│   └── CURSOR/                  # Cursor AI instructions
├── .cursor/rules/               # Cursor AI rules (panel + website)
└── ...
```

---

## Scripts

```bash
npm run dev          # Dev server (port 5555)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run lint:fix     # ESLint --fix
npm run seed:admin   # Create admin user (admin@negints.com / Admin@123)
npm run seed:users   # Seed sample users
```

---

## Panel routes (overview)

| Path                               | Description                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| `/login`                           | Auth layout; redirects to `/panel/dashboard` when logged in |
| `/panel/dashboard`                 | Dashboard home                                              |
| `/panel/users`                     | User list (pagination, search, filters)                     |
| `/panel/users/create`              | Create user (with avatar)                                   |
| `/panel/users/[id]`                | User detail                                                 |
| `/panel/users/[id]/edit`           | Edit user                                                   |
| `/panel/notifications`             | Notification list (tabs, filters, mark read, delete)        |
| `/panel/notifications/send`        | Send notification (admin/manager)                           |
| `/panel/settings`                  | Settings                                                    |
| `/panel/firebase-test`             | FCM test page                                               |
| `/panel/backend-notification-test` | Backend notification test                                   |
| `/panel/test-connection`           | DB connection test                                          |
| `/panel/test-axios`                | Axios + auth test                                           |
| `/panel/debug-auth`                | Cookie / auth debug                                         |
| `/panel/components-demo`           | Component demos                                             |
| `/panel/register-admin`            | Register admin                                              |
| `/panel/admin/accounting`          | Accounting (Invoices, Expenses, Dashboard)                  |

---

## Documentation

| Topic                                 | Location                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| **Panel overview**                    | [docs/PANEL/README.md](docs/PANEL/README.md)                                         |
| **Setup (DB, env, auth)**             | [docs/PANEL/setup/](docs/PANEL/setup/)                                               |
| **Cookie auth**                       | [docs/PANEL/auth/COOKIE_AUTHENTICATION.md](docs/PANEL/auth/COOKIE_AUTHENTICATION.md) |
| **Notifications (FCM, UI)**           | [docs/PANEL/notifications/README.md](docs/PANEL/notifications/README.md)             |
| **Dark mode, tables, layout**         | [docs/PANEL/ui/](docs/PANEL/ui/)                                                     |
| **Components (Forms, UI)**            | [docs/PANEL/ui/](docs/PANEL/ui/)                                                     |
| **API Reference**                     | [docs/PANEL/API_REFERENCE.md](docs/PANEL/API_REFERENCE.md)                           |
| **Pagination, Redux, implementation** | [docs/PANEL/guides/](docs/PANEL/guides/)                                             |
| **Accounting & Finance**              | [docs/PANEL/accounting/README.md](docs/PANEL/accounting/README.md)                   |
| **Website (copy, structure)**         | [docs/WEBSITE/](docs/WEBSITE/)                                                       |

---

## Security (panel)

- JWT in **httpOnly cookie** (not localStorage)
- Passwords hashed with bcrypt
- Input validation (client + server)
- File upload validation (type, size)
- Auth required for all `/panel/*` and protected API routes

---

## Deployment

Production `.env` should include:

- `MONGO_URI` – production MongoDB URI
- `JWT_SECRET` – strong random secret
- `NEXT_PUBLIC_STORAGE_STRATEGY` – e.g. `cloudinary` or `s3` if using cloud storage
- Firebase env vars if using FCM in production

Then:

```bash
npm run build
npm run start
```

---

## License

MIT. See the LICENSE file for details.

---

**NeginTS** – Built with Next.js 16, React 19, and Tailwind CSS v4
