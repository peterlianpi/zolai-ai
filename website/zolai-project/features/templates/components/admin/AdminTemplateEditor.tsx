'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { client } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PageTemplate } from '@/features/templates/types'
import { Loader2 } from 'lucide-react'

/**
 * Validation schema for template form
 */
const templateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  htmlTemplate: z.string().min(1, 'HTML template is required'),
  cssTemplate: z.string().optional(),
  featured: z.boolean(),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

interface AdminTemplateEditorProps {
  /**
   * Template to edit, or null for creating new
   */
  template: PageTemplate | null

  /**
   * Called after successful save
   */
  onSave?: () => void

  /**
   * Called when user cancels editing
   */
  onCancel?: () => void
}

/**
 * AdminTemplateEditor
 * Form component for creating and editing page templates
 *
 * Features:
 * - Edit template metadata (name, slug, description)
 * - Edit HTML template with slot variable help
 * - Edit optional CSS for styling
 * - Preview of slot variables
 * - Form validation
 *
 * @component
 */
export function AdminTemplateEditor({
  template,
  onSave,
  onCancel,
}: AdminTemplateEditorProps) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: template
      ? {
          name: template.name,
          slug: template.slug,
          description: template.description || '',
          thumbnail: template.thumbnail || '',
          htmlTemplate: template.htmlTemplate,
          cssTemplate: template.cssTemplate || '',
          featured: template.featured,
        }
      : {
          name: '',
          slug: '',
          description: '',
          thumbnail: '',
          htmlTemplate: '{{ content }}',
          cssTemplate: '',
          featured: false,
        },
  })

  const submitMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      const res = template
        ? await client.api.templates[':id'].$patch({
            param: { id: template.id },
            json: {
              ...data,
              slots: extractSlots(data.htmlTemplate),
            },
          })
        : await client.api.templates.$post({
            json: {
              ...data,
              slots: extractSlots(data.htmlTemplate),
            },
          })

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } }
        throw new Error(json.error?.message || `Failed to ${template ? 'update' : 'create'} template`)
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success(`Template ${template ? 'updated' : 'created'} successfully`)
      onSave?.()
    },
    onError: (err) => {
      toast.error((err as Error).message)
    },
  })

  const onSubmit = async (data: TemplateFormValues) => {
    await submitMutation.mutateAsync(data)
  }

  // Extract slot names from HTML template
  const htmlTemplate = useWatch({
    control: form.control,
    name: 'htmlTemplate',
  })
  const slots = extractSlots(htmlTemplate || '')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blog Post with Sidebar" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., blog-post-sidebar" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier (lowercase with hyphens)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of what this template is for"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help users understand when to use this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Featured Template</FormLabel>
                    <FormDescription>
                      Show this template prominently in selection menus
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          {/* HTML Tab */}
          <TabsContent value="html" className="space-y-4">
            <FormField
              control={form.control}
              name="htmlTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTML Template</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="<article>{{ content }}</article>"
                      className="min-h-64 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use double-brace syntax for slots: {'{{ content }}, {{ sidebar }}, {{ hero }}'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detected Slots */}
            {slots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detected Slots</CardTitle>
                  <CardDescription>
                    Slots that will be available for content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <span
                        key={slot}
                        className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* HTML Template Help */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Template Variables</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{'{{ content }}'}</code>
                  <p className="text-muted-foreground mt-1">Main post/page content</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{'{{ sidebar }}'}</code>
                  <p className="text-muted-foreground mt-1">Optional sidebar content</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{'{{ hero }}'}</code>
                  <p className="text-muted-foreground mt-1">Optional hero section</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CSS Tab */}
          <TabsContent value="css" className="space-y-4">
            <FormField
              control={form.control}
              name="cssTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSS Styles (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=".article-main { max-width: 800px; }"
                      className="min-h-64 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    CSS rules to style this template. They will be automatically scoped.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">CSS Scoping</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Your CSS will be automatically scoped to prevent conflicts with other styles.
                </p>
                <p>
                  Use standard CSS selectors - they&apos;ll be prefixed with a unique class for this template.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/**
 * Extract slot names from template string
 * @param template HTML template with {{ slot }} variables
 * @returns Array of unique slot names
 */
function extractSlots(template: string): string[] {
  const slots = new Set<string>()
  const pattern = /{{[\s]*([\w]+)[\s]*}}/g

  let match
  while ((match = pattern.exec(template)) !== null) {
    slots.add(match[1])
  }

  return Array.from(slots)
}
