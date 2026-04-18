"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExternalLink, Monitor, Smartphone, Save, LayoutTemplate, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAdminLayoutSettings, useSaveLayoutSettings } from "@/features/admin/hooks/use-layout-settings";

const layoutSchema = z.object({
  header_style: z.enum(["default", "minimal", "centered"]),
  header_sticky: z.boolean(),
  header_transparent_scroll: z.boolean(),
  header_show_search: z.boolean(),
  hero_style: z.enum(["simple", "background", "subtitle", "fullscreen", "minimal"]),
  hero_alignment: z.enum(["left", "center", "right"]),
  footer_style: z.enum(["standard", "minimal", "compact"]),
  footer_show_newsletter: z.boolean(),
  footer_show_social: z.boolean(),
  footer_columns: z.enum(["2", "3", "4"]),
});

type LayoutFormValues = z.infer<typeof layoutSchema>;

export function AdminLayoutEditor() {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const { data, isLoading } = useAdminLayoutSettings();
  const { mutate: saveSettings, isPending } = useSaveLayoutSettings();

  const form = useForm<LayoutFormValues>({
    resolver: zodResolver(layoutSchema),
    values: data ?? {
      header_style: "default",
      header_sticky: true,
      header_transparent_scroll: true,
      header_show_search: true,
      hero_style: "simple",
      hero_alignment: "center",
      footer_style: "standard",
      footer_show_newsletter: true,
      footer_show_social: true,
      footer_columns: "3",
    },
  });

  function onSubmit(values: LayoutFormValues) {
    saveSettings(values, {
      onSuccess: () => toast.success("Layout settings saved"),
      onError: () => toast.error("Failed to save layout settings"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" aria-hidden="true" />
            Layout Editor
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure the public site layout — header, hero, and footer styles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview device toggle */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={previewDevice === "desktop" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8"
              onClick={() => setPreviewDevice("desktop")}
              aria-label="Desktop preview"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === "mobile" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8"
              onClick={() => setPreviewDevice("mobile")}
              aria-label="Mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Preview Site
            </a>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
                Header
                <Badge variant="outline" className="text-xs font-normal">Public</Badge>
              </CardTitle>
              <CardDescription>Controls the top navigation bar on public pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="header_style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="centered">Centered</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="header_sticky"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">Sticky header</FormLabel>
                        <FormDescription className="text-xs">Stays at top on scroll</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Sticky header" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="header_transparent_scroll"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">Transparent on scroll</FormLabel>
                        <FormDescription className="text-xs">Blur effect on scroll</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Transparent on scroll" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="header_show_search"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">Show search</FormLabel>
                        <FormDescription className="text-xs">Search icon in header</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Show search" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-amber-500" aria-hidden="true" />
                Hero Section
                <Badge variant="outline" className="text-xs font-normal">Homepage</Badge>
              </CardTitle>
              <CardDescription>Controls the hero banner on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hero_style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="background">With Background</SelectItem>
                          <SelectItem value="subtitle">With Subtitle</SelectItem>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hero_alignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alignment</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-green-500" aria-hidden="true" />
                Footer
                <Badge variant="outline" className="text-xs font-normal">Public</Badge>
              </CardTitle>
              <CardDescription>Controls the footer on all public pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="footer_style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="footer_columns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Columns</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2 columns</SelectItem>
                          <SelectItem value="3">3 columns</SelectItem>
                          <SelectItem value="4">4 columns</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="footer_show_newsletter"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">Newsletter widget</FormLabel>
                        <FormDescription className="text-xs">Show subscribe form in footer</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Show newsletter widget" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="footer_show_social"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">Social links</FormLabel>
                        <FormDescription className="text-xs">Show social icons in footer</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Show social links" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Saving…" : "Save Layout"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
