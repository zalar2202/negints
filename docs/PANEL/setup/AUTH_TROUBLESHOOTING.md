# Auth & Notification API Troubleshooting

## 1. "Invalid token" when registering FCM token

**Symptoms:** Error when registering FCM token even after logging in; terminal shows `JsonWebTokenError: Invalid token` at `verifyToken`.

**Cause:** `JWT_SECRET` in `.env.local` is missing or different from the one used when the login cookie was set.

**Fix:**

1. Ensure `.env.local` has:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```
2. Restart the dev server after any `.env.local` change.
3. Clear cookies for `localhost`, then log in again at `/login`.
4. Check: **http://localhost:5555/panel/debug-auth** – "Check Browser Cookies" and "Test Auth API" should both succeed.
5. Retry: **http://localhost:5555/panel/backend-notification-test** and register the FCM token again.

---

## 2. 404 on notification endpoints

**Symptoms:** Console shows `GET .../notifications/count 404` or `POST .../notifications/fcm-token 404` (every ~30s).

**Cause:** Notification service was calling paths without the `/api` prefix. In this app it’s already fixed: `src/services/notification.service.js` uses `/api/notifications/...`.

**Check:** Requests should go to `/api/notifications/count`, `/api/notifications/fcm-token`, etc. If you still see 404, confirm the service uses the `/api` prefix.

---

## 3. Cookie name and API auth

Auth uses an **httpOnly cookie**, not localStorage. Cookie name: **`logatech_auth_token`** (see `src/constants/config.js`). API routes read the token via `getAuthToken()` from `@/lib/cookies`. If you add new API routes that need auth, use `await getAuthToken()` and verify the JWT; do not read a cookie named `token`.

---

## 4. Firebase Admin not initialized

**Symptoms:** Terminal error initializing Firebase Admin; push sending fails with 500.

**Fix:** Set in `.env.local`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (quoted string with `\n` for newlines)

Restart the dev server after changes. See [../notifications/FIREBASE_SETUP.md](../notifications/FIREBASE_SETUP.md) for how to obtain credentials.

---

## 5. Useful URLs (this app)

| Purpose | URL |
|--------|-----|
| Login | http://localhost:5555/login |
| Debug auth / cookies | http://localhost:5555/panel/debug-auth |
| Backend notification test | http://localhost:5555/panel/backend-notification-test |
| Firebase FCM test | http://localhost:5555/panel/firebase-test |
