# Panel Layout

## Overview

The admin panel layout is: **Sidebar** (collapsible) + **Header** (title, NotificationDropdown, ThemeToggle, user menu). Used for all `/panel/*` routes via `src/app/panel/layout.js`.

---

## Key components

| Component | Role |
|-----------|------|
| `src/components/layout/Sidebar.js` | Nav (Dashboard, Notifications, Users, Send Notification, dev links); collapse/expand; mobile overlay |
| `src/components/layout/Header.js` | Page title, NotificationDropdown, ThemeToggle, user menu (logout) |
| `src/constants/navigation.js` | `navigation`, `adminNavigation`, `devNavigation` (hrefs under `/panel/...`) |

---

## Styling

- Sidebar/header use **CSS variables** (`var(--color-background-elevated)`, `var(--color-border)`, etc.) for dark mode.
- Logo/brand area in the sidebar uses a gradient badge and "LogaTech Panel" label.

---

## Mobile

- Sidebar becomes an overlay; hamburger opens/closes it.
- Header and main content remain usable on small screens.
