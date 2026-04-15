/**
 * Template Types & Interfaces
 * Defines the shape of page templates and related configurations
 */

/**
 * Page template configuration
 * Represents a layout template with HTML structure, CSS styling, and slot definitions
 */
export interface PageTemplate {
  id: string
  name: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  htmlTemplate: string
  cssTemplate?: string | null
  slots: string[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Template slot metadata
 * Describes a content placeholder within a template
 */
export interface TemplateSlot {
  name: string
  label: string
  type: 'content' | 'sidebar' | 'hero' | 'custom'
  required: boolean
  defaultContent?: string
}

/**
 * Template rendering context
 * Data passed to template during rendering
 */
export interface TemplateRenderContext {
  content: string
  sidebar?: string
  hero?: string
  [key: string]: string | undefined
}

/**
 * Template selector options
 * Configuration for displaying template selection UI
 */
export interface TemplateSelectorOptions {
  featured?: boolean
  limit?: number
  postType?: 'POST' | 'PAGE' | 'NEWS'
}

/**
 * Built-in template definitions
 * Describes the shape of a template seed
 */
export interface TemplateDefinition {
  name: string
  slug: string
  description: string
  thumbnail?: string
  htmlTemplate: string
  cssTemplate?: string
  slots: string[]
  featured?: boolean
}
