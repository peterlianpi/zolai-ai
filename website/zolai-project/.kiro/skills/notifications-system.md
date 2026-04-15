---
name: notifications-system
description: Notification system for the Zolai platform — email (Resend), push, SMS, webhooks, Telegram, dispatcher. Use when working on features/notifications or lib/notifications/*.
---

# Notifications System — Zolai Platform

## Delivery channels (lib/notifications/)

| File | Channel |
|---|---|
| `email-delivery.ts` | Email via Resend |
| `push-delivery.ts` | Web push notifications |
| `sms-delivery.ts` | SMS delivery |
| `webhook-delivery.ts` | Outbound webhooks |
| `integrations.ts` | Discord, Slack, Telegram |
| `dispatcher.ts` | Central dispatch router |

## Dispatcher pattern

```ts
import { dispatchNotification } from "@/lib/notifications/dispatcher";

await dispatchNotification({
  recipients: [{ userId }],
  type: "LESSON_COMPLETE",
  title: "Lesson complete",
  description: "You finished A1 Lesson 3",
  link: "/lessons",
  actorUserId: userId,
});
```

## Email (Resend)

```ts
import { sendEmail } from "@/lib/email/resend";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome to Zolai AI",
  html: "<p>...</p>",
});
```

## Telegram alerts (lib/telegram.ts)

```ts
import { notify } from "@/lib/telegram";
notify(`👤 New signup: <b>${user.name}</b>`).catch(() => {});
```

Used for admin alerts — new signups, errors, training run completions.

## Notification types (features/notifications/types.ts)

Common types: `LESSON_COMPLETE`, `NEW_COMMENT`, `CONTENT_APPROVED`, `TRAINING_COMPLETE`, `SYSTEM_ALERT`.

## Template system (lib/scripts/create-default-notification-templates.ts)

Notification templates stored in DB. Use `lib/templates/render.ts` to render with slot variables: `{{ name }}`, `{{ action_url }}`, etc.
