'use client'

import type { ReactNode } from 'react'
import React, { useMemo } from 'react'
import { createRenderedTemplate } from '@/lib/templates/render'
import type { PageTemplate as PageTemplateType } from '@/features/templates/types'

interface TemplateRendererProps {
  /**
   * The template configuration
   */
  template: PageTemplateType

  /**
   * Content to render in the main content slot
   */
  content: string

  /**
   * Optional content for sidebar slot
   */
  sidebar?: string

  /**
   * Optional content for hero slot
   */
  hero?: string

  /**
   * Additional slot content
   */
  additionalSlots?: Record<string, string>

  /**
   * Optional CSS class to apply to template root
   */
  className?: string
}

/**
 * TemplateRenderer
 * Renders a page template with dynamic content substitution
 *
 * Features:
 * - Slot variable substitution {{ variableName }}
 * - CSS scoping to prevent style conflicts
 * - Inline style injection for template-specific CSS
 * - Fallback to default layout if template is missing
 *
 * @component
 * @example
 * ```tsx
 * <TemplateRenderer
 *   template={template}
 *   content={postContent}
 *   sidebar={sidebarContent}
 * />
 * ```
 */
export function TemplateRenderer({
  template,
  content,
  sidebar,
  hero,
  className,
  additionalSlots,
}: TemplateRendererProps) {
  // Memoize the rendered template to avoid unnecessary recalculations
  const { html, css } = useMemo(() => {
    const context = {
      content,
      sidebar,
      hero,
      ...Object.entries(additionalSlots ?? {})
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value
            return acc
          },
          {} as Record<string, string>
        ),
    }

    return createRenderedTemplate(template.htmlTemplate, template.cssTemplate, context, template.id)
  }, [template, content, sidebar, hero, additionalSlots])

  return (
    <>
      {/* Inject scoped CSS if template has styles */}
      {css && (
        <style
          dangerouslySetInnerHTML={{ __html: css }}
          suppressHydrationWarning
        />
      )}

      {/* Render template HTML with scoped class */}
      <div
        className={className}
        data-template={template.slug}
        data-template-id={template.id}
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
    </>
  )
}

interface TemplateRendererWithFallbackProps extends Omit<TemplateRendererProps, 'template'> {
  /**
   * Fallback content to render if template is not found
   */
  fallback?: ReactNode

  template?: PageTemplateType | null
}

/**
 * TemplateRendererWithFallback
 * Renders a template with fallback to default content if template is null
 * Useful when template selection is optional
 *
 * @component
 */
export function TemplateRendererWithFallback({
  template,
  fallback,
  ...props
}: TemplateRendererWithFallbackProps) {
  if (!template) {
    return (
      <div className={props.className} data-template="default">
        {fallback || props.content}
      </div>
    )
  }

  return <TemplateRenderer template={template} {...props} />
}
