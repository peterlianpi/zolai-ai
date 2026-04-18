# MVP TODO LISTS - Detailed Task Breakdown

## PHASE 1: Newsletter Email Sending (4-6 hours)

### 1.1 Email Service Setup
- [ ] Create `lib/email/email-service.ts`
  - [ ] Define EmailTemplate interface
  - [ ] Create sendEmail() function with Resend integration
  - [ ] Add error handling and retry logic
  - [ ] Add logging for sent/failed emails
  - [ ] Export sendConfirmationEmail() function
  - [ ] Export sendCampaignEmail() function

- [ ] Create `lib/email/templates.ts`
  - [ ] Define confirmation email template
  - [ ] Define campaign email template
  - [ ] Add variable interpolation: {{name}}, {{unsubscribeLink}}, {{campaignTitle}}
  - [ ] Add HTML and plain text versions

- [ ] Create `.env.local` configuration
  - [ ] Add RESEND_API_KEY
  - [ ] Add FROM_EMAIL for newsletters
  - [ ] Test API key is valid

### 1.2 Confirmation Email Integration
- [ ] Open `features/newsletter/server/router.ts`
  - [ ] Line 66: Replace TODO with sendConfirmationEmail call
  - [ ] Pass: email, name, confirmation token
  - [ ] Add try/catch error handling
  - [ ] Log success to console
  - [ ] Still return 201 created even if email fails (best effort)

- [ ] Test confirmation email
  - [ ] Subscribe with valid email
  - [ ] Check Resend dashboard for sent email
  - [ ] Verify email contains confirmation link
  - [ ] Click link and verify confirmation works

### 1.3 Campaign Distribution Integration
- [ ] Open `features/newsletter/server/router.ts`
  - [ ] Line 343: Replace TODO with batch sending logic
  - [ ] Query all subscribers with status = CONFIRMED
  - [ ] Build email list with unsubscribe tokens
  - [ ] Send in batches (50 emails per batch with 100ms delay)
  - [ ] Track sent_count and sent_at
  - [ ] Log any failures
  - [ ] Return success with sent count

- [ ] Test campaign sending
  - [ ] Create test campaign with subject and body
  - [ ] Send campaign
  - [ ] Verify sent_at timestamp updated
  - [ ] Check Resend for 10+ emails sent
  - [ ] Verify unsubscribe link in emails

### 1.4 Error Handling & Logging
- [ ] Add email_delivery table to Prisma (if not exists)
  - [ ] Track email_address, template_type, status, error_message
  - [ ] Add index on created_at for analytics

- [ ] Implement delivery logging
  - [ ] Log every send attempt (success/failure)
  - [ ] Store error messages for debugging
  - [ ] Create dashboard query for delivery stats

---

## PHASE 2: Forms Feature - Admin UI & Hooks (16-23 hours)

### 2.1 Types & Schemas (2-3 hours)

- [ ] Create `features/forms/types.ts`
  - [ ] Export FormField interface: id, type, label, required, placeholder, options
  - [ ] Export Form interface: id, name, description, fields[], settings, status, createdAt
  - [ ] Export FormSubmission interface: id, formId, responses, metadata (IP, userAgent), createdAt
  - [ ] Export FormSettings interface: notifyEmail, webhookUrl, customCSS

- [ ] Create `features/forms/schemas/form.schema.ts`
  - [ ] createFormSchema: name (required), description, notifyEmail
  - [ ] updateFormSchema: Same as create
  - [ ] formFieldSchema: type, label, required, placeholder, options (if select)
  - [ ] submitFormSchema: formId, responses (key-value pairs)

- [ ] Create `features/forms/api/index.ts`
  - [ ] Export typed API client: getFormsList, getFormDetail, createForm, etc.
  - [ ] Use Hono client for type safety

### 2.2 Hooks - List & Query (3-4 hours)

- [ ] Create `features/forms/hooks/useFormsList.ts`
  - [ ] useQuery GET /api/admin/forms
  - [ ] Support pagination: page, limit
  - [ ] Support search: search query string
  - [ ] Auto-refetch every 30 seconds
  - [ ] Return: forms[], total, hasMore, isLoading

- [ ] Create `features/forms/hooks/useFormDetail.ts`
  - [ ] useQuery GET /api/admin/forms/:id
  - [ ] Include all fields and settings
  - [ ] Watch dependency on formId
  - [ ] Return: form, isLoading, error

- [ ] Create `features/forms/hooks/useFormSubmissions.ts`
  - [ ] useQuery GET /api/admin/forms/:id/submissions
  - [ ] Pagination: page, limit (20 default)
  - [ ] Filter: dateRange, status
  - [ ] Sort: by date (desc), by submitter
  - [ ] Return: submissions[], total, hasMore, isLoading

### 2.3 Hooks - Mutations (2-3 hours)

- [ ] Create `features/forms/hooks/useCreateForm.ts`
  - [ ] useMutation POST /api/admin/forms
  - [ ] Validate with createFormSchema
  - [ ] Show toast on success/error
  - [ ] Refetch forms list after create
  - [ ] Return mutation object

- [ ] Create `features/forms/hooks/useUpdateForm.ts`
  - [ ] useMutation PATCH /api/admin/forms/:id
  - [ ] Validate with updateFormSchema
  - [ ] Show toast on success/error
  - [ ] Refetch form detail after update
  - [ ] Return mutation object

- [ ] Create `features/forms/hooks/useDeleteForm.ts`
  - [ ] useMutation DELETE /api/admin/forms/:id
  - [ ] Require confirmation dialog
  - [ ] Show toast on success/error
  - [ ] Remove from forms list after delete
  - [ ] Return mutation object

- [ ] Create `features/forms/hooks/useSubmitForm.ts`
  - [ ] useMutation POST /api/forms/:id/submit (public)
  - [ ] Client-side validation with schema
  - [ ] Return: success message
  - [ ] Disable submit button on pending
  - [ ] Clear form on success

### 2.4 Admin Components - Main Page (3-4 hours)

- [ ] Create `features/forms/components/admin/admin-forms-page.tsx`
  - [ ] Page header: "Forms"
  - [ ] Stats card: total forms, total submissions this month
  - [ ] Search input with icon
  - [ ] Create Form button (opens editor)
  - [ ] Export All button (downloads CSV)
  - [ ] Table with columns:
    - [ ] Checkbox (select all / individual)
    - [ ] Name (clickable → view form)
    - [ ] Status (active/inactive badge)
    - [ ] Submissions count
    - [ ] Created date
    - [ ] Actions: edit, preview, delete
  - [ ] Pagination toggle (infinite scroll / normal)
  - [ ] Bulk actions toolbar: delete selected, export selected
  - [ ] Empty state: "No forms yet" with create button

- [ ] Implement sorting
  - [ ] Sort by: name, submissions (desc), created (desc)
  - [ ] Remember sort preference in URL

- [ ] Implement filtering
  - [ ] Filter by: active/inactive status
  - [ ] Combine search + filter

### 2.5 Admin Components - Editor (2-3 hours)

- [ ] Create `features/forms/components/admin/form-editor-dialog.tsx`
  - [ ] Modal that opens on "Create" or "Edit"
  - [ ] Form fields:
    - [ ] Name input (required, max 100)
    - [ ] Description textarea (optional)
    - [ ] Notify email input (for form submissions)
    - [ ] Webhook URL input (optional)
    - [ ] Custom CSS textarea (optional)
  - [ ] Tabs: General | Fields | Advanced Settings
  - [ ] Preview button (shows form-preview component)
  - [ ] Cancel/Save buttons
  - [ ] Show loading state during save
  - [ ] Close on success

- [ ] Create `features/forms/components/admin/form-field-editor.tsx`
  - [ ] Collapsible "Fields" section
  - [ ] List of fields (draggable to reorder)
  - [ ] Add Field button (opens field modal)
  - [ ] For each field:
    - [ ] Field label
    - [ ] Field type badge
    - [ ] Clone button
    - [ ] Delete button
    - [ ] Edit button
  - [ ] Add field modal:
    - [ ] Type select: text, email, textarea, number, select, checkbox, date
    - [ ] Label input
    - [ ] Required checkbox
    - [ ] Placeholder input
    - [ ] Options textarea (for select/checkbox)
    - [ ] Validation pattern (optional)
    - [ ] Save/Cancel buttons

### 2.6 Admin Components - Preview & Submissions (3-4 hours)

- [ ] Create `features/forms/components/admin/form-preview.tsx`
  - [ ] Show form as public users see it
  - [ ] Render each field with validation
  - [ ] Test submit functionality
  - [ ] Show submission confirmation
  - [ ] Live update as fields are edited

- [ ] Create `features/forms/components/admin/submissions-viewer.tsx`
  - [ ] Table with columns:
    - [ ] Submission date
    - [ ] Submitter (name/email if captured)
    - [ ] Status (new, read, spam)
    - [ ] Actions: view detail, mark as spam, delete
  - [ ] Filters:
    - [ ] By date range
    - [ ] By status
    - [ ] By submitter email
  - [ ] Export button: CSV / JSON
  - [ ] Bulk actions: delete, export selected
  - [ ] Pagination/infinite scroll
  - [ ] Empty state

- [ ] Create `features/forms/components/admin/submission-detail-modal.tsx`
  - [ ] Modal showing full submission
  - [ ] Header: submission date, submitter IP
  - [ ] All field responses displayed
  - [ ] Metadata: user-agent, IP address, referrer
  - [ ] Actions: mark as spam, delete, close
  - [ ] Navigation: prev/next submission

### 2.7 Validation & Error Handling
- [ ] Client-side validation
  - [ ] Required fields marked with *
  - [ ] Real-time validation feedback
  - [ ] Red borders on invalid fields
  - [ ] Error messages below fields

- [ ] Server-side validation
  - [ ] Verify with Zod schemas
  - [ ] Return 400 with field-level errors
  - [ ] Test invalid inputs

---

## PHASE 3: Newsletter Admin Wiring (6-8 hours)

### 3.1 New Hooks (2-3 hours)

- [ ] Create `features/newsletter/hooks/useNewsletterStats.ts`
  - [ ] useQuery GET /api/admin/newsletter/stats
  - [ ] Return: totalSubscribers, confirmedCount, pendingCount, unsubscribedCount
  - [ ] Return: avgOpenRate, avgClickRate, lastCampaignDate
  - [ ] Auto-refetch every 1 minute
  - [ ] Show loading skeleton while fetching

- [ ] Create `features/newsletter/hooks/useCampaignEditor.ts`
  - [ ] useMutation PATCH /api/admin/newsletter/campaigns/:id
  - [ ] Update: subject, body, htmlBody, scheduledAt, status (draft/sent)
  - [ ] Validate campaign before save
  - [ ] Show success toast

### 3.2 Wire Subscribers Page (2-3 hours)

- [ ] Open `features/newsletter/components/admin/admin-subscribers-page.tsx`
  - [ ] Add useSubscribers hook
  - [ ] Display subscribers in table with columns:
    - [ ] Email (searchable)
    - [ ] Name (optional)
    - [ ] Status badge (PENDING / CONFIRMED / UNSUBSCRIBED)
    - [ ] Subscription date
    - [ ] Last email received
    - [ ] Actions: confirm, resend confirmation, delete, unsubscribe
  - [ ] Add stats cards at top:
    - [ ] Total subscribers
    - [ ] Confirmed count
    - [ ] Pending confirmations (with action to auto-send)
  - [ ] Search by email
  - [ ] Filter by status
  - [ ] Import CSV button (with preview before import)
  - [ ] Export CSV button (all or selected)
  - [ ] Pagination/infinite scroll
  - [ ] Bulk actions: confirm, unsubscribe, delete

- [ ] Add confirmation bulk action
  - [ ] Select multiple PENDING subscribers
  - [ ] "Send Confirmations" button
  - [ ] Resend confirmation email to all selected
  - [ ] Toast showing how many sent

### 3.3 Wire Campaigns Page (3-4 hours)

- [ ] Open `features/newsletter/components/admin/admin-newsletter-campaigns-page.tsx`
  - [ ] Add useCampaigns hook
  - [ ] Display campaigns in table with columns:
    - [ ] Campaign name (searchable)
    - [ ] Status badge (DRAFT / SCHEDULED / SENT / PAUSED)
    - [ ] Recipients count
    - [ ] Open rate %
    - [ ] Click rate %
    - [ ] Sent date
    - [ ] Actions: edit, preview, send/schedule, delete
  - [ ] Add stats cards at top:
    - [ ] Total campaigns
    - [ ] Sent this month
    - [ ] Avg open rate
    - [ ] Avg click rate
  - [ ] Create Campaign button → editor modal
  - [ ] Sort by: name, sent date (desc), open rate (desc)
  - [ ] Filter by: status
  - [ ] Bulk actions: delete, pause, resume

- [ ] Campaign Editor Modal
  - [ ] Name input
  - [ ] Subject line input
  - [ ] Body editor (rich text with markdown)
  - [ ] Preview campaign as email
  - [ ] Recipients selector: all subscribers / specific segments
  - [ ] Schedule: now or scheduled date/time
  - [ ] Send button (with confirmation)
  - [ ] Save as draft button
  - [ ] Cancel button

- [ ] Campaign Preview Modal
  - [ ] Show campaign as email
  - [ ] Show subject, from, to (example)
  - [ ] Full HTML rendering
  - [ ] Unsubscribe link validation
  - [ ] Close button

- [ ] Send Campaign Confirmation Dialog
  - [ ] Show: "Send to X subscribers?"
  - [ ] Show: recipients preview
  - [ ] Confirm/Cancel buttons
  - [ ] Disable send if form invalid

### 3.4 Testing
- [ ] Test workflow: Subscribe → Receive confirmation email → Click link → See as confirmed
- [ ] Test workflow: Create campaign → Send → View campaign stats
- [ ] Test bulk confirmation: Send confirmations to multiple pending subscribers
- [ ] Test export: Download subscriber list as CSV
- [ ] Test validation: Can't send campaign without subject

---

## PHASE 4: Notifications Completion (8-10 hours)

### 4.1 API Endpoints (3-4 hours)

- [ ] Open `app/api/[[...route]]/notifications.ts`

- [ ] Add `POST /templates` endpoint
  - [ ] Validate: name, slug (unique), type, subject, body
  - [ ] Create NotificationTemplate in DB
  - [ ] Return: created template
  - [ ] Require admin role

- [ ] Add `GET /templates/:id` endpoint
  - [ ] Fetch template by ID
  - [ ] Return: template details
  - [ ] Return 404 if not found

- [ ] Add `PATCH /templates/:id` endpoint
  - [ ] Update: name, subject, body, isActive
  - [ ] Validate changes
  - [ ] Return: updated template
  - [ ] Require admin role

- [ ] Add `DELETE /templates/:id` endpoint
  - [ ] Soft delete (set deletedAt) or hard delete
  - [ ] Return: success
  - [ ] Require admin role

- [ ] Add `POST /send-bulk` endpoint
  - [ ] Validate: templateId, recipientIds[], variables (optional)
  - [ ] Fetch template
  - [ ] Send async (don't wait for completion)
  - [ ] Return: { sent: number, failed: number, errors: [] }
  - [ ] Log each send attempt to notification table
  - [ ] Require admin role

### 4.2 Frontend Hooks (2-3 hours)

- [ ] Create `features/notifications/hooks/useNotificationTemplates.ts`
  - [ ] useQuery GET /api/admin/notifications/templates
  - [ ] Return: templates[], isLoading, error

- [ ] Create `features/notifications/hooks/useNotificationTemplate.ts`
  - [ ] useQuery GET /api/admin/notifications/templates/:id
  - [ ] Return: template, isLoading, error

- [ ] Create `features/notifications/hooks/useCreateTemplate.ts`
  - [ ] useMutation POST /api/admin/notifications/templates
  - [ ] Validate with schema
  - [ ] Show toast
  - [ ] Refetch templates list

- [ ] Create `features/notifications/hooks/useUpdateTemplate.ts`
  - [ ] useMutation PATCH /api/admin/notifications/templates/:id
  - [ ] Validate with schema
  - [ ] Show toast
  - [ ] Refetch template detail

- [ ] Create `features/notifications/hooks/useDeleteTemplate.ts`
  - [ ] useMutation DELETE /api/admin/notifications/templates/:id
  - [ ] Confirm before delete
  - [ ] Show toast
  - [ ] Refetch list

- [ ] Create `features/notifications/hooks/useSendNotification.ts`
  - [ ] useMutation POST /api/admin/notifications/send-bulk
  - [ ] Validate: templateId, recipientIds
  - [ ] Show success with count sent
  - [ ] Handle errors

### 4.3 Admin Components (3-4 hours)

- [ ] Modify `features/notifications/components/admin/admin-notifications-page.tsx`
  - [ ] Wire useNotificationTemplates hook
  - [ ] Template table with columns:
    - [ ] Name
    - [ ] Type (email, SMS, push, webhook)
    - [ ] Status (active/inactive badge)
    - [ ] Created date
    - [ ] Actions: edit, test, delete, send
  - [ ] Create Template button → editor
  - [ ] Search templates
  - [ ] Filter by type
  - [ ] Stats: total templates, sent count

- [ ] Create `features/notifications/components/admin/template-editor.tsx`
  - [ ] Modal for create/edit template
  - [ ] Fields:
    - [ ] Name input (required)
    - [ ] Slug input (auto-generated from name)
    - [ ] Type select: email, SMS, push, webhook
    - [ ] Subject input (for email/SMS)
    - [ ] Body textarea with markdown
    - [ ] Variable reference panel (show available vars)
    - [ ] Active/Inactive toggle
  - [ ] Preview as you type (right side)
  - [ ] Test send button (send to self)
  - [ ] Save/Cancel buttons
  - [ ] Validation: all required fields filled

- [ ] Create `features/notifications/components/admin/variable-reference.tsx`
  - [ ] Collapsible panel showing available variables
  - [ ] By template type:
    - [ ] Email: {{userId}}, {{userName}}, {{email}}, {{date}}, {{unsubscribeLink}}
    - [ ] SMS: {{userId}}, {{userName}}, {{code}}
    - [ ] Push: {{userId}}, {{title}}, {{body}}
  - [ ] Copy to clipboard button for each variable

- [ ] Create `features/notifications/components/admin/send-notification-dialog.tsx`
  - [ ] Modal for sending template to users
  - [ ] Select template dropdown (shows variables)
  - [ ] Recipient selector:
    - [ ] All users / All admins
    - [ ] Specific users (search/select)
    - [ ] By role (ADMIN, USER, GUEST)
  - [ ] Variable input fields (for custom values)
  - [ ] Preview generated message
  - [ ] Send/Cancel buttons
  - [ ] Show progress: "Sending to X users..."

### 4.4 Validation & Testing
- [ ] Validate template on save
- [ ] Test create template → edit → send workflow
- [ ] Test variables in preview
- [ ] Test bulk send
- [ ] Test error handling (missing required fields)

---

## PHASE 5: Error Handling & Flow Improvements (4-6 hours)

### 5.1 Error Boundaries (1-2 hours)

- [ ] Create `components/ui/error-boundary.tsx`
  - [ ] Catch React errors
  - [ ] Show friendly error message
  - [ ] Show retry button
  - [ ] Log to Sentry/analytics

- [ ] Wrap admin pages in error boundary
  - [ ] admin-forms-page.tsx
  - [ ] admin-subscribers-page.tsx
  - [ ] admin-newsletter-campaigns-page.tsx
  - [ ] admin-notifications-page.tsx

### 5.2 Loading Skeletons (1-2 hours)

- [ ] Create `components/ui/skeleton-loader.tsx` (generic)

- [ ] Create `components/ui/table-skeleton.tsx`
  - [ ] Render fake table rows
  - [ ] Pulsing animation
  - [ ] Use in all data tables

- [ ] Create `components/ui/form-skeleton.tsx`
  - [ ] Render fake form fields
  - [ ] Use during form loads

- [ ] Apply to all hooks
  - [ ] useFormsList: show table skeleton
  - [ ] useSubscribers: show table skeleton
  - [ ] useCampaigns: show table skeleton
  - [ ] useNotificationTemplates: show table skeleton

### 5.3 Validation & Submit Prevention (1-2 hours)

- [ ] Form submission validation
  - [ ] Client-side: validate before submit
  - [ ] Server-side: validate in API
  - [ ] Show field-level error messages

- [ ] Prevent double-submit
  - [ ] Disable submit button while pending
  - [ ] Show loading spinner in button
  - [ ] Prevent form submission while loading

- [ ] Real-time validation feedback
  - [ ] Email field: validate email format
  - [ ] Required fields: show red * and error
  - [ ] URL fields: validate URL format

### 5.4 Toast Notifications (1 hour)

- [ ] Success toasts
  - [ ] Form created: "Form created successfully"
  - [ ] Form updated: "Changes saved"
  - [ ] Campaign sent: "Campaign sent to X subscribers"

- [ ] Error toasts
  - [ ] Show API error message
  - [ ] Show validation errors
  - [ ] Show network errors

- [ ] Use `toast` from `sonner` library

### 5.5 Network Error Handling (1 hour)

- [ ] Handle API timeouts gracefully
- [ ] Show retry button on error
- [ ] Detect offline status
- [ ] Show "You're offline" message
- [ ] Queue actions when offline, retry when online

---

## PHASE 6: Testing & Quality Assurance (3-4 hours)

### 6.1 End-to-End Test Workflows (2 hours)

- [ ] **Forms Workflow**
  - [ ] Login to admin
  - [ ] Create new form with 5 fields
  - [ ] Edit form name
  - [ ] Preview form
  - [ ] Submit form as public user
  - [ ] View submission in admin
  - [ ] Export submissions CSV
  - [ ] Delete form
  - [ ] Verify form no longer accessible

- [ ] **Newsletter Workflow**
  - [ ] Subscribe with email
  - [ ] Check for confirmation email
  - [ ] Click confirmation link
  - [ ] Verify status changes to CONFIRMED
  - [ ] Create campaign
  - [ ] Send campaign to all subscribers
  - [ ] Verify email received
  - [ ] Click unsubscribe link
  - [ ] Verify unsubscribed

- [ ] **Notifications Workflow**
  - [ ] Login to admin
  - [ ] Create notification template
  - [ ] Add variables to template
  - [ ] Send test notification to self
  - [ ] Verify notification received
  - [ ] Send bulk to multiple users
  - [ ] View notification history
  - [ ] Delete template

- [ ] **Security Workflow**
  - [ ] Check blocked IPs page
  - [ ] Block new IP
  - [ ] Try request from blocked IP (verify 403)
  - [ ] View security events
  - [ ] View rate limit config

### 6.2 Edge Cases & Error Scenarios (1 hour)

- [ ] Empty states
  - [ ] No forms → show empty state with create button
  - [ ] No submissions → show "No submissions" message
  - [ ] No subscribers → show "No subscribers" message

- [ ] Long names
  - [ ] Form with 200 char name → truncate in table
  - [ ] Field with long label → wrap properly

- [ ] Special characters
  - [ ] Form with émojis in name
  - [ ] Submission with HTML/JS in text fields
  - [ ] Unicode in email subjects

- [ ] Concurrent actions
  - [ ] Delete form while submitting data
  - [ ] Edit template while sending notification
  - [ ] Delete subscriber while sending campaign

- [ ] Rate limiting
  - [ ] Make 150 requests in 1 minute
  - [ ] Verify 429 returned after limit
  - [ ] Verify admin requests not rate limited

### 6.3 Performance Testing (1 hour)

- [ ] Load times
  - [ ] Admin forms page with 100 forms: < 2s
  - [ ] Submissions table with 500 items: < 2s
  - [ ] Campaign creation: < 1s

- [ ] Pagination
  - [ ] Load more works with 50+ items
  - [ ] Infinite scroll loads new items
  - [ ] Search filters quickly

- [ ] API response times
  - [ ] GET /api/admin/forms: < 500ms
  - [ ] POST /api/admin/forms: < 500ms
  - [ ] GET /api/admin/newsletter/stats: < 300ms

- [ ] Memory usage
  - [ ] Open admin pages for 5 minutes
  - [ ] Verify no memory leaks
  - [ ] Monitor browser DevTools

### 6.4 Regression Testing (0.5 hour)

- [ ] Run existing test suite
  - [ ] `npm test` or `npx vitest run`
  - [ ] All Phase 6 notification tests still pass ✅
  - [ ] No new TypeScript errors
  - [ ] No new lint warnings

- [ ] Check build
  - [ ] `npm run build` succeeds
  - [ ] No unused imports
  - [ ] No console warnings

---

## Quality Gates - MVP Ready ✅

### Before Launch Checklist
- [ ] All Phase 1-4 features implemented
- [ ] All tests passing (Phase 6 notification tests + new tests)
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] No 500 errors in logs
- [ ] Email service working (confirmation + campaigns)
- [ ] Rate limiting not blocking legitimate requests
- [ ] All admin pages load in < 3 seconds
- [ ] Forms can be created/submitted/viewed
- [ ] Newsletter can be sent to subscribers
- [ ] Notifications can be sent to users
- [ ] Security features working (block IP, view events)

## Audit Updates (2026-04-10)

- [x] Stabilize DB timeout handling with circuit breaker + safe fallback on public/admin critical read paths
- [x] Ensure admin resources View/Edit preserve locale (`en`/`my`) and type context
- [x] Ensure public template rendering uses selected `pageTemplate` relation for post/news/page
- [x] Add admin resources sorting controls (ASC/DESC + sort field) and wire backend query ordering
- [ ] Implement full dynamic template HTML/CSS renderer in public page/post/news routes (currently mapped aliases)

### Known Issues to Track
- [ ] (None yet - will be filled during development)

---

## Quick Reference: Files Created/Modified

### Files to CREATE (23 new files)
```
lib/email/
  ├── email-service.ts (NEW)
  └── templates.ts (NEW)

features/forms/
  ├── types.ts (NEW)
  ├── schemas/
  │   └── form.schema.ts (NEW)
  ├── api/
  │   └── index.ts (NEW)
  └── hooks/
      ├── useFormsList.ts (NEW)
      ├── useFormDetail.ts (NEW)
      ├── useCreateForm.ts (NEW)
      ├── useUpdateForm.ts (NEW)
      ├── useDeleteForm.ts (NEW)
      ├── useFormSubmissions.ts (NEW)
      └── useSubmitForm.ts (NEW)
  └── components/admin/
      ├── admin-forms-page.tsx (NEW)
      ├── form-editor-dialog.tsx (NEW)
      ├── form-field-editor.tsx (NEW)
      ├── form-preview.tsx (NEW)
      ├── submissions-viewer.tsx (NEW)
      └── submission-detail-modal.tsx (NEW)

features/newsletter/hooks/
  ├── useNewsletterStats.ts (NEW)
  └── useCampaignEditor.ts (NEW)

features/notifications/hooks/
  ├── useNotificationTemplates.ts (NEW)
  ├── useNotificationTemplate.ts (NEW)
  ├── useCreateTemplate.ts (NEW)
  ├── useUpdateTemplate.ts (NEW)
  ├── useDeleteTemplate.ts (NEW)
  ├── useSendNotification.ts (NEW)
  └── useNotificationStats.ts (NEW)

features/notifications/components/admin/
  ├── template-editor.tsx (NEW)
  ├── variable-reference.tsx (NEW)
  └── send-notification-dialog.tsx (NEW)

components/ui/
  ├── error-boundary.tsx (NEW)
  ├── skeleton-loader.tsx (NEW)
  └── table-skeleton.tsx (NEW)
```

### Files to MODIFY (6 files)
```
features/newsletter/server/router.ts (Lines 66, 343)
features/newsletter/components/admin/admin-subscribers-page.tsx (Wire hooks)
features/newsletter/components/admin/admin-newsletter-campaigns-page.tsx (Wire hooks)
features/notifications/components/admin/admin-notifications-page.tsx (Wire hooks)
app/api/[[...route]]/notifications.ts (Add 5 endpoints)
.env.local (Add email service keys)
```

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Forms feature complete | 100% | 32% |
| Newsletter sending | 100% | 75% |
| Notifications feature | 100% | 55% |
| All tests passing | 100% | 95% |
| TypeScript errors | 0 | ~5 |
| Page load time (admin) | < 3s | 2-3s ✅ |
| API response time | < 500ms | 300-1000ms |
| Email delivery rate | > 95% | TBD |
| Form submission success | > 99% | TBD |

