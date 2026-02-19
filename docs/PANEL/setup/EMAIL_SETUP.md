# Email Setup Guide (SMTP)

This guide explains how to enable email sending (for offers, notifications, and invoices) in the LogaTech Panel using your Cloudflare/Google SMTP credentials.

## 1. Environment Variables

Add the following variables to your **Coolify Environment** or your local `.env.local` file:

```env
# ---------------------------------------------------------
# EMAIL / SMTP CONFIGURATION
# ---------------------------------------------------------

# Primary SMTP Settings (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@logatech.net
SMTP_PASS=your-google-app-password

# Optional: Specific Senders (Defaults to SMTP_USER if not set)
SMTP_BILLING_USER=billing@logatech.net
SMTP_SUPPORT_USER=support@logatech.net
SMTP_CONTACT_USER=contact@logatech.net
```

### 💡 Note for Google/Workspace Users:
If you are using Gmail or Google Workspace with 2FA enabled, you **must** use an "App Password" instead of your regular password.
1. Go to your [Google Account Settings](https://myaccount.google.com/).
2. Navigate to **Security**.
3. Under "How you sign in to Google," select **App passwords**.
4. Generate a new password for "Mail" on "Windows Computer" (or select "Other" and type "LogaTech").
5. Use that 16-character code as your `SMTP_PASS`.

## 2. Testing the Configuration

Once the environment variables are set, you can test the connection by making a POST request to `/api/test-email` using tools like Postman or the built-in Developer Tools console while logged in as an Admin:

```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    to: 'your-email@example.com', 
    subject: 'Verification Test',
    body: 'Testing LogaTech SMTP Integration.' 
  })
}).then(r => r.json()).then(console.log);
```

## 3. Implementation Details

The email service is abstracted in `src/lib/mail.js`. You can use it anywhere in the backend:

```javascript
import { sendMail } from '@/lib/mail';

await sendMail({
    to: 'client@example.com',
    subject: 'Your Invoice',
    html: '<h1>Invoice...</h1>',
    fromType: 'BILLING' // Options: INFO, BILLING, SUPPORT, CONTACT
});
```

The service automatically wraps your HTML in a branded LogaTech header and footer.
