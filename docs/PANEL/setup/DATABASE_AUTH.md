# Quick Setup: Database & Authentication

## Prerequisites

- MongoDB running (local or Atlas)
- `.env.local` with required variables

## Required environment variables

In `.env.local`:

```env
# MongoDB (app uses MONGO_URI, not MONGODB_URI)
MONGO_URI=mongodb://localhost:27017/logatech-admin

# JWT (required for login and API auth)
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
```

### Generate JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output into `JWT_SECRET` in `.env.local`.

## Setup steps

### 1. Create first admin user

```bash
npm run seed:admin
```

Creates an admin:

- **Email:** `admin@logatech.net`
- **Password:** `Admin@123`

### 2. Start dev server

```bash
npm run dev
```

### 3. Test login

1. Open **http://localhost:5555/login**
2. Log in with the credentials above
3. You should be redirected to **/panel/dashboard**

## What’s implemented

- **User model** (`src/models/User.js`) – Mongoose schema, bcrypt, last login
- **JWT** (`src/lib/jwt.js`) – sign/verify, 7-day expiry
- **Login API** (`src/app/api/auth/login/route.js`) – MongoDB + bcrypt, JWT in **httpOnly cookie**
- **Auth check API** (`src/app/api/auth/check/route.js`) – cookie verification, user from DB
- **Seed script** (`src/scripts/seedAdmin.js`) – first admin, no duplicates

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT in **httpOnly cookie** (not localStorage) – cookie name: `logatech_auth_token`
- Account status checked on protected requests
- No passwords in API responses

## Troubleshooting

| Problem                            | Solution                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| "JWT_SECRET is not defined"        | Add `JWT_SECRET` to `.env.local` (see generator above)                                                   |
| "Cannot connect to MongoDB"        | Check MongoDB is running and `MONGO_URI` is correct                                                      |
| Duplicate key when seeding         | Admin already exists; you can log in                                                                     |
| Invalid token when registering FCM | Ensure `JWT_SECRET` in `.env.local` matches the one used at login; restart dev server after changing env |
