/**
 * Template Rendering Logic
 * Handles rendering page templates with slot substitution and CSS scoping
 */

import type { TemplateRenderContext } from '@/features/templates/types'

/**
 * Renders a template by substituting slot variables with provided content
 * Supports {{ variableName }} syntax for slot substitution
 *
 * @param htmlTemplate - The HTML template with slot placeholders
 * @param context - The content to substitute into slots
 * @returns Rendered HTML with slots replaced
 */
export function renderTemplate(htmlTemplate: string, context: TemplateRenderContext): string {
  let rendered = htmlTemplate

  // Replace slot variables: {{ content }}, {{ sidebar }}, etc.
  Object.entries(context).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      rendered = rendered.replace(pattern, value)
    }
  })

  // Remove any unreplaced slot variables (cleanup)
  rendered = rendered.replace(/{{[\s\w]+}}/g, '')

  return rendered
}

/**
 * Extracts slot names from a template string
 * Returns all slot variable names found in {{ }} format
 *
 * @param htmlTemplate - The HTML template to scan
 * @returns Array of slot names
 */
export function extractSlots(htmlTemplate: string): string[] {
  const slots = new Set<string>()
  const pattern = /{{[\s]*([\w]+)[\s]*}}/g

  let match
  while ((match = pattern.exec(htmlTemplate)) !== null) {
    slots.add(match[1])
  }

  return Array.from(slots)
}

/**
 * Scopes CSS to prevent conflicts with other styles
 * Wraps CSS rules in a scoped container class
 *
 * @param cssTemplate - The CSS template to scope
 * @param scopeClass - The class name to scope under (e.g., 'template-abc123')
 * @returns Scoped CSS
 */
export function scopeCss(cssTemplate: string, scopeClass: string): string {
  // Wrap all selectors in the scope class
  // This prevents template styles from affecting the rest of the page
  const scoped = cssTemplate
    .split('\n')
    .map((line) => {
      // Skip @import, @media, @keyframes and other @ rules
      if (line.trim().startsWith('@')) {
        return line
      }
      // Skip empty lines and closing braces
      if (!line.trim() || line.trim() === '}') {
        return line
      }
      // Skip lines that are just opening braces
      if (line.trim() === '{') {
        return line
      }
      // For selector lines (contain { usually), prepend scope class
      if (line.includes('{')) {
        return line.replace(/^([^{]+)/, `.${scopeClass} $1`)
      }
      return line
    })
    .join('\n')

  return scoped
}

/**
 * Validates that all required slots in a template have content
 *
 * @param requiredSlots - Array of required slot names
 * @param context - The content context
 * @returns Array of missing slot names, empty if all satisfied
 */
export function validateSlots(requiredSlots: string[], context: TemplateRenderContext): string[] {
  return requiredSlots.filter((slot) => !context[slot])
}

/**
 * Creates a rendered template with scoped styles
 * Combines HTML rendering and CSS scoping in one operation
 *
 * @param htmlTemplate - The HTML template
 * @param cssTemplate - Optional CSS template
 * @param context - The content context
 * @param templateId - The template ID for scope class generation
 * @returns Object with rendered HTML, CSS, and scope class
 */
export function createRenderedTemplate(
  htmlTemplate: string,
  cssTemplate: string | null | undefined,
  context: TemplateRenderContext,
  templateId: string
) {
  const scopeClass = `tpl-${templateId.slice(0, 8)}`
  const html = renderTemplate(htmlTemplate, context)
  const css = cssTemplate ? scopeCss(cssTemplate, scopeClass) : ''

  return {
    html,
    css,
    scopeClass,
  }
}
