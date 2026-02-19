# Firebase FCM Quick Start

## 1. VAPID key

Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → **Generate key pair** → copy key.

## 2. Add to `.env.local`

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=PASTE_YOUR_KEY_HERE
```

(Plus other `NEXT_PUBLIC_FIREBASE_*` vars if not already set.)

## 3. Test

```bash
npm run dev
```

Open **http://localhost:5555/panel/firebase-test**, click **Request Notification Permission**, grant it. You should see an FCM token.

For full setup (Admin SDK, sending push): see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).
