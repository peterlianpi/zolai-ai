"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateTemplate, useUpdateTemplate, useTemplate } from "@/features/templates/hooks";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  thumbnail: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  htmlTemplate: z.string().min(1, "HTML template is required"),
  cssTemplate: z.string().optional(),
  featured: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateEditorProps {
  templateId?: string;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const { data: existingTemplate } = useTemplate(templateId || "");
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate(templateId || "");

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: existingTemplate?.data || {
      name: "",
      slug: "",
      description: "",
      thumbnail: "",
      htmlTemplate: "",
      cssTemplate: "",
      featured: false,
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    if (templateId) {
      await updateTemplate.mutateAsync(data);
    } else {
      await createTemplate.mutateAsync({ ...data, slots: [] });
    }
    router.push("/admin/templates");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {templateId ? "Edit Template" : "New Template"}
        </h1>
        <p className="text-muted-foreground">
          {templateId ? "Update template settings" : "Create a new page template"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Template" {...field} />
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
                      <Input placeholder="my-template" {...field} />
                    </FormControl>
                    <FormDescription>
                      Lowercase letters, numbers, and hyphens only
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
                        placeholder="Template description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Show this template in featured lists
                      </FormDescription>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="htmlTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTML Template</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="<div>{{content}}</div>"
                        className="font-mono text-sm min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use {`{{content}}`} for the main content area
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cssTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CSS Template (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=".custom-class { color: red; }"
                        className="font-mono text-sm min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createTemplate.isPending || updateTemplate.isPending}
            >
              {templateId ? "Update Template" : "Create Template"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/templates")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
