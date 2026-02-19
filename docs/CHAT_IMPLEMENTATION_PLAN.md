# Chat Implementation Plan

> **Purpose:** Single reference for implementing live chat in negints-app (panel chat + visitor chat), using FCM + polling (no Socket.io). Admin can be notified via WhatsApp/Telegram when visitors send messages so they do not need to be always online in the panel.

**Last Updated:** February 2026

---

## 1. Overview

### 1.1 What We Are Building

| Feature | Description |
|--------|-------------|
| **Panel chat** | Chat between users who are logged in to the panel (e.g. admin ↔ staff). Real-time via FCM when available, fallback polling (e.g. 30s or less). |
| **Visitor chat** | Sticky button on the **website homepage** (public, no login). Visitors can open a widget and chat with an admin. Anonymous/session-based; FCM + polling (e.g. 30s or less). |
| **Admin notification (off-panel)** | When a visitor sends a message, notify the admin via **WhatsApp** and/or **Telegram** so they can be alerted even when not in the panel. Optionally support replying from those channels later. |

### 1.2 Technical Approach (No Socket.io)

- **Real-time delivery:** Firebase Cloud Messaging (FCM) for push when the client has a token and permission.
- **Fallback:** Short-interval polling (e.g. 15–30s) so chat works even without FCM.
- **Reference:** parlomo-refactored uses this same pattern (FCM + 30s polling); no Socket.io there.

---

## 2. Panel Chat (Logged-in Users)

### 2.1 Scope

- Users in the panel can chat with each other (e.g. admin with staff, or internal threads).
- User identity: from auth (JWT / session); no anonymous users in panel chat.

### 2.2 Real-time Strategy

- **FCM:** When a new message is sent, backend triggers FCM to recipient(s). Client already has FCM setup (see [PANEL/notifications/README.md](PANEL/notifications/README.md)); reuse token storage (e.g. `User.fcmTokens`).
- **Foreground:** Use `onForegroundMessage` (or equivalent) to update UI when a `chat:new-message` (or similar) event is received.
- **Polling:** Run a `setInterval` (e.g. every 30s or 15s) to fetch new messages for the active conversation; clear interval on unmount. Ensures delivery when FCM is unavailable or permission denied.

### 2.3 Data & API (High Level)

- **Models:** e.g. `Conversation`, `Message` (or equivalent) with participants, timestamps, and message body.
- **API:** Endpoints such as: list conversations, get messages for a conversation, send message, optionally mark as read. Backend persists messages and triggers FCM (and optionally WhatsApp/Telegram for “visitor” threads only; see below).

### 2.4 UI (Panel)

- Dedicated chat page under `/panel/chat` (or similar): conversation list + active thread + composer.
- Reuse patterns from parlomo-refactored chat UI where helpful (sidebar list, thread view, send box).

---

## 3. Visitor Chat (Website, No Login)

### 3.1 Scope

- **Entry:** Sticky button on the **website** (e.g. homepage) that opens a chat widget.
- **Users:** Not logged in; identify by session (e.g. cookie/sessionId) or anonymous conversation id.
- **Flow:** Visitor sends message → stored as “visitor conversation” → admin sees it in panel (and gets WhatsApp/Telegram notification).

### 3.2 Real-time Strategy

- **FCM for visitors (optional):** On widget open, optionally request notification permission and get FCM token; store token against the anonymous conversation/session. When admin replies, send FCM to that token for instant delivery. If permission denied or FCM unavailable, rely on polling only.
- **Polling:** Widget polls for new messages every 15–30s (configurable). Ensures visitors always get replies even without FCM.

### 3.3 Identity & Storage

- **Visitor identity:** No login; use a stable session id (e.g. generated once per browser tab/session and stored in cookie or localStorage) or a “conversation id” created when the visitor sends the first message.
- **Backend:** Store “visitor” conversations separately or flag them (e.g. `type: 'visitor'` or `participants` including a system “website visitor” entity) so the panel can list and route them to admins.

### 3.4 UI (Website)

- Sticky button (e.g. bottom-right) on website layout; click opens a floating chat widget (iframe or in-app component).
- Widget: message list, input, “Send” and optional “Minimize”. No login form; optional “Name” or “Email” field for context.

---

## 4. Admin Notification via WhatsApp / Telegram

### 4.1 Problem

- Admin cannot be assumed to be always online in the panel. When a **visitor** sends a message, admin should still be notified.

### 4.2 Approach: Notify Admin on External Channels

- When a **visitor** sends a message (or when the first message in a new visitor conversation is created), backend:
  1. Persists the message and conversation as usual.
  2. Sends a **notification to the admin** via one or both:
     - **WhatsApp** (e.g. WhatsApp Business API or Twilio/other provider).
     - **Telegram** (e.g. Telegram Bot API: send message to admin’s chat/channel).
- Notification content: e.g. “New visitor message: [preview]” and link to panel chat (e.g. `/panel/chat?conversation=xyz`).

### 4.3 What “Connect Chat to WhatsApp/Telegram” Means Here

| Capability | Description |
|------------|-------------|
| **Notify admin (in scope)** | When visitor sends a message → send a WhatsApp and/or Telegram message to admin so they know to open the panel and reply. |
| **Reply from WhatsApp/Telegram (optional/future)** | Allow admin to reply from Telegram (or WhatsApp) and have that reply appear in the panel and in the visitor’s chat. This requires mapping “incoming message from Telegram/WhatsApp” → conversation id and storing reply as a message; more integration work. |

**Recommendation:** Implement **notify-only** first (admin gets alert on WhatsApp/Telegram and replies in the panel). Add “reply from Telegram/WhatsApp” later if needed.

### 4.4 Implementation Notes

- **Telegram:** Create a bot, get bot token, get admin’s chat id; on visitor message, call Telegram Bot API to send a message to that chat. No login required on website for this.
- **WhatsApp:** Usually requires WhatsApp Business API (or a provider like Twilio); send a template or session message to admin’s number. Depends on provider and approval.
- **Config:** Store Telegram chat id and/or WhatsApp number (and provider credentials) in env or settings; backend reads them when sending the notification.

---

## 5. Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ WEBSITE (public)                                                             │
│  - Sticky chat button → Visitor chat widget                                  │
│  - Visitor: no login; session/anonymous conversation id                       │
│  - Real-time: optional FCM + polling (e.g. 15–30s)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    │ HTTP (send message, get messages)
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Next.js API / serverless)                                           │
│  - Store conversations & messages (e.g. MongoDB)                            │
│  - On new visitor message:                                                   │
│      → Trigger FCM to visitor (if token)                                      │
│      → Notify admin via Telegram and/or WhatsApp (notify-only)                │
│  - On new panel message:                                                     │
│      → Trigger FCM to recipient(s)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     FCM        Telegram     WhatsApp
   (push)       (bot msg)    (optional)
        │           │           │
        ▼           ▼           ▼
┌─────────────┐  Admin     Admin
│ Panel /     │  gets      gets
│ Visitor     │  alert     alert
│ client      │
└─────────────┘
```

---

## 6. Phases (Suggested Order)

1. **Data & API** – Conversation and Message models, CRUD + “send message” API; list conversations and messages for panel.
2. **Panel chat UI** – Chat page in panel; FCM + polling for real-time; wire to existing auth and FCM token storage.
3. **Visitor chat** – Sticky button + widget on website; anonymous/session identity; send/fetch messages; FCM (optional) + polling.
4. **Admin notification** – On new visitor message, send Telegram (and optionally WhatsApp) notification to admin; link to panel chat.
5. **(Optional later)** – Reply from Telegram (or WhatsApp) into the same conversation.

---

## 7. Key Files & Docs to Reuse or Create

| Area | Reference / Location |
|------|----------------------|
| FCM (client) | [negints-app] `src/lib/firebase/client.js` – `getToken`, `onForegroundMessage` |
| FCM (admin) | [negints-app] `src/lib/firebase/admin.js` – send push |
| User FCM tokens | [negints-app] `src/models/User.js` – `fcmTokens`, `addFcmToken`, `getActiveFcmTokens` |
| Notifications | [negints-app] `docs/PANEL/notifications/README.md` |
| Chat reference (FCM + polling) | [parlomo-refactored] `src/features/chat/hooks/useChatRealtime.js`, `CHAT_MIGRATION_NOTES.md` |

---

## 8. Out of Scope (For This Plan)

- Socket.io or other WebSocket server.
- Logged-in “website user” chat (only panel users and anonymous visitors in this plan).
- Typing indicators / read receipts (can be added later).

---

*Use this document as the single source of truth when implementing or changing chat behaviour. Update “Last Updated” and sections as the implementation evolves.*
