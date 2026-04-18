# React 19 Reference

**Version:** 19.2.3 | **Docs:** https://react.dev

## What's New in React 19

### Server Components
- Built-in support for Server Components
- Zero client JS for Server Components
- Direct async/await in components

```tsx
// Server Component (default)
export default async function UserProfile({ userId }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}
```

### Actions (Form Actions)
- Built-in form handling with progressive enhancement
- `useActionState` for form state management
- `useFormStatus` for pending state

```tsx
"use client";
import { useActionState } from "react";

async function submit(prevState, formData) {
  const name = formData.get("name");
  await saveName(name);
  return { success: true };
}

export function NameForm() {
  const [state, formAction, pending] = useActionState(submit, null);
  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>
    </form>
  );
}
```

### `use` Hook
- Read resources like Promises and Context
- Works in render, not just top-level

```tsx
import { use } from "react";

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>;
}
```

### `useOptimistic`
- Show optimistic updates while async operation is in flight

```tsx
"use client";
import { useOptimistic } from "react";

function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { text: newMessage, sending: true }]
  );

  return (
    <div>
      {optimisticMessages.map((msg, i) => (
        <div key={i}>{msg.text} {msg.sending && " (Sending...)"}</div>
      ))}
      <form action={async (formData) => {
        const text = formData.get("text");
        addOptimistic(text);
        await sendMessage(text);
      }}>
        <input name="text" />
        <button>Send</button>
      </form>
    </div>
  );
}
```

### `useActionState` (replaces `useReducer` for forms)
```tsx
"use client";
import { useActionState } from "react";

function ChangeName({ changeName }) {
  const [message, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const result = await changeName(formData.get("name"));
      return result.success ? "Name updated!" : "Failed to update";
    },
    null
  );

  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### `useFormStatus`
```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

### `useEffectEvent` (React 19.2)
- Event handlers that don't trigger re-renders
- Don't need to be in dependency arrays

```tsx
"use client";
import { useEffect, useEffectEvent } from "react";

function ChatRoom({ roomId }) {
  const onConnected = useEffectEvent(() => {
    playSound();
    showNotification();
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on("connected", () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // onConnected not needed in deps
}
```

### `<Activity>` Component (React 19.2)
- Keep components alive but hidden (offscreen rendering)
- Preserves state when switching tabs/views

```tsx
import { Activity } from "react";

function Tabs({ activeTab }) {
  return (
    <>
      <Activity mode={activeTab === "home" ? "visible" : "hidden"}>
        <HomeTab />
      </Activity>
      <Activity mode={activeTab === "settings" ? "visible" : "hidden"}>
        <SettingsTab />
      </Activity>
    </>
  );
}
```

### View Transitions (React 19.2)
```tsx
"use client";
import { useViewTransition } from "react";

function Gallery({ images }) {
  const startTransition = useViewTransition();

  return (
    <button onClick={() => {
      startTransition(() => setSelected(!selected));
    }}>
      Toggle View
    </button>
  );
}
```

### Ref Cleanup
```tsx
"use client";
import { useRef, useEffect } from "react";

function VideoPlayer({ src, isPlaying }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPlaying) {
      ref.current?.play();
    } else {
      ref.current?.pause();
    }
  }, [isPlaying]);

  return <video ref={ref} src={src} />;
}
```

### Document Metadata
- Can render `<title>`, `<meta>`, `<link>` in any component
- No need for `next/head` or React Helmet

```tsx
export default function Page() {
  return (
    <div>
      <title>My Page Title</title>
      <meta name="description" content="Page description" />
      <h1>Hello World</h1>
    </div>
  );
}
```

### Stylesheets
```tsx
export default function Page() {
  return (
    <div>
      <link rel="stylesheet" href="/styles.css" />
      <style>{`body { margin: 0; }`}</style>
      <h1>Hello World</h1>
    </div>
  );
}
```

## Best Practices

### Component Design
1. **Start as Server Component** — only add `"use client"` when needed
2. **Composition over inheritance** — use children props
3. **Custom hooks** for reusable logic
4. **Error boundaries** at appropriate levels
5. **Suspense boundaries** for async operations

### State Management
1. **Server state** → TanStack Query or Server Components
2. **Client state** → useState, useReducer
3. **Form state** → React Hook Form
4. **URL state** → searchParams
5. **Global state** → Context (for theme, auth) or Zustand

### Performance
1. **Minimize client components** — each one adds JS to bundle
2. **Use React Compiler** — auto-memoization at build time
3. **Lazy load** heavy components with `dynamic()`
4. **Optimize images** with Next.js Image component
5. **Use `use cache`** for expensive Server Components

### Security
1. **Never trust client input** — validate on server
2. **Sanitize HTML** before `dangerouslySetInnerHTML`
3. **httpOnly cookies** for sensitive data
4. **CSP headers** to prevent XSS
5. **Validate URLs** before fetch calls
