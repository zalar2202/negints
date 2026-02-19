# httpOnly Cookie Authentication

## Overview

This app uses **httpOnly cookies** for JWT storage (not localStorage). The cookie name is **`logatech_auth_token`** (see `src/constants/config.js`).

**Benefits:** XSS-safe (JS can’t read the token), cookies sent automatically with requests, `SameSite` for CSRF, works with Next.js App Router and Server Components.

---

## Flow

1. **Login:** `POST /api/auth/login` → server validates credentials, signs JWT, sets httpOnly cookie via `setAuthToken()` from `@/lib/cookies`.
2. **Requests:** Axios uses `withCredentials: true`; cookie is sent automatically. No `Authorization` header or localStorage.
3. **API routes:** Use `const token = await getAuthToken()` (from `@/lib/cookies`) and verify JWT. Cookie name is `logatech_auth_token`.
4. **Logout:** `POST /api/auth/logout` → `clearAuthToken()` clears the cookie.

---

## Key files

| File                               | Role                                             |
| ---------------------------------- | ------------------------------------------------ |
| `src/lib/cookies.js`               | `setAuthToken`, `getAuthToken`, `clearAuthToken` |
| `src/constants/config.js`          | `COOKIE_NAMES.TOKEN` = `logatech_auth_token`     |
| `src/lib/axios.js`                 | `withCredentials: true`; 401 handling            |
| `src/app/api/auth/login/route.js`  | Login, set cookie                                |
| `src/app/api/auth/logout/route.js` | Logout, clear cookie                             |
| `src/contexts/AuthContext.js`      | Client auth state (user, login/logout calls)     |

---

## Cookie options (server)

- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'lax'`
- `maxAge: 604800` (7 days)
- `path: '/'`

---

## Panel routes and auth

- **Login:** `/login` (auth layout).
- **Protected:** All `/panel/*` routes; unauthenticated users are redirected to `/login`.
- **Test pages:** `/panel/test-axios`, `/panel/debug-auth` (see [setup/AUTH_TROUBLESHOOTING.md](../setup/AUTH_TROUBLESHOOTING.md)).

---

## Testing

1. Log in at **http://localhost:5555/login** (admin@logatech.net / Admin@123).
2. Open **http://localhost:5555/panel/debug-auth** → "Check Browser Cookies" should show the cookie; "Test Auth API" should succeed.
3. Call any protected API with the same origin; cookie is sent automatically (no manual token in headers).
