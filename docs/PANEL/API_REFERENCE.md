# API Reference

The Admin Panel supports a comprehensive internal API located at `/src/app/api`.
Most routes are protected and require the user to be authenticated via the httpOnly JWT cookie.

## Authentication

Protected routes use `verifyAuth(request)` from `@/lib/auth`.
- **Method**: JWT in `logatech_auth_token` cookie.
- **Roles**: Most routes require `admin` or `manager` roles, though some (like `users/[id]`) may allow the owner to view their own data.

## Endpoints

### Auth `api/auth`
- `POST /api/auth/login`: Authenticate and set cookie
- `POST /api/auth/logout`: Clear cookie
- `GET /api/auth/me`: Get current user session
- `POST /api/auth/forgot-password`: Request reset link
- `POST /api/auth/reset-password`: Reset with token

### Users `api/users`
- `GET /api/users`: List users (pagination, search, filters)
- `POST /api/users`: Create user
- `GET /api/users/[id]`: User details
- `PUT /api/users/[id]`: Update user
- `DELETE /api/users/[id]`: Delete user (soft or hard delete)

### Services & Packages
- `api/services`: Manage client services (active subscriptions)
- `api/packages`: Defined service packages/plans
- `api/promotions`: Discount codes or active promotions

### Business Data
- `api/clients`: Client/Company records (often linked to Users)
- `api/invoices`: Billing and payment requests
- `api/payments`: Payment transaction logs
- `api/tickets`: Support tickets (CRUD + messaging)

### Content
- `api/blog`: Blog posts management
- `api/media`: Media library (upload, bulk actions)
  - `GET /api/media`: List and filter
  - `POST /api/media`: Upload one file
  - `PATCH /api/media/[id]`: Update metadata (alt, caption, tags)
  - `DELETE /api/media/[id]`: Delete single file
  - `DELETE /api/media`: Bulk delete
- `api/files`: File serving/management

### System
- `api/notifications`: Internal notifications & FCM management
- `api/upload`: File upload handler (Local/S3)
- `api/debug`: Debugging tools (auth, db)
- `api/admin`: Admin-specific global actions

## Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... } || [ ... ]
}
```

**Error:**
```json
{
  "error": "Error message description"
}
```
HTTP Status 400/401/403/404/500 is used appropriately.
