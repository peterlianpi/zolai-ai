"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED" | "CANCELLED";
  sentCount?: number;
  createdAt: string;
}

export function AdminNewsletterCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    body: "",
  });
  const [showForm, setShowForm] = useState(false);

  // Fetch campaigns
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await client.api.newsletter.campaigns.$get({
        query: { page: "1", limit: "50" },
      });
      if (res.ok) {
        const data = (await res.json()) as unknown as {
          success: boolean;
          data: Campaign[];
          meta?: { total: number; page: number; limit: number; totalPages: number };
        };
        setCampaigns(data.data || []);
      }
    } catch (_err) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  // Create new campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.body) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await client.api.newsletter.campaigns.$post({
        json: newCampaign,
      });
      if (res.ok) {
        toast.success("Campaign created successfully");
        setNewCampaign({ name: "", subject: "", body: "" });
        setShowForm(false);
        await loadCampaigns();
      } else {
         const error = (await res.json()) as { error?: { message?: string } };
         toast.error(error.error?.message || "Failed to create campaign");
       }
     } catch (_err) {
      toast.error("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to send this campaign to all confirmed subscribers?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await client.api.newsletter.campaigns[":id"].send.$post({
        param: { id },
      });
      if (res.ok) {
        const data = (await res.json()) as { success: boolean; data: { sentCount: number; total: number } };
        toast.success(`Campaign sent to ${data.data.sentCount} subscribers`);
        await loadCampaigns();
       } else {
         const error = (await res.json()) as { error?: { message?: string } };
         toast.error(error.error?.message || "Failed to send campaign");
       }
     } catch (_err) {
      toast.error("Failed to send campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Campaigns</h1>
          <p className="text-gray-500 mt-1">Create and manage email campaigns</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>Create a new newsletter campaign to send to your subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., April Newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Subject</label>
                <Input
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  placeholder="e.g., New Dataset Release"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Body (HTML)</label>
                <textarea
                  value={newCampaign.body}
                  onChange={(e) => setNewCampaign({ ...newCampaign, body: e.target.value })}
                  placeholder="Use {{name}} and {{email}} for personalization"
                  className="w-full min-h-48 p-2 border rounded"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Create Campaign
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>View and manage your newsletter campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadCampaigns} disabled={loading} className="mb-4">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Load Campaigns
          </Button>

          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No campaigns yet. Create your first campaign to get started.</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">{campaign.subject}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Status: {campaign.status}</span>
                      <span>Sent: {campaign.sentCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === "DRAFT" && (
                      <Button size="sm" onClick={() => handleSendCampaign(campaign.id)} className="gap-2">
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
