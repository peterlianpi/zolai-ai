# Zolai AI - Comprehensive Frontend Redesign Roadmap

**Objective:** Transform the application from a basic CMS into a fully-featured, flexible content management and presentation platform with rich editing, dynamic templates, configurable layouts, and professional UI design.

**Timeline:** 7 phases, estimated 40-60 dev hours

---

## PHASE 1: Rich Text Editor Enhancement (6-8 hours)

### Goal
Upgrade TipTap rich text editor with better UX, styling options, and consistent integration across all content types.

### Tasks

#### 1.1 Enhance RichTextEditor Component
- **Current:** Basic TipTap toolbar with image, link, table support
- **Improvements:**
  - Add color picker (text color, background color)
  - Add font size selector (small, normal, large, h1-h6)
  - Add text alignment (left, center, right, justify)
  - Add indent/outdent for lists
  - Add code block with syntax highlighting
  - Add blockquote with styling
  - Add callout/admonition blocks (info, warning, danger, success)
  - Improve toolbar organization (group related buttons, add separators)
  - Add preview mode (live preview of formatted content)
  - Save draft indicator

**Files to update:**
- `features/content/components/RichTextEditor.tsx` (expand from ~200 to ~400 lines)
- Create `features/content/components/RichTextEditorToolbar.tsx` (new, ~150 lines)
- Create `features/content/components/RichTextEditorPreview.tsx` (new, ~80 lines)

#### 1.2 Improve Editor Styling
- Add editor container styling with better borders, shadows
- Improve placeholder text visibility
- Add focus states with visual feedback
- Ensure dark mode compatibility
- Add character/word count indicator
- Add reading time estimate

**Files to update:**
- `app/globals.css` - Add editor-specific Tailwind classes
- `features/content/components/RichTextEditor.tsx` - Enhanced styling

#### 1.3 Add Editor to All Content Types
- **Posts & Pages:** Already using ContentEditor ✅
- **Comments:** Add rich text option (toggle between plain text and rich)
- **Form Submissions:** Add text area with basic formatting

**New files:**
- `features/comments/components/CommentEditor.tsx` (150 lines, uses RichTextEditor)
- Update `features/comments/components/comment-form.tsx` to use CommentEditor

#### 1.4 Content Sanitization & Safety
- Ensure all rich text output is sanitized with DOMPurify
- Validate no XSS vectors in rich content
- Test with malicious HTML input

**Files to verify/update:**
- `lib/seo/sanitize.ts` - Ensure DOMPurify is properly configured
- All content display components use `sanitizeContentHtml()`

---

## PHASE 2: Header/Footer/Hero Refactoring (8-10 hours)

### Goal
Make header, footer, and hero sections fully dynamic and configurable from admin without code changes.

### 2.1 Hero Component Overhaul
**Current:** Static hero with title, breadcrumbs
**Target:** Multiple hero styles + admin settings

#### Hero Style Options:
1. **Simple** - Title + breadcrumbs (current)
2. **With Background** - Title + breadcrumbs + background image/color
3. **With Subtitle** - Title + subtitle + breadcrumbs
4. **Full Screen** - Large hero section with CTA button
5. **Minimal** - Just title, no breadcrumbs

**New Database Settings (in SiteSetting):**
```
hero_default_style: "simple"         # Default style for pages
hero_default_background: ""          # URL or color
hero_show_breadcrumbs: "true"
hero_background_overlay: "0.3"       # Opacity
hero_alignment: "left"               # left, center, right
```

**New files:**
- `features/home/components/HeroBuilder.tsx` (200 lines, handles hero rendering)
- `features/home/components/hero/HeroSimple.tsx` (80 lines)
- `features/home/components/hero/HeroWithBackground.tsx` (120 lines)
- `features/home/components/hero/HeroFullScreen.tsx` (150 lines)
- `features/home/components/hero/HeroMinimal.tsx` (60 lines)
- Create `features/home/types/hero.ts` with HeroConfig interface

**Files to update:**
- `app/(public)/layout.tsx` - Pass hero config from siteSettings
- All page components - Use HeroBuilder instead of static Hero

#### 2.2 Header Customization
**Current:** Static header with logo, menu, theme toggle
**Target:** Configurable header with sticky/transparent options, logo styles

**New Database Settings:**
```
header_style: "default"              # default, minimal, centered
header_sticky: "true"
header_transparent_scroll: "true"
header_logo_size: "medium"           # small, medium, large
header_show_search: "true"
```

**Updates:**
- Refactor Header component to read settings dynamically
- Add header style variants
- Add search bar toggle
- Add mobile menu animation options

**Files to update:**
- `features/home/components/Header.tsx` - Use dynamic settings
- Add responsive logo sizing
- Improve mobile menu UX

#### 2.3 Footer Customization
**Current:** Static footer with menus and copyright
**Target:** Multiple footer sections, configurable columns

**New Database Settings:**
```
footer_style: "standard"             # standard, minimal, compact
footer_show_newsletter: "true"
footer_show_social: "true"
footer_copyright_text: "© 2024 Zolai AI"
footer_columns: "3"                  # Number of columns
```

**Updates:**
- Add footer layout variants
- Add newsletter signup section
- Add social links section
- Improve column organization on different screen sizes
- Add footer menus support

**Files to update:**
- `features/home/components/Footer.tsx` - Enhanced styling and sections
- Update menu system to support multiple footer menu locations

#### 2.4 Breadcrumb Component
- Improve breadcrumb styling
- Add breadcrumb customization options
- Ensure proper schema markup

---

## PHASE 3: Page Templates & Layout System (10-12 hours)

### Goal
Expand from 5 hardcoded templates to flexible, reusable layout system with visual admin interface.

### 3.1 Template Database Schema
**Current:** Enum (default, full-width, sidebar, centered, blank)
**Target:** Database-driven templates with custom CSS/HTML

**New database table:**
```sql
CREATE TABLE PageTemplate (
  id                STRING @id @default(cuid())
  name              STRING @unique
  slug              STRING @unique
  description       STRING?
  thumbnail        STRING?  -- preview image
  htmlTemplate     STRING   -- base HTML with slots
  cssTemplate      STRING?  -- custom styles
  slots            JSON     -- [ "content", "sidebar", "hero" ]
  featured         BOOLEAN  @default(false)
  createdAt        DateTime
  updatedAt        DateTime
)
```

**New files:**
- `prisma/schema.prisma` - Add PageTemplate model
- `features/templates/types/index.ts` - TemplateConfig interface
- `features/templates/components/TemplateSelector.tsx` (100 lines, admin)
- `features/templates/components/TemplateRenderer.tsx` (150 lines, display)
- `features/templates/components/TemplateEditor.tsx` (300 lines, admin editor)

### 3.2 Create Built-in Templates
Create 5+ professional templates as database seeds:

1. **Standard (2-column)** - Content + sidebar
2. **Full Width** - Single column, max-width
3. **Centered** - Narrow centered column
4. **Magazine** - Hero + featured image + content
5. **Minimal** - No styling, raw content
6. **Blog** - Large hero + content + sidebar
7. **Landing** - Hero + features + CTA

**Files:**
- `prisma/seed.ts` - Add template seeds (~200 lines)

### 3.3 Update Post/Page Schema
**Current:** Post.template (enum)
**New:** Post.templateId (FK to PageTemplate)

**Migration:**
```
bunx prisma migrate dev --name add-page-template-table
bunx prisma db seed  # Seed templates
```

**Files:**
- `prisma/schema.prisma` - Update Post model
- `features/content/components/ContentEditor.tsx` - Update template selector to use database

### 3.4 Template Rendering
- Create TemplateRenderer component that applies stored template
- Support template variable substitution {{ content }}, {{ sidebar }}
- Add inline CSS support (scoped to prevent conflicts)
- Handle fallback if template not found

**Files:**
- `features/templates/components/TemplateRenderer.tsx` (150 lines)
- `lib/templates/render.ts` (100 lines) - Template rendering logic

### 3.5 Admin Template Builder
**Don't build a visual editor yet** - keep it simple for Phase 1:
- Show list of templates
- Allow editing template name, description
- Allow editing HTML/CSS (textarea for now)
- Template preview
- Duplicate template
- Delete template

**Files:**
- `app/(protected)/admin/templates/page.tsx` (15 lines)
- `features/templates/components/admin/AdminTemplatesPage.tsx` (200 lines)
- `features/templates/components/admin/AdminTemplateEditor.tsx` (250 lines)

---

## PHASE 4: Dynamic Menu System Enhancement (8-10 hours)

### Goal
Improve menu builder with better UX, support for custom menu locations, and menu-specific features.

### 4.1 Menu Locations Configuration
**New Database Settings:**
```
menu_locations: JSON  # { "header": "Header Menu", "footer": "Footer Menu", "sidebar": "Sidebar Menu" }
```

**Current:** Supports `location` on Menu model
**New:** Allow admins to define custom menu locations

### 4.2 Improve Menu Admin Interface
**Current:** AdminMenuManager exists but needs UX improvements

**Improvements:**
- Drag-drop reordering (use react-beautiful-dnd or similar)
- Bulk operations (delete multiple items)
- Search/filter menu items
- Menu preview on the side
- Custom class helper with presets
- Target attribute options (self, blank, parent)
- Icon picker for menu items
- Badge/label support for menu items

**Files:**
- Update `features/menus/components/admin/admin-menu-manager.tsx`
- Add drag-drop library: `npm install react-beautiful-dnd @types/react-beautiful-dnd`

### 4.3 Menu Display Options
**New settings:**
```
menu_style: "horizontal"  # horizontal, vertical, dropdown
menu_animation: "fade"    # fade, slide, none
menu_mobile_style: "hamburger"  # hamburger, accordion
```

### 4.4 Add Menu Location Support
Currently only header/footer used. Support sidebar and custom locations:

**Files to update:**
- `features/home/components/Header.tsx` - Use header menu
- `features/home/components/Footer.tsx` - Use footer menu
- `features/home/components/Sidebar.tsx` - Use sidebar menu (if created)

---

## PHASE 5: Admin Site Settings Page (6-8 hours)

### Goal
Create comprehensive admin UI for managing all site configuration (Phase 2's work made visible).

### 5.1 Admin Site Settings Page
**Location:** `/app/(protected)/admin/site-settings/page.tsx`

**Current:** Redirects to `/admin/settings`
**New:** Dedicated site settings page with tabs

**Tabs:**
1. **General** - Site name, URL, description, timezone
2. **Appearance** - Logo, favicon, colors, theme
3. **Header/Footer/Hero** - Appearance settings for these components
4. **Social** - Social media handles, links
5. **SEO** - Default title, description, robots, canonical
6. **Analytics** - Google Analytics ID, Facebook Pixel
7. **Media** - Max upload size, allowed file types
8. **Features** - Feature flags (comments, forms, etc.)
9. **Advanced** - Developer settings, API keys

**New files:**
- `app/(protected)/admin/site-settings/page.tsx` (20 lines)
- `features/site-settings/components/AdminSiteSettingsPage.tsx` (200 lines)
- `features/site-settings/components/AdminSiteSettingsForm.tsx` (500+ lines)
- `features/site-settings/components/tabs/*` - Organized by section

### 5.2 Settings Form Component
- Use React Hook Form + Zod
- Section-based layout with Cards
- Live preview where applicable (logo, colors)
- Reset to defaults option
- Import/export settings as JSON
- Save draft indicator
- Validation with helpful error messages

### 5.3 API Endpoints
**Already exist in `features/settings/server/admin-router.ts`:**
- GET /admin/site-settings - List all settings
- PUT /admin/site-settings - Update single setting

**Update:** Add batch update endpoint
- PUT /admin/site-settings/batch - Update multiple settings at once

**Files:**
- Update `features/settings/server/admin-router.ts` (add batch endpoint)

---

## PHASE 6: Content Display & Rendering (10-12 hours)

### Goal
Update all pages to use new templates, styling, and ensure responsive design across all breakpoints.

### 6.1 Post Display Page
**File:** `/app/(public)/posts/[slug]/page.tsx`

**Updates:**
- Use new TemplateRenderer based on post.templateId
- Apply hero settings from site config
- Improve reading experience with better typography
- Add table of contents only for sidebar layout
- Improve featured image responsiveness
- Better author bio section
- Related posts styling

### 6.2 Page Display Page
**File:** `/app/(public)/pages/[slug]/page.tsx`

**Updates:**
- Same as posts but without comments
- Better hierarchy for page structures (parent pages)
- Breadcrumb navigation

### 6.3 Home Page
**File:** `/app/(public)/page.tsx`

**Updates:**
- Use hero settings from config
- Organize sections (carousel, featured, trending)
- Better responsive grid layout
- Improve category/tag sections
- Add newsletter signup

### 6.4 Responsive Design Audit
Review and improve all breakpoints:
- **Mobile** (sm: 640px) - Single column, larger touch targets
- **Tablet** (md: 768px) - Two columns, improved spacing
- **Desktop** (lg: 1024px) - Full layout with sidebars
- **Large** (xl: 1280px+) - Optimal width constraints

**Update:**
- Check all components for responsive issues
- Test on real devices
- Fix margin/padding inconsistencies

### 6.5 Improve Typography System
**Update:** `app/globals.css`
- Better heading hierarchy (h1-h6)
- Improved line heights for readability
- Better code block styling
- Consistent link styling
- List and table improvements

---

## PHASE 7: UI/Design Overhaul (8-10 hours)

### Goal
Create consistent design system, improve accessibility, and polish overall UX.

### 7.1 Design System Documentation
**Create:** `docs/DESIGN_SYSTEM.md`

Document:
- Color palette (OKLch variables)
- Typography scale
- Spacing system
- Component patterns
- Accessibility guidelines

### 7.2 Component Improvements
**Review and enhance:**
- Button variants and states
- Card and container styling
- Form inputs (better focus states, labels)
- Modals and dialogs (better accessibility)
- Navigation patterns
- Loading states and skeletons
- Error states and messages
- Success/info/warning/danger toasts

**Update:**
- `components/ui/*` - Enhance shadcn components
- Add missing state indicators
- Improve keyboard navigation

### 7.3 Dark Mode Consistency
- Audit all components for dark mode
- Ensure sufficient contrast (WCAG AA minimum)
- Test with tools like Axe DevTools
- Improve dark mode color transitions

**Files:**
- `app/globals.css` - Review dark mode variables
- Test with dark mode enabled

### 7.4 Accessibility Improvements (A11y)
- Add ARIA labels to interactive elements
- Improve keyboard navigation
- Add skip-to-content links
- Ensure form labels properly associated
- Add alt text for all images
- Test with screen readers (NVDA, JAWS)

**Tools:**
- axe DevTools extension
- WebAIM contrast checker
- WAVE browser extension

### 7.5 Performance Optimization
- Image optimization (next/image)
- Font loading optimization
- CSS optimization
- JavaScript code splitting
- Lazy load components
- Monitor Core Web Vitals

**Files:**
- `app/layout.tsx` - Review font loading
- Review image components - ensure next/image usage
- Update `next.config.ts` if needed

### 7.6 Brand/Visual Polish
- Update or refine logo appearance
- Ensure consistent icon usage (lucide-react)
- Add subtle animations where appropriate
- Improve borders and shadows
- Add hover/active states to all interactive elements

---

## Implementation Strategy

### Recommended Execution Order:
1. **PHASE 1** (Week 1) - Rich text editor is foundational
2. **PHASE 2** (Week 1-2) - Header/footer/hero unblocks pages
3. **PHASE 3** (Week 2) - Templates support all layouts
4. **PHASE 4** (Week 2-3) - Menus complete navigation
5. **PHASE 5** (Week 3) - Admin UI makes all config accessible
6. **PHASE 6** (Week 3-4) - Display pages use everything
7. **PHASE 7** (Week 4) - Polish and refinement

### Development Best Practices:
- ✅ Create feature branches (feature/phase-n-description)
- ✅ Write TypeScript strictly (no `any` types)
- ✅ Use Zod for all validation
- ✅ Test on mobile AND desktop
- ✅ Test dark mode
- ✅ Commit frequently with clear messages
- ✅ Run `bun run lint` and `bun run build` before committing
- ✅ Use React Server Components by default

### Testing Checklist for Each Phase:
- [ ] Component renders correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode works
- [ ] Keyboard accessible
- [ ] No console errors/warnings
- [ ] TypeScript strict mode passes
- [ ] Build succeeds (`bun run build`)
- [ ] Lint passes (`bun run lint`)

---

## Deliverables Summary

### By End of Phase 1:
- Enhanced RichTextEditor with color, sizing, alignment
- Comments can use rich text
- Better editor UX and styling

### By End of Phase 2:
- Dynamic header/footer/hero fully configurable from admin
- 5+ hero style options
- Settings stored in database, not hardcoded

### By End of Phase 3:
- Flexible template system with database support
- 7+ built-in templates
- Admin template editor
- Posts can use any template

### By End of Phase 4:
- Improved menu admin with drag-drop
- Support multiple menu locations
- Better menu styling options

### By End of Phase 5:
- Comprehensive site settings admin page
- All configuration visible and editable from UI
- No hardcoded values in code

### By End of Phase 6:
- All pages use new templates and styling
- Responsive design across all breakpoints
- Consistent content display experience

### By End of Phase 7:
- Accessible, beautiful UI
- Consistent design system
- Professional appearance across the entire application

---

## Success Metrics

- ✅ 0 TypeScript errors
- ✅ 100% of pages responsive
- ✅ WCAG AA accessibility compliance
- ✅ 0 hardcoded UI text (all from database/constants)
- ✅ All settings configurable from admin
- ✅ All pages use template system
- ✅ Rich text editor in all content types
- ✅ Performance: Lighthouse score >90 (desktop, mobile)
