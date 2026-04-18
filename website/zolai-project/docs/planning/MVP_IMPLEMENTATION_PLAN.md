# MVP Implementation Plan - Zolai AI

**Current Status**: 62% Complete
**Target**: 100% MVP Ready
**Estimated Effort**: 40-50 hours
**Timeline**: 5-7 business days

---

## Executive Summary

The project has core infrastructure in place but is missing critical user-facing features:
- **Forms**: Backend complete, zero admin UI
- **Newsletter**: Backend 75% complete, email sending broken (2 TODOs)
- **Notifications**: 55% complete, API endpoints incomplete
- **Security**: 80% complete, ready for MVP

**Critical Blockers**: Forms admin UI, Newsletter email sending, Notifications API

---

## Phase 1: Newsletter Email Sending (P0 - Critical)

**Status**: 75% Complete
**Effort**: 4-6 hours
**Blocks**: Core newsletter functionality

### Tasks
1. **Create Email Service** (2 hours)
   - [ ] Create `lib/email/email-service.ts` - Email sending abstraction
   - [ ] Add Resend/SendGrid integration
   - [ ] Create email templates for confirmation/campaign
   - [ ] Add retry logic for failed sends

2. **Implement Confirmation Email** (1 hour)
   - [ ] File: `features/newsletter/server/router.ts:66`
   - [ ] Call email service after subscribe
   - [ ] Log email send status to database
   - [ ] Add error handling

3. **Implement Campaign Distribution** (2 hours)
   - [ ] File: `features/newsletter/server/router.ts:343`
   - [ ] Query all CONFIRMED subscribers
   - [ ] Send email to each with unsubscribe link
   - [ ] Track delivery status
   - [ ] Update campaign sent_count, sent_at

4. **Add Email Templates** (1 hour)
   - [ ] Create email template files
   - [ ] Add variable interpolation ({{name}}, {{unsubscribeLink}})
   - [ ] Test template rendering

### Files to Modify
- `lib/email/email-service.ts` (NEW)
- `lib/email/templates/` (NEW)
- `features/newsletter/server/router.ts` (MODIFY lines 66, 343)
- `.env` (ADD email service credentials)

---

## Phase 2: Forms Feature - Admin UI & Hooks (P1 - High Priority)

**Status**: 32% Complete
**Effort**: 16-23 hours
**Blocks**: Form management feature entirely

### 2.1 Types & Schemas (2-3 hours)

**File**: `features/forms/types.ts` (NEW)
- [ ] FormField interface
- [ ] Form interface
- [ ] FormSubmission interface
- [ ] FormResponse interface

**File**: `features/forms/schemas/form.schema.ts` (NEW)
- [ ] createFormSchema (Zod)
- [ ] updateFormSchema (Zod)
- [ ] formFieldSchema (Zod)
- [ ] submitFormSchema (Zod)

### 2.2 Hooks (5-8 hours)

**Directory**: `features/forms/hooks/` (NEW)

- [ ] `useFormsList.ts`
  - Query: GET /api/forms with pagination
  - Search, filter by status
  - Refetch on interval

- [ ] `useFormDetail.ts`
  - Query: GET /api/forms/:id
  - Include all fields and settings

- [ ] `useCreateForm.ts`
  - Mutation: POST /api/forms
  - Validate with schema
  - Return new form with ID

- [ ] `useUpdateForm.ts`
  - Mutation: PATCH /api/forms/:id
  - Update name, description, settings
  - Revalidate list after update

- [ ] `useDeleteForm.ts`
  - Mutation: DELETE /api/forms/:id
  - Confirm before delete
  - Remove from list

- [ ] `useFormSubmissions.ts`
  - Query: GET /api/forms/:id/submissions
  - Pagination and filtering
  - Sort by date

- [ ] `useSubmitForm.ts`
  - Mutation: POST /api/forms/:id/submit
  - Client-side validation
  - Success/error handling

### 2.3 Admin Components (8-12 hours)

**Directory**: `features/forms/components/admin/` (NEW)

- [ ] `admin-forms-page.tsx` (Main page)
  - Table with infinite scroll/pagination toggle
  - Search by form name
  - Bulk actions (delete, export)
  - Create new form button
  - Export CSV button
  - Stats: total forms, total submissions

- [ ] `form-editor-dialog.tsx`
  - Modal for create/edit form
  - Form name, description
  - Settings: notifications, custom CSS, webhook
  - Submit/cancel buttons
  - Preview link

- [ ] `form-field-editor.tsx`
  - Add/edit/delete fields
  - Field types: text, email, textarea, select, checkbox, date
  - Field settings: required, placeholder, options
  - Drag to reorder
  - Clone field button

- [ ] `form-preview.tsx`
  - Show form as it appears to users
  - Live update as fields change
  - Test submission

- [ ] `submissions-viewer.tsx`
  - Table of submissions for a form
  - Filter by date, status
  - View submission details
  - Export submissions CSV/JSON
  - Bulk actions

- [ ] `submission-detail-modal.tsx`
  - Full submission details
  - Show all field responses
  - Submission metadata (IP, timestamp, browser)
  - Action buttons (mark as spam, delete)

### Files to Create
- `features/forms/types.ts`
- `features/forms/schemas/form.schema.ts`
- `features/forms/hooks/useFormsList.ts`
- `features/forms/hooks/useFormDetail.ts`
- `features/forms/hooks/useCreateForm.ts`
- `features/forms/hooks/useUpdateForm.ts`
- `features/forms/hooks/useDeleteForm.ts`
- `features/forms/hooks/useFormSubmissions.ts`
- `features/forms/hooks/useSubmitForm.ts`
- `features/forms/components/admin/admin-forms-page.tsx`
- `features/forms/components/admin/form-editor-dialog.tsx`
- `features/forms/components/admin/form-field-editor.tsx`
- `features/forms/components/admin/form-preview.tsx`
- `features/forms/components/admin/submissions-viewer.tsx`
- `features/forms/components/admin/submission-detail-modal.tsx`

---

## Phase 3: Newsletter Admin Wiring (P1 - High Priority)

**Status**: 75% Complete
**Effort**: 6-8 hours
**Depends on**: Phase 1 (email sending)

### 3.1 Hooks (2-3 hours)

**File**: `features/newsletter/hooks/useNewsletterStats.ts` (NEW)
- [ ] Query: GET /api/admin/newsletter/stats
- [ ] Stats: total subscribers, confirmed, pending, unsubscribed
- [ ] Open rate, click rate, bounce rate
- [ ] Refetch every 30 seconds

**File**: `features/newsletter/hooks/useCampaignEditor.ts` (NEW)
- [ ] Mutation: PATCH /api/admin/newsletter/campaigns/:id
- [ ] Update subject, body, scheduling
- [ ] Save as draft or publish

### 3.2 Admin Page Updates (3-4 hours)

**File**: `features/newsletter/components/admin/admin-subscribers-page.tsx` (MODIFY)
- [ ] Wire useSubscribers hook to data table
- [ ] Show status badges (PENDING, CONFIRMED, UNSUBSCRIBED)
- [ ] Search by email
- [ ] Bulk actions: confirm, delete, unsubscribe
- [ ] Import subscribers CSV
- [ ] Filter by subscription date

**File**: `features/newsletter/components/admin/admin-newsletter-campaigns-page.tsx` (MODIFY)
- [ ] Wire useCampaigns hook to table
- [ ] Show campaign status (DRAFT, SENT, SCHEDULED)
- [ ] Show send date, subscriber count, open rate
- [ ] Create campaign button → form
- [ ] Edit campaign modal
- [ ] Send campaign button (with confirmation)
- [ ] Preview campaign before send
- [ ] Campaign analytics/stats

### Files to Create
- `features/newsletter/hooks/useNewsletterStats.ts`
- `features/newsletter/hooks/useCampaignEditor.ts`

### Files to Modify
- `features/newsletter/components/admin/admin-subscribers-page.tsx`
- `features/newsletter/components/admin/admin-newsletter-campaigns-page.tsx`

---

## Phase 4: Notifications Feature Completion (P1 - High Priority)

**Status**: 55% Complete
**Effort**: 8-10 hours
**Depends on**: None

### 4.1 API Endpoints (3-4 hours)

**File**: `app/api/[[...route]]/notifications.ts` (MODIFY)

Add endpoints:
- [ ] `POST /templates` - Create template
  - Body: name, slug, type, subject, body, variables
  - Return: created template with ID
  
- [ ] `GET /templates/:id` - Get single template
  - Return: full template details
  
- [ ] `PATCH /templates/:id` - Update template
  - Body: name, subject, body, variables, isActive
  - Return: updated template
  
- [ ] `DELETE /templates/:id` - Delete template
  - Soft delete or hard delete
  - Return: success
  
- [ ] `POST /send-bulk` - Send to multiple users
  - Body: templateId, recipientIds, variables (optional)
  - Return: { sent: number, failed: number, errors: [...] }
  - Send notifications async
  - Log delivery status

All endpoints require admin authentication.

### 4.2 Frontend Hooks (2-3 hours)

**File**: `features/notifications/hooks/useNotificationTemplates.ts` (NEW)
- [ ] useTemplatesList - GET /api/notifications/templates
- [ ] useTemplateDetail - GET /api/notifications/templates/:id
- [ ] useCreateTemplate - POST /api/notifications/templates
- [ ] useUpdateTemplate - PATCH /api/notifications/templates/:id
- [ ] useDeleteTemplate - DELETE /api/notifications/templates/:id

**File**: `features/notifications/hooks/useNotificationStats.ts` (NEW)
- [ ] Query stats: templates count, sent count, delivery rate

**File**: `features/notifications/hooks/useSendNotification.ts` (NEW)
- [ ] Mutation: POST /api/notifications/send-bulk

### 4.3 Admin Components (3-4 hours)

**File**: `features/notifications/components/admin/admin-notifications-page.tsx` (MODIFY)
- [ ] Wire useNotificationTemplates to template table
- [ ] Show template type, status (active/inactive)
- [ ] Create template button → editor
- [ ] Edit button → editor
- [ ] Delete button (with confirmation)
- [ ] Preview template button → modal
- [ ] Test send button → send to self

**File**: `features/notifications/components/admin/template-editor.tsx` (NEW)
- [ ] Modal/sidebar for create/edit template
- [ ] Fields: name, slug, type (email, sms, push, webhook)
- [ ] Subject field (email/SMS)
- [ ] Body textarea with markdown support
- [ ] Variable picker dropdown
- [ ] Preview as you type
- [ ] Save/cancel buttons

**File**: `features/notifications/components/admin/variable-reference.tsx` (NEW)
- [ ] Show available variables for selected type
- [ ] {{userId}}, {{userName}}, {{email}}, {{date}}, etc.
- [ ] Copy variable to clipboard

### Files to Create
- `features/notifications/hooks/useNotificationTemplates.ts`
- `features/notifications/hooks/useNotificationStats.ts`
- `features/notifications/hooks/useSendNotification.ts`
- `features/notifications/components/admin/template-editor.tsx`
- `features/notifications/components/admin/variable-reference.tsx`

### Files to Modify
- `app/api/[[...route]]/notifications.ts` (ADD 5 endpoints)
- `features/notifications/components/admin/admin-notifications-page.tsx`

---

## Phase 5: Error Handling & Flow Improvements (P2 - Polish)

**Status**: Partial
**Effort**: 4-6 hours
**Impact**: Better UX, fewer user-facing errors

### 5.1 Error Boundary Components (1-2 hours)

**File**: `components/ui/error-boundary.tsx` (NEW)
- [ ] Catch errors in component tree
- [ ] Show friendly error message
- [ ] Offer retry button
- [ ] Log to analytics

**File**: `components/ui/form-error.tsx` (NEW)
- [ ] Display field-level errors
- [ ] Show validation messages
- [ ] Highlight invalid fields

### 5.2 Loading States (1-2 hours)

**Files**: `components/ui/` (NEW)
- [ ] `skeleton-loader.tsx` - Generic skeleton
- [ ] `table-skeleton.tsx` - Table placeholder
- [ ] `form-skeleton.tsx` - Form placeholder
- [ ] Use in all data-fetching components

### 5.3 Validation & UX (1-2 hours)

- [ ] Client-side validation on all forms
- [ ] Real-time validation feedback
- [ ] Disable submit button during request
- [ ] Prevent double-submit with race condition handling
- [ ] Success toast on create/update/delete

### 5.4 API Error Handling (1 hour)

- [ ] Standardize error responses (already done, verify consistency)
- [ ] Add proper error logging middleware
- [ ] Implement retry logic for transient failures
- [ ] Handle network timeouts gracefully

### Files to Create
- `components/ui/error-boundary.tsx`
- `components/ui/form-error.tsx`
- `components/ui/skeleton-loader.tsx`
- `components/ui/table-skeleton.tsx`

---

## Phase 6: Testing & Quality Assurance (P2 - Validation)

**Status**: Tests exist for notifications, need broader coverage
**Effort**: 3-4 hours
**Impact**: Confidence in features working correctly

### 6.1 End-to-End Workflows (2 hours)

Test scenarios:
- [ ] Forms: Create → Configure 5 fields → Preview → Submit → View submission
- [ ] Newsletter: Subscribe → Confirm email → Create campaign → Send → Check delivery
- [ ] Notifications: Create template → Send to admin → View in history
- [ ] Security: View blocked IPs → Block IP → Verify blocks new requests

### 6.2 Edge Cases (1 hour)

- [ ] Empty states: No forms, no subscribers, no notifications
- [ ] Long names: 200+ character form names
- [ ] Special characters: Unicode in submissions
- [ ] Rate limiting: Verify 429 behavior doesn't break UI
- [ ] Network errors: API down, timeout behavior

### 6.3 Performance (1 hour)

- [ ] Pagination works correctly (load more, next page)
- [ ] Infinite scroll loads data as expected
- [ ] API response times < 2s for typical queries
- [ ] Memory usage stable (no leaks)
- [ ] No N+1 queries

### 6.4 Regression Testing

- [ ] Run existing test suite
- [ ] All Phase 6 notification tests still pass
- [ ] No new TypeScript errors
- [ ] No new lint warnings

---

## Dependencies & Ordering

```
PHASE 1: Email Service
  └─ PHASE 3: Newsletter Wiring
     └─ Launch Newsletter feature

PHASE 2: Forms Admin UI
  └─ Launch Forms feature

PHASE 4: Notifications API & UI
  └─ Launch Notifications feature

PHASE 5: Error Handling & Polish
  └─ Apply across all features

PHASE 6: Testing
  └─ Verify everything works
```

**Recommended execution order**:
1. Phase 1 (4-6h) - Email service (quick win, critical)
2. Phase 2 (16-23h) - Forms UI (largest feature, no dependencies)
3. Phase 3 (6-8h) - Newsletter wiring (depends on Phase 1)
4. Phase 4 (8-10h) - Notifications completion
5. Phase 5 (4-6h) - Error handling & polish
6. Phase 6 (3-4h) - Testing & verification

---

## Success Criteria - MVP Ready ✅

### Forms Feature
- [ ] Admin can create/edit/delete forms
- [ ] Admin can view all submissions
- [ ] Users can find and submit forms
- [ ] Form validation works (client + server)
- [ ] No errors in console/logs

### Newsletter Feature
- [ ] New subscribers receive confirmation email
- [ ] Subscribers can confirm subscription
- [ ] Admin can create and send campaigns
- [ ] Campaign emails reach subscribers
- [ ] Unsubscribe link works

### Notifications Feature
- [ ] Admin can create notification templates
- [ ] Admin can send notifications to users
- [ ] Templates support variables
- [ ] Notification history shows sent notifications
- [ ] Rate limiting doesn't block legitimate requests

### General Quality
- [ ] No 500 errors in production
- [ ] All pages load in < 3 seconds
- [ ] Form validations work (client + server)
- [ ] Loading states show for async operations
- [ ] Error messages are helpful, not cryptic
- [ ] Navigation between features works
- [ ] No console errors or warnings

### Performance
- [ ] Pagination/infinite scroll works correctly
- [ ] Tables load with 50+ items
- [ ] Search filters <500ms response
- [ ] Email delivery doesn't block user requests
- [ ] Notifications send async

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Email service integration breaks | Use well-tested library (Resend), mock in tests |
| Large form submissions slow down DB | Add indexes on commonly filtered fields |
| Too many newsletters spam queue | Rate limit bulk sends, queue async |
| Notifications delivery unreliable | Add retry logic, log all attempts |
| Admin pages get slow with 1000+ items | Implement pagination/infinite scroll |

---

## Timeline Estimate

| Phase | Hours | Days | Status |
|-------|-------|------|--------|
| 1: Email | 4-6 | 1 | Not started |
| 2: Forms | 16-23 | 2-3 | Not started |
| 3: Newsletter | 6-8 | 1 | Not started |
| 4: Notifications | 8-10 | 1-2 | Not started |
| 5: Polish | 4-6 | 1 | Not started |
| 6: Testing | 3-4 | 1 | Not started |
| **TOTAL** | **40-50** | **5-7 days** | |

---

## Go/No-Go Decision Points

**After Phase 1**: Can we send emails reliably?
- YES → Continue to Phase 2
- NO → Debug email service, retry Phase 1

**After Phase 2**: Forms admin UI working?
- YES → Continue to Phase 3
- NO → Fix component issues, retry Phase 2

**After Phase 3**: Newsletter admin working?
- YES → Continue to Phase 4
- NO → Wire up hooks/data binding, retry Phase 3

**After Phase 4**: All admin features working?
- YES → Continue to Phase 5
- NO → Fix API endpoints, retry Phase 4

**After Phase 6**: All tests passing + workflows working?
- YES → LAUNCH MVP ✅
- NO → Fix failing tests, retry Phase 6

---

## Next Steps

1. Review this plan with stakeholder
2. Confirm email service (Resend vs SendGrid)
3. Confirm timeline (full 50h or phased approach)
4. Start Phase 1 (email service)
5. Daily standup on progress

