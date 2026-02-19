# Notification System

## Status: Production ready

This app uses **Firebase Cloud Messaging (FCM)** for push notifications and **polling** (every 30s) for in-app unread count. All notifications are stored in MongoDB.

---

## Quick start

**End users:** Log in → allow notifications when prompted → done.

**Admins:** Sidebar → **Send Notification** (`/panel/notifications/send`) → choose recipients and send.

**From code:**

```javascript
import { notifyUserCreated } from "@/lib/notifications";
await notifyUserCreated(newUserId, adminId);
```

---

## Features

| Feature | Description |
|--------|-------------|
| **Push** | FCM; works when browser is closed; native OS notifications |
| **In-app** | Toast when app is open; header dropdown; full page at `/panel/notifications` |
| **Unread count** | Polled every 30s; badge in header |
| **Admin send** | Send to all, by role, or to individual users; templates |
| **Storage** | MongoDB; pagination, filters, mark read/delete |

---

## Panel URLs (this app)

| Page | URL |
|------|-----|
| Notifications list | `/panel/notifications` |
| Send notification (admin) | `/panel/notifications/send` |
| Firebase FCM test | `/panel/firebase-test` |
| Backend notification test | `/panel/backend-notification-test` |

---

## Key files

| Layer | Files |
|-------|--------|
| **Frontend** | `src/components/layout/NotificationDropdown.js`, `src/contexts/NotificationContext.js`, `src/app/panel/notifications/page.js`, `src/app/panel/notifications/send/page.js` |
| **Backend** | `src/app/api/notifications/*` (route.js, count, fcm-token, [id], mark-all-read, delete-all-read), `src/lib/firebase/admin.js`, `src/lib/notifications.js`, `src/models/Notification.js` |
| **State** | `src/features/notifications/notificationsSlice.js`, `src/services/notification.service.js` |
| **Client FCM** | `src/lib/firebase/client.js`, `public/firebase-messaging-sw.js` |

---

## Docs in this folder

| Doc | Purpose |
|-----|--------|
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | VAPID key, env vars, Firebase Admin |
| [FIREBASE_QUICK_START.md](FIREBASE_QUICK_START.md) | Short Firebase setup steps |
| [BACKEND_TESTING.md](BACKEND_TESTING.md) | Test FCM token, send, push via `/panel/backend-notification-test` |
| [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) | Full checklist for dropdown, page, send |
| [USER_GUIDE.md](USER_GUIDE.md) | End-user guide (view, mark read, delete) |

Auth/API issues (invalid token, 404): see [../setup/AUTH_TROUBLESHOOTING.md](../setup/AUTH_TROUBLESHOOTING.md).
