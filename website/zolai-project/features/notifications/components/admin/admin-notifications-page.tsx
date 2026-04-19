"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bell, Plus, Edit, Trash2, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { NotificationTemplateEditor } from "../NotificationTemplateEditor";
import { useDeleteNotificationTemplate, useSendBulkNotification, type NotificationTemplate } from "../../hooks/use-notification-templates";

async function fetchNotificationTemplates(): Promise<NotificationTemplate[]> {
  const res = await client.api.notifications.templates.$get();
  if (!res.ok) throw new Error("Failed to fetch templates");
  const json = (await res.json()) as { success: boolean; data: NotificationTemplate[] };
  return json.data || [];
}

export function AdminNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | undefined>();
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [bulkUserIds, setBulkUserIds] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: fetchNotificationTemplates,
  });

  const deleteTemplate = useDeleteNotificationTemplate();
  const sendBulk = useSendBulkNotification();

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setEditorOpen(true);
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleDeleteTemplate = async (template: NotificationTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      await deleteTemplate.mutateAsync(template.id);
    }
  };

  const handleEditorSuccess = () => {
    refetch();
  };

  const handleSendBulk = async () => {
    const userIds = bulkUserIds.split(",").map(id => id.trim()).filter(id => id);

    if (!bulkTitle && !selectedTemplateId) {
      toast.error("Please provide a title or select a template");
      return;
    }

    if (!bulkDescription && !selectedTemplateId) {
      toast.error("Please provide a description or select a template");
      return;
    }

    if (userIds.length === 0) {
      toast.error("Please provide at least one user ID");
      return;
    }

    try {
      await sendBulk.mutateAsync({
        templateId: selectedTemplateId || undefined,
        title: bulkTitle || undefined,
        description: bulkDescription || undefined,
        type: "admin",
        userIds,
      });

      setBulkDialogOpen(false);
      setBulkTitle("");
      setBulkDescription("");
      setBulkUserIds("");
      setSelectedTemplateId("");
    } catch (_error) {
      // Error handled by hook
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-0">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">Manage notification templates and view notification history</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Create and manage notification templates for different events</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Send Bulk
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Bulk Notifications</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Template (Optional)</label>
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template or provide custom content" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!selectedTemplateId && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            value={bulkTitle}
                            onChange={(e) => setBulkTitle(e.target.value)}
                            placeholder="Notification title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={bulkDescription}
                            onChange={(e) => setBulkDescription(e.target.value)}
                            placeholder="Notification content"
                            rows={4}
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm font-medium">User IDs (comma-separated)</label>
                      <Textarea
                        value={bulkUserIds}
                        onChange={(e) => setBulkUserIds(e.target.value)}
                        placeholder="user-id-1, user-id-2, user-id-3"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendBulk} disabled={sendBulk.isPending}>
                        {sendBulk.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Send Notifications
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Search Templates</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, slug, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No templates found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{template.slug}</TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(template.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedTemplate(template)}
                          title="View"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditTemplate(template)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteTemplate(template)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Details</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Name</h4>
                  <p className="text-sm">{selectedTemplate.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Slug</h4>
                  <p className="text-sm font-mono">{selectedTemplate.slug}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Type</h4>
                  <p className="text-sm">{selectedTemplate.type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Status</h4>
                  <p className="text-sm">{selectedTemplate.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Subject</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedTemplate.subject}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Body</h4>
                <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selectedTemplate.body}
                </div>
              </div>
              {selectedTemplate.variables && Object.keys(selectedTemplate.variables).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedTemplate.variables).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NotificationTemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
        onSuccess={handleEditorSuccess}
      />
    </div>
  );
}
