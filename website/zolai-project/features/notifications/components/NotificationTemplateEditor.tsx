"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus } from "lucide-react";
import {
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  type NotificationTemplate,
} from "../hooks/use-notification-templates";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  type: z.string().min(1, "Type is required"),
  isActive: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface NotificationTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: NotificationTemplate;
  onSuccess?: () => void;
}

export function NotificationTemplateEditor({
  open,
  onOpenChange,
  template,
  onSuccess,
}: NotificationTemplateEditorProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    template?.variables || {}
  );
  const [newVariableKey, setNewVariableKey] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");
  const [manualSlugMode, setManualSlugMode] = useState(false);

  const createTemplate = useCreateNotificationTemplate();
  const updateTemplate = useUpdateNotificationTemplate();

  const isEditing = !!template;

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      body: template.body,
      type: template.type,
      isActive: template.isActive,
    } : {
      name: "",
      slug: "",
      subject: "",
      body: "",
      type: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const templateData = {
        ...data,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
      };

      if (isEditing && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          data: templateData,
        });
      } else {
        await createTemplate.mutateAsync(templateData);
      }

      form.reset();
      setVariables({});
      setNewVariableKey("");
      setNewVariableValue("");
      setManualSlugMode(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (_error) {
      // Error handling is done in the hooks
    }
  };

  const addVariable = () => {
    if (newVariableKey.trim() && newVariableValue.trim()) {
      setVariables(prev => ({
        ...prev,
        [newVariableKey.trim()]: newVariableValue.trim(),
      }));
      setNewVariableKey("");
      setNewVariableValue("");
    }
  };

  const removeVariable = (key: string) => {
    setVariables(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const isLoading = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Notification Template" : "Create Notification Template"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Template name"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-generate slug if not in manual mode
                          if (!manualSlugMode && !isEditing) {
                            const name = e.target.value;
                            const generatedSlug = name
                              .toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                              .replace(/\s+/g, '-') // Replace spaces with hyphens
                              .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                              .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                            form.setValue("slug", generatedSlug);
                          }
                        }}
                      />
                    </FormControl>
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
                      <div className="space-y-2">
                        <Input
                          placeholder="template-slug"
                          {...field}
                          disabled={!manualSlugMode && !isEditing}
                          className={!manualSlugMode && !isEditing ? "bg-muted" : ""}
                        />
                        {!isEditing && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="manual-slug"
                              checked={manualSlugMode}
                              onChange={(e) => setManualSlugMode(e.target.checked)}
                              className="rounded"
                            />
                            <label htmlFor="manual-slug" className="text-sm text-muted-foreground">
                              Manually edit slug
                            </label>
                          </div>
                        )}
                        {!manualSlugMode && !isEditing && (
                          <p className="text-xs text-muted-foreground">
                            Auto-generated from name
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., system, marketing, security" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Email/notification subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notification content. Use {{variable}} for dynamic content."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Template Variables (Optional)</FormLabel>
              <p className="text-sm text-muted-foreground">
                Define variables that can be replaced in the template. Use {"{{variableName}}"} in the subject or body.
              </p>

              {Object.keys(variables).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(variables).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="px-2 py-1">
                      {key}: {value}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeVariable(key)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Variable name"
                  value={newVariableKey}
                  onChange={(e) => setNewVariableKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Default value"
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addVariable}
                  disabled={!newVariableKey.trim() || !newVariableValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Whether this template can be used to send notifications
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
