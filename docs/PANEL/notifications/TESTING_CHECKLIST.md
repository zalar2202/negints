# Notification System – Testing Checklist

## 1. NotificationDropdown (bell in header)

- [ ] Bell icon visible; red badge shows unread count
- [ ] Click bell → dropdown opens; shows recent notifications and "View all notifications"
- [ ] Click a notification → marks read, badge decreases, navigates to action URL if set
- [ ] "View all notifications" → goes to **/panel/notifications**

## 2. Full notifications page

- [ ] Open **/panel/notifications** (dropdown or sidebar)
- [ ] Tabs: All / Unread / Read with counts
- [ ] Type filter works (All Types, Success, Info, etc.)
- [ ] Mark read, Delete single; Mark all read, Delete all read
- [ ] Pagination (if 20+ notifications)

## 3. Auto token registration

- [ ] Logout, clear cookies, login again
- [ ] After 2–3 s, FCM token registered (check console or MongoDB `user.fcmTokens`)

## 4. Foreground / background push

- [ ] With panel open: send notification → toast appears, badge updates
- [ ] With panel in background: send notification → OS notification; click opens app

## 5. Admin send

- [ ] Go to **/panel/notifications/send**
- [ ] Choose recipients (all / role / single), fill title/message, send
- [ ] Recipients get notification and/or push

---

**URLs in this app:** `/panel/notifications`, `/panel/notifications/send`, `/panel/backend-notification-test`, `/panel/firebase-test`.
