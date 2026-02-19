# Firebase Cloud Messaging Setup

## 1. VAPID key (Web Push)

1. [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings** → **Cloud Messaging**.
2. Under **Web Push certificates**, click **Generate key pair**.
3. Copy the key (starts with `B...`).

Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_KEY_HERE
```

Also set (or keep) client config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

---

## 2. Firebase Admin SDK (backend send)

1. Firebase Console → **Project Settings** → **Service Accounts** → **Generate new private key**.
2. Download the JSON; do **not** commit it.
3. From the JSON, set in `.env.local`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Use quotes for `FIREBASE_PRIVATE_KEY` and keep `\n` for line breaks.

---

## 3. Enable FCM API

Google Cloud Console → **APIs & Services** → **Library** → search **Firebase Cloud Messaging API** → **Enable**.

---

## 4. Test

Restart dev server, then open **http://localhost:5555/panel/firebase-test** and request notification permission. You should see an FCM token.

---

## Security

- Do not commit the service account JSON or expose `FIREBASE_PRIVATE_KEY` to the client.
- `.gitignore` should include `*firebase-adminsdk*.json` and `firebase-service-account.json`.
