# Better Auth Plugin Migration Implementation Guide

## Team Structure & Responsibilities

This migration guide is designed for **Team Alpha** and implementation teams. Follow this step-by-step process to migrate Zolai AI to Better Auth plugins.

## Pre-Migration Checklist

### 1. Environment Setup
```bash
# Verify current Better Auth version (should be 1.6.0+)
grep "better-auth" package.json

# Create feature branch
git checkout -b feature/better-auth-plugin-migration

# Backup current database
pg_dump zolai_db > backup_pre_migration.sql
```

### 2. Current State Analysis
- ✅ **Current Better Auth version**: 1.6.0 (latest)
- ✅ **Current plugins**: `admin` (basic), `emailOTP`
- ✅ **Database schema**: Compatible foundation exists
- ✅ **Custom admin system**: Ready for enhancement

## Phase 1: Two-Factor Authentication Migration (Week 1-2)

### Step 1.1: Replace emailOTP with Full 2FA Plugin

**Remove existing emailOTP configuration:**

`lib/auth.ts`:
```typescript
// REMOVE this import
// import { emailOTP } from "better-auth/plugins";

// ADD this import instead
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  // ... existing config
  plugins: [
    // REMOVE emailOTP plugin
    // emailOTP({
    //   async sendVerificationOTP({ email, otp, type: _ }) {
    //     const userName = email.split("@")[0];
    //     await sendTwoFactorOtpEmail(email, userName, otp);
    //   },
    // }),

    // ADD twoFactor plugin instead
    twoFactor({
      issuer: "Zolai AI",
      skipVerificationOnEnable: false,
      allowPasswordless: false, // Keep password requirement
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendTwoFactorOtpEmail(user.email, user.name, otp);
        },
        period: 300, // 5 minutes validity
      },
      totpOptions: {
        period: 30, // Standard 30-second TOTP
        digits: 6,
      },
      backupCodeOptions: {
        amount: 10, // Generate 10 backup codes
        length: 8,  // 8 characters each
      },
    }),

    admin({
      // ... existing admin config
    }),
  ],
});
```

**Update client configuration:**

`lib/auth-client.ts`:
```typescript
// REMOVE this import
// import { emailOTPClient, adminClient } from "better-auth/client/plugins";

// ADD these imports instead
import { twoFactorClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    // REMOVE emailOTPClient
    // emailOTPClient(),

    // ADD twoFactorClient instead
    twoFactorClient({
      twoFactorPage: "/auth/two-factor",
      onTwoFactorRedirect() {
        window.location.href = "/auth/two-factor";
      },
    }),

    adminClient({
      ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),
  ],
});
```

### Step 1.2: Database Migration

**Create migration file:**
```bash
bunx prisma migrate dev --name add_two_factor_support
```

**Manual migration (if needed) - `prisma/migrations/xxx_add_two_factor_support/migration.sql`:**
```sql
-- Add twoFactorEnabled to existing user table
ALTER TABLE "user" ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false;

-- Create twoFactor table
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- Add constraints
CREATE UNIQUE INDEX "twoFactor_userId_key" ON "twoFactor"("userId");
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

**Update Prisma schema - `prisma/schema.prisma`:**
```prisma
model User {
  // ... existing fields
  twoFactorEnabled Boolean?  @default(false)  // ADD this field
  // ... existing relations
  twoFactor       TwoFactor? // ADD this relation
}

// ADD this new model
model TwoFactor {
  id          String   @id @default(cuid())
  userId      String   @unique
  secret      String
  backupCodes String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("twoFactor")
}
```

### Step 1.3: Update Auth UI Components

**Create 2FA setup component - `features/auth/components/two-factor-setup.tsx`:**
```typescript
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import QRCode from "qrcode.react";

export function TwoFactorSetup() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const handleEnable2FA = async (password: string) => {
    setIsEnabling(true);
    try {
      const result = await authClient.twoFactor.enable({ password });
      if (result.data) {
        setTotpURI(result.data.totpURI);
        setBackupCodes(result.data.backupCodes);
      }
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerifyTOTP = async () => {
    try {
      await authClient.twoFactor.verifyTotp({ 
        code: verificationCode 
      });
      // 2FA is now fully enabled
      window.location.reload();
    } catch (error) {
      console.error("Invalid code:", error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
      
      {totpURI && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <QRCode value={totpURI} size={200} />
          </div>
          
          <div>
            <label>Enter verification code:</label>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
            />
            <Button onClick={handleVerifyTOTP} className="mt-2">
              Verify & Enable 2FA
            </Button>
          </div>
          
          {backupCodes && (
            <div className="mt-6 p-4 bg-yellow-50 border rounded">
              <h4 className="font-medium mb-2">Backup Codes (Save These!):</h4>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, i) => (
                  <div key={i}>{code}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
```

**Create 2FA verification page - `app/(auth)/auth/two-factor/page.tsx`:**
```typescript
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TwoFactorPage() {
  const [totpCode, setTotpCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleTOTPVerify = async () => {
    setIsVerifying(true);
    try {
      await authClient.twoFactor.verifyTotp({ 
        code: totpCode,
        trustDevice: true 
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("TOTP verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOTPVerify = async () => {
    setIsVerifying(true);
    try {
      await authClient.twoFactor.verifyOtp({ 
        code: otpCode,
        trustDevice: true 
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("OTP verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupVerify = async () => {
    setIsVerifying(true);
    try {
      await authClient.twoFactor.verifyBackupCode({ 
        code: backupCode,
        trustDevice: true 
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Backup code verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const sendOTP = async () => {
    try {
      await authClient.twoFactor.sendOtp({ trustDevice: true });
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">Two-Factor Authentication</h2>
        
        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp">Authenticator</TabsTrigger>
            <TabsTrigger value="otp">Email</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="totp" className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Enter code from your authenticator app:
              </label>
              <Input
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <Button 
              onClick={handleTOTPVerify}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4">
            <Button onClick={sendOTP} variant="outline" className="w-full">
              Send Email Code
            </Button>
            <div>
              <label className="text-sm font-medium">
                Enter code from email:
              </label>
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <Button 
              onClick={handleOTPVerify}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Enter backup code:
              </label>
              <Input
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="12345678"
                maxLength={8}
              />
            </div>
            <Button 
              onClick={handleBackupVerify}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
```

### Step 1.4: Testing Phase 1

**Test checklist:**
- [ ] 2FA setup flow works correctly
- [ ] TOTP codes generate and verify properly
- [ ] Email OTP codes are sent and verify
- [ ] Backup codes work for recovery
- [ ] Trusted devices function correctly
- [ ] Existing users can sign in normally
- [ ] Migration doesn't break existing sessions

```bash
# Run tests
bun run test:auth
bun run build
```

## Phase 2: Enhanced Admin System (Week 3)

### Step 2.1: Expand Custom Permissions

**Update permissions system - `lib/auth/permissions.ts`:**
```typescript
import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/admin/access";

// Expand permissions for Zolai AI
const statement = {
  ...defaultStatements,
  // Content management permissions
  post: ["create", "edit", "publish", "delete", "moderate", "feature"],
  page: ["create", "edit", "publish", "delete"],
  media: ["upload", "manage", "delete", "organize"],
  
  // Comment moderation
  comment: ["moderate", "delete", "approve", "spam", "bulk_action"],
  
  // System administration
  analytics: ["view", "export", "dashboard"],
  system: ["backup", "settings", "maintenance", "logs"],
  redirect: ["create", "edit", "delete", "manage"],
  
  // Newsletter & subscribers
  newsletter: ["create", "send", "manage", "analytics"],
  subscriber: ["view", "export", "manage"],
  
  // Form management
  form: ["create", "edit", "view_submissions", "export"],
  
  // SEO & site settings
  seo: ["manage", "analyze"],
  site: ["configure", "theme", "plugins"],
} as const;

export const ac = createAccessControl(statement);

// Map existing roles to new permission system
export const superAdminRole = ac.newRole({
  ...adminAc.statements, // Full admin permissions
  // Add all custom permissions for SUPER_ADMIN
  post: ["create", "edit", "publish", "delete", "moderate", "feature"],
  page: ["create", "edit", "publish", "delete"],
  media: ["upload", "manage", "delete", "organize"],
  comment: ["moderate", "delete", "approve", "spam", "bulk_action"],
  analytics: ["view", "export", "dashboard"],
  system: ["backup", "settings", "maintenance", "logs"],
  redirect: ["create", "edit", "delete", "manage"],
  newsletter: ["create", "send", "manage", "analytics"],
  subscriber: ["view", "export", "manage"],
  form: ["create", "edit", "view_submissions", "export"],
  seo: ["manage", "analyze"],
  site: ["configure", "theme", "plugins"],
});

export const adminRole = ac.newRole({
  ...adminAc.statements, // Basic admin permissions
  // Reduced permissions for ADMIN
  post: ["create", "edit", "publish", "moderate"],
  page: ["create", "edit", "publish"],
  media: ["upload", "manage"],
  comment: ["moderate", "delete", "approve", "spam"],
  analytics: ["view", "dashboard"],
  redirect: ["create", "edit", "delete"],
  newsletter: ["create", "manage"],
  subscriber: ["view", "manage"],
  form: ["create", "edit", "view_submissions"],
  seo: ["manage"],
});

export const editorRole = ac.newRole({
  // Content-focused permissions for EDITOR
  post: ["create", "edit", "moderate"],
  page: ["create", "edit"],
  media: ["upload"],
  comment: ["moderate", "approve"],
  analytics: ["view"],
  form: ["view_submissions"],
});

export const authorRole = ac.newRole({
  // Limited permissions for AUTHOR
  post: ["create", "edit"],
  media: ["upload"],
});

export const contributorRole = ac.newRole({
  // Minimal permissions for CONTRIBUTOR
  post: ["create"],
});

export const userRole = ac.newRole({
  user: [],
  session: [],
});
```

### Step 2.2: Update Admin Configuration

**Update admin plugin config - `lib/auth.ts`:**
```typescript
import { ac, superAdminRole, adminRole, editorRole, authorRole, contributorRole, userRole } from "./auth/permissions";

export const auth = betterAuth({
  // ... existing config
  plugins: [
    twoFactor({
      // ... 2FA config from Phase 1
    }),
    
    admin({
      ac,
      roles: {
        superAdmin: superAdminRole,
        admin: adminRole,
        editor: editorRole,
        author: authorRole,
        contributor: contributorRole,
        user: userRole,
      },
      defaultRole: "USER",
      adminRoles: ["SUPER_ADMIN", "ADMIN"],
      adminUserIds: [], // Can add specific user IDs if needed
      defaultBanReason: "Policy violation",
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
      bannedUserMessage: "Your account has been suspended. Please contact support.",
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
      allowImpersonatingAdmins: false,
    }),
  ],
});
```

**Update client plugin config - `lib/auth-client.ts`:**
```typescript
export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      // ... 2FA config
    }),
    
    adminClient({
      ac,
      roles: {
        superAdmin: superAdminRole,
        admin: adminRole,
        editor: editorRole,
        author: authorRole,
        contributor: contributorRole,
        user: userRole,
      },
    }),
  ],
});
```

### Step 2.3: Create Permission Helper Functions

**Enhanced admin helpers - `lib/auth/admin.ts`:**
```typescript
import { ac } from "./permissions";

// Add these new helper functions

/**
 * Check specific permission for current user
 */
export async function hasContentPermission(
  action: "create" | "edit" | "publish" | "delete" | "moderate" | "feature",
  contentType: "post" | "page" = "post"
): Promise<boolean> {
  return hasPermission({
    [contentType]: [action],
  });
}

/**
 * Check if user can moderate comments
 */
export async function canModerateComments(): Promise<boolean> {
  return hasPermission({
    comment: ["moderate"],
  });
}

/**
 * Check if user can access analytics
 */
export async function canAccessAnalytics(): Promise<boolean> {
  return hasPermission({
    analytics: ["view"],
  });
}

/**
 * Check if user can manage system settings
 */
export async function canManageSystem(): Promise<boolean> {
  return hasPermission({
    system: ["settings"],
  });
}

/**
 * Get user's effective permissions (client-side)
 */
export function checkRolePermissions(role: string) {
  // This can be used on the client side for UI rendering
  return {
    canCreatePosts: ac.checkRolePermission({
      role,
      permissions: { post: ["create"] }
    }),
    canModerateComments: ac.checkRolePermission({
      role,
      permissions: { comment: ["moderate"] }
    }),
    canAccessAnalytics: ac.checkRolePermission({
      role,
      permissions: { analytics: ["view"] }
    }),
    canManageSystem: ac.checkRolePermission({
      role,
      permissions: { system: ["settings"] }
    }),
  };
}
```

## Phase 3: Organization Plugin Implementation (Week 4-5)

### Step 3.1: Install and Configure Organization Plugin

**Update auth config - `lib/auth.ts`:**
```typescript
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  // ... existing config
  plugins: [
    twoFactor({
      // ... existing 2FA config
    }),
    
    admin({
      // ... existing admin config
    }),
    
    // ADD organization plugin
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Only admins and super admins can create organizations initially
        return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
      },
      
      requireEmailVerificationOnInvitation: true,
      
      // Setup email sending for invitations
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/org/invitation/${data.id}`;
        
        await sendEmail({
          to: data.email,
          subject: `Invitation to join ${data.organization.name}`,
          html: emailTemplates.organizationInvitation({
            invitedByName: data.inviter.user.name,
            organizationName: data.organization.name,
            inviteLink,
            role: data.role,
          }),
        });
      },
      
      organizationHooks: {
        // After creating organization, setup default resources
        afterCreateOrganization: async ({ organization, user }) => {
          console.log(`Organization ${organization.name} created by ${user.name}`);
          
          // Could setup default settings, resources, etc.
          // await setupOrganizationDefaults(organization.id);
        },
        
        // Before adding members, validate
        beforeAddMember: async ({ member, user, organization }) => {
          // Additional validation logic if needed
          console.log(`Adding ${user.email} to ${organization.name}`);
        },
      },
      
      // Enable teams feature for organizations
      teams: {
        enabled: true,
      },
    }),
  ],
});
```

**Update client config - `lib/auth-client.ts`:**
```typescript
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      // ... existing config
    }),
    
    adminClient({
      // ... existing config  
    }),
    
    // ADD organization client
    organizationClient(),
  ],
});
```

### Step 3.2: Database Migration for Organizations

**Run migration:**
```bash
bunx prisma migrate dev --name add_organization_support
```

**The migration will automatically add these tables:**
- `organization` - Organization details
- `member` - Organization memberships
- `invitation` - Pending invitations
- `team` - Teams within organizations (if enabled)
- `teamMember` - Team memberships

**Update session table for active organization:**
```sql
-- Add activeOrganizationId to session table
ALTER TABLE "session" ADD COLUMN "activeOrganizationId" TEXT;
ALTER TABLE "session" ADD CONSTRAINT "session_activeOrganizationId_fkey" 
  FOREIGN KEY ("activeOrganizationId") REFERENCES "organization"("id") ON DELETE SET NULL;
```

### Step 3.3: Create Organization Management UI

**Organization dashboard component - `features/organizations/components/organization-dashboard.tsx`:**
```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Settings, Users, Mail } from "lucide-react";

export function OrganizationDashboard() {
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const createOrganization = async () => {
    // Implementation for creating new organization
  };

  const switchOrganization = async (orgId: string) => {
    await authClient.organization.setActive({ organizationId: orgId });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Button onClick={createOrganization}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {activeOrg && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Active Organization</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{activeOrg.name}</h3>
              <p className="text-sm text-gray-600">{activeOrg.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Members
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Invitations
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations?.map((org) => (
          <Card key={org.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{org.name}</h3>
              {activeOrg?.id === org.id && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{org.slug}</p>
            <div className="flex gap-2">
              {activeOrg?.id !== org.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchOrganization(org.id)}
                >
                  Switch
                </Button>
              )}
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Step 3.4: Testing Phase 2 & 3

**Test checklist:**
- [ ] Enhanced admin permissions work correctly
- [ ] Role-based UI rendering functions properly
- [ ] Organization creation and management works
- [ ] Member invitations are sent and processed
- [ ] Active organization switching functions
- [ ] Team management (if enabled) works
- [ ] All existing functionality remains intact

```bash
# Run full test suite
bun run test
bun run test:e2e
bun run build
```

## Phase 4: Additional Security & Localization (Week 6)

### Step 4.1: Add Security Plugins

**Install additional plugins:**
```typescript
import { captcha, i18n } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    // ... existing plugins
    
    // Add captcha for form protection
    captcha({
      // Configure with your preferred captcha provider
      // Could integrate with existing honeypot system
    }),
    
    // Add i18n for Burmese localization
    i18n({
      defaultLanguage: "en",
      supportedLanguages: ["en", "my"],
      translations: {
        my: {
          // Burmese translations
          "auth.signIn": "ဝင်ရောက်ရန်",
          "auth.signUp": "မှတ်ပုံတင်ရန်", 
          "auth.email": "အီးမေးလ်",
          "auth.password": "စကားဝှက်",
          // ... more translations
        }
      }
    }),
  ],
});
```

## Final Migration Checklist

### Pre-Production
- [ ] All phases tested in staging environment
- [ ] Database backups created
- [ ] Migration scripts tested and verified
- [ ] Performance impact assessed
- [ ] Security audit completed
- [ ] Documentation updated

### Production Deployment
- [ ] Maintenance window scheduled
- [ ] Database migration executed
- [ ] Application deployed
- [ ] Smoke tests passed
- [ ] User acceptance testing completed
- [ ] Rollback plan tested and ready

### Post-Migration
- [ ] User training completed (for admin users)
- [ ] Performance monitoring in place
- [ ] Error tracking active
- [ ] User feedback collection active
- [ ] Documentation published

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback:**
   ```bash
   git revert <migration-commits>
   # Restore database from backup
   pg_restore backup_pre_migration.sql
   ```

2. **Partial Rollback:**
   - Disable specific plugins in auth config
   - Use feature flags to toggle functionality
   - Maintain backward compatibility

3. **Data Recovery:**
   - All user data preserved during migration
   - Session data may need refresh
   - 2FA settings can be reset if needed

## Support Resources

- **Better Auth Documentation**: https://www.better-auth.com/docs
- **Plugin Reference**: https://www.better-auth.com/docs/plugins  
- **Migration Support**: Internal team channel
- **Emergency Contact**: Team Alpha lead

---

*Follow this guide step-by-step for a successful Better Auth plugin migration. Each phase builds on the previous one, ensuring stability throughout the process.*