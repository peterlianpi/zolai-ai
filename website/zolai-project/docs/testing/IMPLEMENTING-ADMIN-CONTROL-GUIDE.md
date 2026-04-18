# Implementing Admin Control - Practical Guide

**Goal:** Enable admins to control 100% of website content without hardcoding  
**Priority:** High - Essential for production CMS  
**Current Status:** 70% done, 30% needs implementation

---

## Quick Implementation Roadmap

### Phase 1: Configuration UI (2-3 days)
1. Email settings UI
2. OAuth settings UI
3. File storage settings UI

### Phase 2: Menu Builder (2-3 days)
1. Database schema
2. Admin UI for menus
3. Frontend rendering

### Phase 3: Page Builder (3-4 days)
1. Database schema
2. Template/section system
3. Drag-and-drop UI

### Phase 4: Theme Editor (2-3 days)
1. Color picker
2. Font selector
3. Dynamic CSS generation

---

## Phase 1: Configuration Management UI

### Step 1: Create Settings Database Schema

Add to `prisma/schema.prisma`:

```prisma
// ============================================
// CONFIGURATION SECRETS (Email, OAuth, Storage)
// ============================================

model ConfigurationSecret {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  encrypted Boolean  @default(true)
  category  String   // "email", "oauth", "storage", "api"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@map("configuration_secret")
}
```

Then run migration:

```bash
bunx prisma migrate dev --name add_configuration_secrets
```

---

### Step 2: Create Encryption Utility

Create `lib/encryption.ts`:

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-dev-key'

export function encryptValue(value: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function decryptValue(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

---

### Step 3: Create Configuration Service

Create `features/settings/server/config-service.ts`:

```typescript
'use server'

import { db } from '@/lib/prisma'
import { encryptValue, decryptValue } from '@/lib/encryption'

export async function getConfigValue(key: string): Promise<string | null> {
  const config = await db.configurationSecret.findUnique({
    where: { key },
  })
  
  if (!config) return null
  
  return config.encrypted ? decryptValue(config.value) : config.value
}

export async function setConfigValue(
  key: string,
  value: string,
  category: string,
  encrypted = true
): Promise<void> {
  const encryptedValue = encrypted ? encryptValue(value) : value
  
  await db.configurationSecret.upsert({
    where: { key },
    update: { value: encryptedValue },
    create: {
      key,
      value: encryptedValue,
      category,
      encrypted,
    },
  })
}

export async function getConfigsByCategory(category: string) {
  const configs = await db.configurationSecret.findMany({
    where: { category },
    select: {
      key: true,
      category: true,
      encrypted: true,
      updatedAt: true,
      // Never return actual value in list
    },
  })
  
  return configs
}

export async function deleteConfig(key: string): Promise<void> {
  await db.configurationSecret.delete({
    where: { key },
  })
}
```

---

### Step 4: Create Email Settings UI

Create `features/settings/components/email-settings-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { saveEmailSettings } from '../server/email-config'

export function EmailSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await saveEmailSettings(settings)
      toast.success('Email settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>SMTP Host</label>
        <Input
          value={settings.smtpHost}
          onChange={(e) =>
            setSettings({ ...settings, smtpHost: e.target.value })
          }
          placeholder="smtp.gmail.com"
        />
      </div>

      <div>
        <label>SMTP Port</label>
        <Input
          type="number"
          value={settings.smtpPort}
          onChange={(e) =>
            setSettings({ ...settings, smtpPort: e.target.value })
          }
          placeholder="587"
        />
      </div>

      <div>
        <label>SMTP User</label>
        <Input
          value={settings.smtpUser}
          onChange={(e) =>
            setSettings({ ...settings, smtpUser: e.target.value })
          }
          placeholder="your-email@gmail.com"
        />
      </div>

      <div>
        <label>SMTP Password</label>
        <Input
          type="password"
          value={settings.smtpPassword}
          onChange={(e) =>
            setSettings({ ...settings, smtpPassword: e.target.value })
          }
          placeholder="••••••••"
        />
      </div>

      <div>
        <label>From Email</label>
        <Input
          value={settings.fromEmail}
          onChange={(e) =>
            setSettings({ ...settings, fromEmail: e.target.value })
          }
          placeholder="noreply@example.com"
        />
      </div>

      <div>
        <label>From Name</label>
        <Input
          value={settings.fromName}
          onChange={(e) =>
            setSettings({ ...settings, fromName: e.target.value })
          }
          placeholder="Your Site Name"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Email Settings'}
      </Button>
    </form>
  )
}
```

---

### Step 5: Create Server Action for Saving

Create `features/settings/server/email-config.ts`:

```typescript
'use server'

import { setConfigValue } from './config-service'

export async function saveEmailSettings(settings: {
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
}) {
  await Promise.all([
    setConfigValue('email:smtp_host', settings.smtpHost, 'email'),
    setConfigValue('email:smtp_port', settings.smtpPort, 'email', false),
    setConfigValue('email:smtp_user', settings.smtpUser, 'email'),
    setConfigValue('email:smtp_password', settings.smtpPassword, 'email'),
    setConfigValue('email:from_email', settings.fromEmail, 'email', false),
    setConfigValue('email:from_name', settings.fromName, 'email', false),
  ])
}
```

---

### Step 6: Update Email Service to Use Database Config

Update `lib/email.ts`:

```typescript
import { getConfigValue } from '@/features/settings/server/config-service'

export async function getEmailConfig() {
  return {
    host: await getConfigValue('email:smtp_host'),
    port: parseInt(await getConfigValue('email:smtp_port') || '587'),
    user: await getConfigValue('email:smtp_user'),
    password: await getConfigValue('email:smtp_password'),
    from: await getConfigValue('email:from_email'),
    fromName: await getConfigValue('email:from_name'),
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  const config = await getEmailConfig()
  
  // Use config instead of process.env
  // Send via nodemailer or your email service
}
```

---

## Phase 2: Menu Builder

### Create Menu Schema

```prisma
model Menu {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  location  String     // "header", "footer", "sidebar"
  items     MenuItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([location])
  @@map("menu")
}

model MenuItem {
  id        String    @id @default(cuid())
  menuId    String
  label     String
  url       String
  icon      String?
  order     Int
  parentId  String?
  visible   Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  menu      Menu      @relation(fields: [menuId], references: [id], onDelete: Cascade)
  parent    MenuItem? @relation("ParentChild", fields: [parentId], references: [id])
  children  MenuItem[] @relation("ParentChild")

  @@index([menuId])
  @@index([order])
  @@map("menu_item")
}
```

---

### Create Menu Service

```typescript
'use server'

import { db } from '@/lib/prisma'

export async function getMenuByLocation(location: string) {
  const menu = await db.menu.findFirst({
    where: { location },
    include: {
      items: {
        where: { visible: true },
        orderBy: { order: 'asc' },
        include: {
          children: {
            where: { visible: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })
  
  return menu?.items || []
}

export async function saveMenuItems(
  menuId: string,
  items: Array<{
    label: string
    url: string
    order: number
    visible: boolean
  }>
) {
  // Delete existing items
  await db.menuItem.deleteMany({ where: { menuId } })
  
  // Create new items
  await db.menuItem.createMany({
    data: items.map((item, index) => ({
      menuId,
      ...item,
      order: index,
    })),
  })
}
```

---

### Create Menu UI Component

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export function MenuBuilder({ menu }: { menu: any }) {
  const [items, setItems] = useState(menu.items || [])

  return (
    <div className="space-y-4">
      <h3>Edit Menu: {menu.name}</h3>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menu">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex gap-2 p-2 border rounded"
                    >
                      <Input value={item.label} placeholder="Label" />
                      <Input value={item.url} placeholder="URL" />
                      <Button
                        onClick={() => removeItem(item.id)}
                        variant="destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button onClick={handleSave}>Save Menu</Button>
    </div>
  )
}
```

---

## Phase 3: Implementation Checklist

### Email Settings
- [ ] Add `ConfigurationSecret` table to schema
- [ ] Create encryption utility
- [ ] Create config service
- [ ] Create email settings form UI
- [ ] Update email service to use database config
- [ ] Test email sending with admin-configured settings

### OAuth Settings
- [ ] Extend ConfigurationSecret UI for OAuth
- [ ] Add encrypted storage for client IDs/secrets
- [ ] Update Better Auth config to load from database
- [ ] Create OAuth provider enable/disable toggle

### File Storage Settings
- [ ] Add storage provider selector (S3, Vercel Blob, MinIO)
- [ ] Store provider-specific credentials
- [ ] Create multi-provider upload service
- [ ] Switch providers without code changes

### Menu Builder
- [ ] Create Menu & MenuItem schema
- [ ] Build drag-drop menu editor
- [ ] Create menu rendering service
- [ ] Add to admin dashboard

### Page Builder (Advanced)
- [ ] Create Page model with sections
- [ ] Build drag-drop page editor
- [ ] Create reusable section components
- [ ] Add to frontend

---

## Quick Win: Use Existing SiteSetting Table

Before creating new tables, use the existing `SiteSetting` table for quick configuration:

```typescript
// Store configurations as key-value pairs
const settings = {
  'site:title': 'My Site',
  'site:tagline': 'Welcome',
  'site:description': 'Site description',
  'contact:email': 'contact@example.com',
  'contact:phone': '+1234567890',
  'social:twitter': 'https://twitter.com/...',
  'social:facebook': 'https://facebook.com/...',
  'email:smtp_host': 'smtp.gmail.com',
  'oauth:github_enabled': 'true',
}
```

This requires minimal schema changes and works immediately!

---

## Summary

**Current State:** 70% admin-controlled  
**Goal:** 100% admin-controlled  
**Effort:** 40-50 hours  
**Priority:** High

**Start with:**
1. Configuration UI (email, OAuth, storage)
2. Menu builder
3. Page builder

**All changes are database-backed and don't require code changes after initial setup.**
