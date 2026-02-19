# Backend Notification Testing

## Pre-test

- Firebase Admin credentials in `.env.local`
- Dev server restarted after env changes
- Logged in as admin (admin@logatech.net / Admin@123)

---

## Test page

Open **http://localhost:5555/panel/backend-notification-test**.

### Step 1: Request permission & get token

1. Click **Request Notification Permission** → Allow.
2. FCM token should appear on the page.

### Step 2: Register token in DB

1. Click **Register Token in MongoDB**.
2. Calls `POST /api/notifications/fcm-token` with token, device, browser.
3. Token is stored on the user document (`user.fcmTokens`).

### Step 3: Send notification from backend

1. Fill title, message, type; optionally **Action URL:** `/panel/notifications`, **Action Label:** View All.
2. Click **Send Notification from Backend**.
3. Backend creates notification in MongoDB, sends push via Firebase Admin, updates delivery status.
4. You should get a push notification; clicking it can open `/panel/notifications`.

### Step 4: Verify

- **Fetch My Notifications** – calls `GET /api/notifications`; shows count and recent items.
- **Get Unread Count** – calls `GET /api/notifications/count`.

In MongoDB: `db.notifications.find({ recipient: ObjectId("...") })` and `db.users.findOne({ email: "admin@logatech.net" }, { fcmTokens: 1 })`.

---

## If something fails

- **Invalid token when registering:** See [../setup/AUTH_TROUBLESHOOTING.md](../setup/AUTH_TROUBLESHOOTING.md) (JWT_SECRET, cookie, restart).
- **404 on /notifications/...:** Service must call `/api/notifications/...` (with `/api` prefix). See [../setup/AUTH_TROUBLESHOOTING.md](../setup/AUTH_TROUBLESHOOTING.md).
