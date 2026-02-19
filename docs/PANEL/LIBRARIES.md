# Libraries & Utilities

The `src/lib` directory contains the core infrastructure logic of the application.

## Core Modules

### Database `mongodb.js`
Singleton connection to MongoDB using Mongoose.
- Handles connection caching for serverless/development environments (hot reload).
- Usage: `await dbConnect();` at the start of every API route.

### Authentication `auth.js` & `jwt.js`
- **jwt.js**: Low-level signing and verifying of tokens using `jose` or `jsonwebtoken`.
- **auth.js**: High-level `verifyAuth(request)` helper for Next.js App Router API routes. Extracts cookie, verifies token, and returns user payload (or null).

### HTTP Client `axios.js`
Configured Axios instance for client-side queries.
- automatically attaches `withCredentials: true` for cookie persistence.
- handles response interceptors for global error logging.

### Storage `storage/`
Abstracted file storage strategy.
- Selects based on `NEXT_PUBLIC_STORAGE_STRATEGY` env var.
- Supports **Local** storage (in `public/assets/storage`) for dev/VPS.
- Extensible for Cloudinary/S3.

### Notifications `notifications.js` & `firebase/`
- **notifications.js**: Backend helper to create `Notification` records in MongoDB and trigger FCM push.
- **firebase/**: Firebase Admin SDK initialization for server-side push messaging.

### Email `email.js` / `mail.js`
Nodemailer configuration for sending system emails (password resets, notifications).
- Uses SMTP credentials from environment variables.

### State Management `store.js`
Redux Toolkit store configuration.
- Slices located in `src/features`.
- `StoreProvider.js`: Wrapper component for Next.js app layout.

## Utils `utils.js`
General helper functions.
- Date formatting
- String manipulation
- Client-side helpers

### UI Libraries
- **Lucide React**: Icon pack.
- **Sonner**: Toast notifications.
- **React Easy Crop**: Image cropping and manipulation.

