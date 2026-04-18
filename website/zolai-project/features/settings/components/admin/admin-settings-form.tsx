"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_FOOTER_COPYRIGHT_TEXT } from "@/lib/constants/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, FileText, Image as ImageIcon, Globe, Mail, Loader2, Link2, Search, MessageCircle, BarChart3 } from "lucide-react";
import { client } from "@/lib/api/client";
import { toast } from "sonner";

interface SiteSetting {
  key: string;
  value: string;
  description?: string;
}

const DEFAULT_VALUES = {
  site_name: "",
  site_url: "",
  site_description: "",
  site_timezone: "Asia/Yangon",
  under_development: "false",
  under_development_message:
    "We are improving the site. Some features may be unavailable.",
  noreply_email: "",
  require_email_verification: "false",
  send_welcome_email: "false",
  allow_registration: "false",
  require_2fa: "false",
  session_timeout: "60",
  moderation_required: "false",
  posts_per_page: "10",
  default_locale: "en",
  max_upload_size: "10",
  allowed_file_types: "image/jpeg,image/png,image/gif,application/pdf",
  // Social Media
  social_facebook: "",
  social_twitter: "",
  social_youtube: "",
  social_instagram: "",
  social_tiktok: "",
  // SEO
  seo_default_title: "",
  seo_default_description: "",
  seo_robots: "index,follow",
  // Comments
  comments_enabled: "true",
  comments_moderation: "false",
  comments_guest_post: "true",
  // Analytics
  analytics_google_id: "",
  analytics_facebook_pixel: "",
  // Hero Settings
  hero_default_style: "simple",
  hero_default_background: "",
  hero_show_breadcrumbs: "true",
  hero_background_overlay: "0.3",
  hero_alignment: "left",
  // Header Settings
  header_style: "default",
  header_sticky: "true",
  header_transparent_scroll: "true",
  header_logo_size: "medium",
  header_show_search: "true",
  // Footer Settings
  footer_style: "standard",
  footer_show_newsletter: "true",
  footer_show_social: "true",
  footer_copyright_text: DEFAULT_FOOTER_COPYRIGHT_TEXT,
  footer_columns: "3",
} as const;

type SettingKey = keyof typeof DEFAULT_VALUES;

const FALLBACK_TIMEZONES = [
  "Asia/Yangon",
  "UTC",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Hong_Kong",
  "Asia/Kuala_Lumpur",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
];

function getTimezones(): string[] {
  const intl = Intl as unknown as {
    supportedValuesOf?: (key: string) => string[];
  };
  return intl.supportedValuesOf?.("timeZone") ?? FALLBACK_TIMEZONES;
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>(DEFAULT_VALUES);

  const timezones = useMemo(() => getTimezones(), []);

  const { data: siteData } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const res = await client.api.admin["site-settings"].$get();
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to fetch site settings");
      }
      return (await res.json()) as { success: boolean; data: SiteSetting[] };
    },
  });

  const settings = siteData?.data?.reduce((acc, s) => {
    acc[s.key] = s;
    return acc;
  }, {} as Record<string, SiteSetting>) || {};

  useEffect(() => {
    if (!siteData?.data) return;
    const nextValues = siteData.data.reduce((acc, s) => {
      acc[s.key] = s.value ?? "";
      return acc;
    }, {} as Record<string, string>);
    setFormValues((prev) => ({
      ...DEFAULT_VALUES,
      ...prev,
      ...nextValues,
    }));
  }, [siteData?.data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: { key: string; value: string }) => {
      const res = await client.api.admin["site-settings"].$put({
        json: payload,
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to save settings");
      }
      return (await res.json()) as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const isDirty = (key: SettingKey) => {
    const nextValue = formValues[key] ?? DEFAULT_VALUES[key] ?? "";
    const currentValue = settings[key]?.value ?? DEFAULT_VALUES[key] ?? "";
    return nextValue !== currentValue;
  };

  const isSectionDirty = (keys: SettingKey[]) =>
    keys.some((key) => isDirty(key));

  const handleSaveSection = async (section: string, keys: SettingKey[]) => {
    setSavingSection(section);
    try {
      for (const key of keys) {
        const value = String(formValues[key] ?? DEFAULT_VALUES[key] ?? "");
        await updateMutation.mutateAsync({ key, value });
      }
      toast.success("Settings saved");
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Information
            </CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formValues.site_name ?? DEFAULT_VALUES.site_name}
                placeholder="My Website"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    site_name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={formValues.site_url ?? DEFAULT_VALUES.site_url}
                placeholder="https://example.com"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    site_url: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={formValues.site_description ?? DEFAULT_VALUES.site_description}
                placeholder="A brief description of your site"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    site_description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteTimezone">Site Timezone</Label>
              <Select
                value={formValues.site_timezone ?? DEFAULT_VALUES.site_timezone}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    site_timezone: value,
                  }))
                }
              >
                <SelectTrigger id="siteTimezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-[320px]">
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Under Development</Label>
                <p className="text-sm text-muted-foreground">
                  Show a public banner on the main site
                </p>
              </div>
              <Switch
                checked={
                  (formValues.under_development ??
                    DEFAULT_VALUES.under_development) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    under_development: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="underDevelopmentMessage">Banner Message</Label>
              <Input
                id="underDevelopmentMessage"
                value={
                  formValues.under_development_message ??
                  DEFAULT_VALUES.under_development_message
                }
                placeholder="We are improving the site. Some features may be unavailable."
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    under_development_message: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "site" ||
                  !isSectionDirty([
                    "site_name",
                    "site_url",
                    "site_description",
                    "site_timezone",
                    "under_development",
                    "under_development_message",
                  ])
                }
                onClick={() =>
                  handleSaveSection("site", [
                    "site_name",
                    "site_url",
                    "site_description",
                    "site_timezone",
                    "under_development",
                    "under_development_message",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="noreplyEmail">No-Reply Email</Label>
              <Input
                id="noreplyEmail"
                type="email"
                value={formValues.noreply_email ?? DEFAULT_VALUES.noreply_email}
                placeholder="noreply@example.com"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    noreply_email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new users
                </p>
              </div>
              <Switch
                checked={
                  (formValues.require_email_verification ??
                    DEFAULT_VALUES.require_email_verification) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    require_email_verification: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Welcome Email</Label>
                <p className="text-sm text-muted-foreground">
                  Send welcome email to new users
                </p>
              </div>
              <Switch
                checked={
                  (formValues.send_welcome_email ??
                    DEFAULT_VALUES.send_welcome_email) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    send_welcome_email: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "email" ||
                  !isSectionDirty([
                    "noreply_email",
                    "require_email_verification",
                    "send_welcome_email",
                  ])
                }
                onClick={() =>
                  handleSaveSection("email", [
                    "noreply_email",
                    "require_email_verification",
                    "send_welcome_email",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register
                </p>
              </div>
              <Switch
                checked={
                  (formValues.allow_registration ??
                    DEFAULT_VALUES.allow_registration) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    allow_registration: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA for admin users
                </p>
              </div>
              <Switch
                checked={
                  (formValues.require_2fa ?? DEFAULT_VALUES.require_2fa) ===
                  "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    require_2fa: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={
                  formValues.session_timeout ?? DEFAULT_VALUES.session_timeout
                }
                placeholder="60"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    session_timeout: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "security" ||
                  !isSectionDirty([
                    "allow_registration",
                    "require_2fa",
                    "session_timeout",
                  ])
                }
                onClick={() =>
                  handleSaveSection("security", [
                    "allow_registration",
                    "require_2fa",
                    "session_timeout",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>Configure content moderation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Moderation Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require approval for new posts
                </p>
              </div>
              <Switch
                checked={
                  (formValues.moderation_required ??
                    DEFAULT_VALUES.moderation_required) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    moderation_required: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postsPerPage">Posts Per Page</Label>
              <Input
                id="postsPerPage"
                type="number"
                value={
                  formValues.posts_per_page ?? DEFAULT_VALUES.posts_per_page
                }
                placeholder="10"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    posts_per_page: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="defaultLocale">Default Locale</Label>
              <Select
                value={formValues.default_locale ?? DEFAULT_VALUES.default_locale}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    default_locale: value,
                  }))
                }
              >
                <SelectTrigger id="defaultLocale">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="my">Myanmar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "content" ||
                  !isSectionDirty([
                    "moderation_required",
                    "posts_per_page",
                    "default_locale",
                  ])
                }
                onClick={() =>
                  handleSaveSection("content", [
                    "moderation_required",
                    "posts_per_page",
                    "default_locale",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" role="img" aria-label="Media settings" />
              Media Settings
            </CardTitle>
            <CardDescription>Configure media uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
              <Input
                id="maxUploadSize"
                type="number"
                value={
                  formValues.max_upload_size ?? DEFAULT_VALUES.max_upload_size
                }
                placeholder="10"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    max_upload_size: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allowedTypes">Allowed File Types</Label>
              <Input
                id="allowedTypes"
                value={
                  formValues.allowed_file_types ??
                  DEFAULT_VALUES.allowed_file_types
                }
                placeholder="image/jpeg,image/png"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    allowed_file_types: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "media" ||
                  !isSectionDirty([
                    "max_upload_size",
                    "allowed_file_types",
                  ])
                }
                onClick={() =>
                  handleSaveSection("media", [
                    "max_upload_size",
                    "allowed_file_types",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Social Media
            </CardTitle>
            <CardDescription>Social media profile links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="socialFacebook">Facebook</Label>
                <Input
                  id="socialFacebook"
                  value={formValues.social_facebook ?? DEFAULT_VALUES.social_facebook}
                  placeholder="https://facebook.com/..."
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      social_facebook: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="socialTwitter">Twitter/X</Label>
                <Input
                  id="socialTwitter"
                  value={formValues.social_twitter ?? DEFAULT_VALUES.social_twitter}
                  placeholder="https://x.com/..."
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      social_twitter: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="socialYoutube">YouTube</Label>
                <Input
                  id="socialYoutube"
                  value={formValues.social_youtube ?? DEFAULT_VALUES.social_youtube}
                  placeholder="https://youtube.com/..."
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      social_youtube: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="socialInstagram">Instagram</Label>
                <Input
                  id="socialInstagram"
                  value={formValues.social_instagram ?? DEFAULT_VALUES.social_instagram}
                  placeholder="https://instagram.com/..."
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      social_instagram: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="socialTiktok">TikTok</Label>
              <Input
                id="socialTiktok"
                value={formValues.social_tiktok ?? DEFAULT_VALUES.social_tiktok}
                placeholder="https://tiktok.com/..."
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    social_tiktok: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "social" ||
                  !isSectionDirty([
                    "social_facebook",
                    "social_twitter",
                    "social_youtube",
                    "social_instagram",
                    "social_tiktok",
                  ])
                }
                onClick={() =>
                  handleSaveSection("social", [
                    "social_facebook",
                    "social_twitter",
                    "social_youtube",
                    "social_instagram",
                    "social_tiktok",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Settings
            </CardTitle>
            <CardDescription>Search engine optimization defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="seoDefaultTitle">Default Page Title</Label>
              <Input
                id="seoDefaultTitle"
                value={formValues.seo_default_title ?? DEFAULT_VALUES.seo_default_title}
                placeholder="{page_title} | Site Name"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    seo_default_title: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDefaultDescription">Default Meta Description</Label>
              <Input
                id="seoDefaultDescription"
                value={formValues.seo_default_description ?? DEFAULT_VALUES.seo_default_description}
                placeholder="Default description for pages"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    seo_default_description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoRobots">Robots Meta</Label>
              <Select
                value={formValues.seo_robots ?? DEFAULT_VALUES.seo_robots}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    seo_robots: value,
                  }))
                }
              >
                <SelectTrigger id="seoRobots">
                  <SelectValue placeholder="Select robots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index,follow">Index, Follow</SelectItem>
                  <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                  <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                  <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "seo" ||
                  !isSectionDirty([
                    "seo_default_title",
                    "seo_default_description",
                    "seo_robots",
                  ])
                }
                onClick={() =>
                  handleSaveSection("seo", [
                    "seo_default_title",
                    "seo_default_description",
                    "seo_robots",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments Settings
            </CardTitle>
            <CardDescription>Configure comment behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to comment on posts
                </p>
              </div>
              <Switch
                checked={
                  (formValues.comments_enabled ??
                    DEFAULT_VALUES.comments_enabled) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    comments_enabled: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Moderation Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require approval for comments
                </p>
              </div>
              <Switch
                checked={
                  (formValues.comments_moderation ??
                    DEFAULT_VALUES.comments_moderation) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    comments_moderation: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Guest Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow guests to post comments
                </p>
              </div>
              <Switch
                checked={
                  (formValues.comments_guest_post ??
                    DEFAULT_VALUES.comments_guest_post) === "true"
                }
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    comments_guest_post: checked.toString(),
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "comments" ||
                  !isSectionDirty([
                    "comments_enabled",
                    "comments_moderation",
                    "comments_guest_post",
                  ])
                }
                onClick={() =>
                  handleSaveSection("comments", [
                    "comments_enabled",
                    "comments_moderation",
                    "comments_guest_post",
                  ])
                }
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>Analytics and tracking IDs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="analyticsGoogle">Google Analytics ID</Label>
              <Input
                id="analyticsGoogle"
                value={formValues.analytics_google_id ?? DEFAULT_VALUES.analytics_google_id}
                placeholder="G-XXXXXXXXXX"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    analytics_google_id: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="analyticsFacebook">Facebook Pixel ID</Label>
              <Input
                id="analyticsFacebook"
                value={formValues.analytics_facebook_pixel ?? DEFAULT_VALUES.analytics_facebook_pixel}
                placeholder="1234567890"
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    analytics_facebook_pixel: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  savingSection === "analytics" ||
                  !isSectionDirty([
                    "analytics_google_id",
                    "analytics_facebook_pixel",
                  ])
                }
                onClick={() =>
                  handleSaveSection("analytics", [
                    "analytics_google_id",
                    "analytics_facebook_pixel",
                  ])
                }
               >
                 Save
               </Button>
             </div>
           </CardContent>
         </Card>

         {/* Hero Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" aria-hidden="true" />
                Hero Section
              </CardTitle>
             <CardDescription>Hero section display settings</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid gap-2">
               <Label htmlFor="heroStyle">Hero Style</Label>
               <Select
                 value={formValues.hero_default_style ?? DEFAULT_VALUES.hero_default_style}
                 onValueChange={(value) =>
                   setFormValues((prev) => ({
                     ...prev,
                     hero_default_style: value,
                   }))
                 }
               >
                 <SelectTrigger id="heroStyle">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="simple">Simple</SelectItem>
                   <SelectItem value="background">With Background</SelectItem>
                   <SelectItem value="subtitle">With Subtitle</SelectItem>
                   <SelectItem value="fullscreen">Fullscreen</SelectItem>
                   <SelectItem value="minimal">Minimal</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid gap-2">
               <Label htmlFor="heroBg">Hero Background (URL or color)</Label>
               <Input
                 id="heroBg"
                 value={formValues.hero_default_background ?? DEFAULT_VALUES.hero_default_background}
                 placeholder="/hero-bg.jpg or #000000"
                 onChange={(e) =>
                   setFormValues((prev) => ({
                     ...prev,
                     hero_default_background: e.target.value,
                   }))
                 }
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="heroOverlay">Background Overlay (0-1)</Label>
               <Input
                 id="heroOverlay"
                 type="number"
                 min="0"
                 max="1"
                 step="0.1"
                 value={formValues.hero_background_overlay ?? DEFAULT_VALUES.hero_background_overlay}
                 onChange={(e) =>
                   setFormValues((prev) => ({
                     ...prev,
                     hero_background_overlay: e.target.value,
                   }))
                 }
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="heroAlignment">Text Alignment</Label>
               <Select
                 value={formValues.hero_alignment ?? DEFAULT_VALUES.hero_alignment}
                 onValueChange={(value) =>
                   setFormValues((prev) => ({
                     ...prev,
                     hero_alignment: value,
                   }))
                 }
               >
                 <SelectTrigger id="heroAlignment">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="left">Left</SelectItem>
                   <SelectItem value="center">Center</SelectItem>
                   <SelectItem value="right">Right</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 id="heroBreadcrumbs"
                 checked={formValues.hero_show_breadcrumbs === "true"}
                 onCheckedChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     hero_show_breadcrumbs: checked ? "true" : "false",
                   }))
                 }
               />
               <Label htmlFor="heroBreadcrumbs">Show Breadcrumbs</Label>
             </div>
             <div className="flex justify-end">
               <Button
                 type="button"
                 disabled={
                   savingSection === "hero" ||
                   !isSectionDirty([
                     "hero_default_style",
                     "hero_default_background",
                     "hero_background_overlay",
                     "hero_alignment",
                     "hero_show_breadcrumbs",
                   ])
                 }
                 onClick={() =>
                   handleSaveSection("hero", [
                     "hero_default_style",
                     "hero_default_background",
                     "hero_background_overlay",
                     "hero_alignment",
                     "hero_show_breadcrumbs",
                   ])
                 }
               >
                 {savingSection === "hero" && (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 )}
                 Save
               </Button>
             </div>
           </CardContent>
         </Card>

         {/* Header Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <FileText className="h-5 w-5" />
               Header Settings
             </CardTitle>
             <CardDescription>Header display and behavior settings</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid gap-2">
               <Label htmlFor="headerStyle">Header Style</Label>
               <Select
                 value={formValues.header_style ?? DEFAULT_VALUES.header_style}
                 onValueChange={(value) =>
                   setFormValues((prev) => ({
                     ...prev,
                     header_style: value,
                   }))
                 }
               >
                 <SelectTrigger id="headerStyle">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="default">Default</SelectItem>
                   <SelectItem value="minimal">Minimal</SelectItem>
                   <SelectItem value="centered">Centered</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid gap-2">
               <Label htmlFor="logoSize">Logo Size</Label>
               <Select
                 value={formValues.header_logo_size ?? DEFAULT_VALUES.header_logo_size}
                 onValueChange={(value) =>
                   setFormValues((prev) => ({
                     ...prev,
                     header_logo_size: value,
                   }))
                 }
               >
                 <SelectTrigger id="logoSize">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="small">Small</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="large">Large</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 id="headerSticky"
                 checked={formValues.header_sticky === "true"}
                 onCheckedChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     header_sticky: checked ? "true" : "false",
                   }))
                 }
               />
               <Label htmlFor="headerSticky">Sticky Header</Label>
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 id="headerTransparent"
                 checked={formValues.header_transparent_scroll === "true"}
                 onCheckedChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     header_transparent_scroll: checked ? "true" : "false",
                   }))
                 }
               />
               <Label htmlFor="headerTransparent">Transparent on Scroll</Label>
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 id="headerSearch"
                 checked={formValues.header_show_search === "true"}
                 onCheckedChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     header_show_search: checked ? "true" : "false",
                   }))
                 }
               />
               <Label htmlFor="headerSearch">Show Search Bar</Label>
             </div>
             <div className="flex justify-end">
               <Button
                 type="button"
                 disabled={
                   savingSection === "header" ||
                   !isSectionDirty([
                     "header_style",
                     "header_logo_size",
                     "header_sticky",
                     "header_transparent_scroll",
                     "header_show_search",
                   ])
                 }
                 onClick={() =>
                   handleSaveSection("header", [
                     "header_style",
                     "header_logo_size",
                     "header_sticky",
                     "header_transparent_scroll",
                     "header_show_search",
                   ])
                 }
               >
                 {savingSection === "header" && (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 )}
                 Save
               </Button>
             </div>
           </CardContent>
         </Card>

         {/* Footer Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Link2 className="h-5 w-5" />
               Footer Settings
             </CardTitle>
             <CardDescription>Footer display and layout settings</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid gap-2">
               <Label htmlFor="footerStyle">Footer Style</Label>
               <Select
                 value={formValues.footer_style ?? DEFAULT_VALUES.footer_style}
                 onValueChange={(value) =>
                   setFormValues((prev) => ({
                     ...prev,
                     footer_style: value,
                   }))
                 }
               >
                 <SelectTrigger id="footerStyle">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="standard">Standard</SelectItem>
                   <SelectItem value="minimal">Minimal</SelectItem>
                   <SelectItem value="compact">Compact</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid gap-2">
               <Label htmlFor="footerColumns">Footer Columns (2-4)</Label>
               <Select
                 value={formValues.footer_columns ?? DEFAULT_VALUES.footer_columns}
                 onValueChange={(value) =>
                   setFormValues((prev) => ({
                     ...prev,
                     footer_columns: value,
                   }))
                 }
               >
                 <SelectTrigger id="footerColumns">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="2">2 Columns</SelectItem>
                   <SelectItem value="3">3 Columns</SelectItem>
                   <SelectItem value="4">4 Columns</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid gap-2">
               <Label htmlFor="copyrightText">Copyright Text</Label>
               <Input
                 id="copyrightText"
                 value={formValues.footer_copyright_text ?? DEFAULT_VALUES.footer_copyright_text}
                 placeholder={DEFAULT_FOOTER_COPYRIGHT_TEXT}
                 onChange={(e) =>
                   setFormValues((prev) => ({
                     ...prev,
                     footer_copyright_text: e.target.value,
                   }))
                 }
               />
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 id="footerNewsletter"
                 checked={formValues.footer_show_newsletter === "true"}
                 onCheckedChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     footer_show_newsletter: checked ? "true" : "false",
                   }))
                 }
               />
               <Label htmlFor="footerNewsletter">Show Newsletter Signup</Label>
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 id="footerSocial"
                 checked={formValues.footer_show_social === "true"}
                 onCheckedChange={(checked) =>
                   setFormValues((prev) => ({
                     ...prev,
                     footer_show_social: checked ? "true" : "false",
                   }))
                 }
               />
               <Label htmlFor="footerSocial">Show Social Links</Label>
             </div>
             <div className="flex justify-end">
               <Button
                 type="button"
                 disabled={
                   savingSection === "footer" ||
                   !isSectionDirty([
                     "footer_style",
                     "footer_columns",
                     "footer_copyright_text",
                     "footer_show_newsletter",
                     "footer_show_social",
                   ])
                 }
                 onClick={() =>
                   handleSaveSection("footer", [
                     "footer_style",
                     "footer_columns",
                     "footer_copyright_text",
                     "footer_show_newsletter",
                     "footer_show_social",
                   ])
                 }
               >
                 {savingSection === "footer" && (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 )}
                 Save
               </Button>
             </div>
           </CardContent>
         </Card>

         {savingSection && (
           <div className="fixed bottom-4 right-4">
             <Button disabled>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Saving...
             </Button>
           </div>
         )}
     </div>
   );
 }
