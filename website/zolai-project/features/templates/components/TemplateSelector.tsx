'use client'

import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { PageTemplate } from '@/features/templates/types'
import { client } from '@/lib/api/client'

type TemplateSelectorItem = Pick<PageTemplate, 'id' | 'name' | 'description'>

interface TemplateSelectorProps {
  /**
   * Form field name for the template ID
   */
  name: string

  /**
   * Label for the selector
   */
  label?: string

  /**
   * Description/help text
   */
  description?: string

  /**
   * Show only featured templates
   */
  featured?: boolean

  /**
   * Called when a template is selected
   */
  onChange?: (templateId: string) => void
}

/**
 * TemplateSelector
 * Component for selecting a page template from the database
 *
 * Features:
 * - Loads templates from API
 * - Shows featured templates if available
 * - Integrates with React Hook Form
 * - Shows loading state while fetching
 * - Displays template descriptions
 *
 * @component
 * @example
 * ```tsx
 * <TemplateSelector
 *   name="templateId"
 *   label="Page Template"
 *   description="Choose a layout for this page"
 * />
 * ```
 */
export function TemplateSelector({
  name,
  label = 'Page Template',
  description = 'Choose a layout template for this page',
  featured = false,
  onChange,
}: TemplateSelectorProps) {
  const { watch, setValue } = useFormContext()
  const selectedValue = watch(name)

  // Fetch templates from API
  const { data: response, isLoading } = useQuery<{ success: boolean; data: TemplateSelectorItem[] }>({
    queryKey: ['templates', { featured }],
    queryFn: async () => {
      try {
        const res = await client.api.templates.$get({
          query: featured ? { featured: 'true' } : {},
        })
        if (!res.ok) {
          throw new Error('Failed to fetch templates')
        }
        return (await res.json()) as { success: boolean; data: TemplateSelectorItem[] }
      } catch (err) {
        toast.error((err as Error).message || 'Failed to fetch templates')
        throw err
      }
    },
  })

  const templates = response?.data

  const handleChange = useCallback(
    (value: string) => {
      setValue(name, value === 'none' ? null : value, {
        shouldDirty: true,
        shouldValidate: true,
      })
      onChange?.(value)
    },
    [name, onChange, setValue]
  )

  const templateOptions = useMemo(
    () =>
      templates?.map((template) => ({
        value: template.id,
        label: template.name,
        description: template.description,
      })) || [],
    [templates]
  )

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Select
          value={typeof selectedValue === 'string' && selectedValue.length > 0 ? selectedValue : 'none'}
          onValueChange={(value) => {
            handleChange(value)
          }}
        >
          <SelectTrigger disabled={isLoading}>
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              <SelectValue placeholder="Select a template..." />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No template (use defaults)</SelectItem>
            {templateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col gap-1">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}
