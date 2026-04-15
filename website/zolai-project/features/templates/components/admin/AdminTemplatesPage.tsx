'use client'

import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { client } from '@/lib/api/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminTemplateEditor } from './AdminTemplateEditor'
import type { PageTemplate } from '@/features/templates/types'
import { Plus, Edit, Trash2, Copy, Loader2 } from 'lucide-react'

type ApiTemplateListItem = {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  htmlTemplate?: string
  cssTemplate?: string | null
  slots: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

/**
 * AdminTemplatesPage
 * Main page for managing page templates
 *
 * Features:
 * - View all templates in a table
 * - Create new templates
 * - Edit existing templates
 * - Delete templates (with confirmation)
 * - Duplicate templates
 */
export function AdminTemplatesPage() {
  const queryClient = useQueryClient()
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch templates
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['templates', { all: true }],
    queryFn: async () => {
      try {
        const res = await client.api.templates.$get({
          query: { limit: '100' },
        })
        if (!res.ok) {
          throw new Error('Failed to fetch templates')
        }
        const json = (await res.json()) as { success: boolean; data: ApiTemplateListItem[] }
        return (json.data || []).map((item): PageTemplate => ({
          ...item,
          htmlTemplate: item.htmlTemplate ?? '',
          cssTemplate: item.cssTemplate ?? null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }))
      } catch (err) {
        toast.error((err as Error).message || 'Failed to fetch templates')
        throw err
      }
    },
  })
  const templates = response

  const handleCreate = () => {
    setSelectedTemplate(null)
    setIsCreating(true)
  }

  const handleEdit = (template: PageTemplate) => {
    setSelectedTemplate(template)
    setIsEditing(true)
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.templates[':id'].$delete({
        param: { id },
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } }
        throw new Error(json.error?.message || 'Failed to delete template')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Template deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (err) => {
      toast.error((err as Error).message)
    },
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }
    setDeletingId(id)
    try {
      await deleteMutation.mutateAsync(id)
    } finally {
      setDeletingId(null)
    }
  }

  const duplicateMutation = useMutation({
    mutationFn: async (template: PageTemplate) => {
      const newTemplate = {
        name: `${template.name} (Copy)`,
        slug: `${template.slug}-copy-${Date.now()}`,
        description: template.description,
        thumbnail: template.thumbnail,
        htmlTemplate: template.htmlTemplate,
        cssTemplate: template.cssTemplate,
        slots: template.slots,
        featured: false,
      }

      const res = await client.api.templates.$post({
        json: newTemplate,
      })

      if (!res.ok) {
        throw new Error('Failed to duplicate template')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('Template duplicated successfully')
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
    onError: (err) => {
      toast.error((err as Error).message)
    },
  })

  const handleDuplicate = async (template: PageTemplate) => {
    await duplicateMutation.mutateAsync(template)
  }

  const handleSave = async () => {
    queryClient.invalidateQueries({ queryKey: ['templates'] })
    setIsCreating(false)
    setIsEditing(false)
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Templates</CardTitle>
          <CardDescription>{(error as Error).message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Templates</h1>
          <p className="text-muted-foreground">
            Manage layout templates for posts and pages
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Define a new page layout template with HTML and optional CSS
              </DialogDescription>
            </DialogHeader>
            <AdminTemplateEditor
              template={null}
              onSave={handleSave}
              onCancel={() => setIsCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      {selectedTemplate && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update the template properties and styling
              </DialogDescription>
            </DialogHeader>
            <AdminTemplateEditor
              template={selectedTemplate}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            {templates ? `${templates.length} template(s)` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : templates && templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {template.slug}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(template.slots as string[]).map((slot) => (
                          <span
                            key={slot}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.featured ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-400/30">
                          Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          disabled={deletingId === template.id}
                        >
                          {deletingId === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates yet. Create one to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
