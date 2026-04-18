"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

import { INBOXES } from "@/lib/constants/emails";

interface Email {
  id: string;
  to: string;
  from: string;
  fromName: string | null;
  subject: string;
  text: string | null;
  html: string | null;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

export function AdminInboundEmailPage() {
  const qc = useQueryClient();
  const [inbox, setInbox] = useState("all");
  const [selected, setSelected] = useState<Email | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data } = useQuery({
    queryKey: ["inbound-email", inbox],
    queryFn: async () => {
      const res = await client.api["inbound-email"].$get({
        query: { inbox: inbox === "all" ? undefined : inbox, limit: "50" },
      });
      const json = await res.json() as { data: Email[] };
      return json.data ?? [];
    },
  });

  const openEmail = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api["inbound-email"][":id"].$get({ param: { id } });
      const json = await res.json() as { data: Email };
      return json.data;
    },
    onSuccess: (email) => {
      setSelected(email);
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["inbound-email"] });
    },
  });

  const reply = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const res = await client.api["inbound-email"][":id"].reply.$post({
        param: { id },
        json: { text },
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reply sent");
      setReplyText("");
      if (selected) setSelected({ ...selected, isReplied: true });
      qc.invalidateQueries({ queryKey: ["inbound-email"] });
    },
    onError: () => toast.error("Failed to send reply"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await client.api["inbound-email"][":id"].$delete({ param: { id } });
    },
    onSuccess: () => {
      toast.success("Deleted");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["inbound-email"] });
    },
  });

  const emails = data ?? [];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-72 flex flex-col gap-2 shrink-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {INBOXES.map((box) => (
            <Button
              key={box}
              size="sm"
              variant={inbox === box ? "default" : "outline"}
              onClick={() => { setInbox(box); setSelected(null); }}
              className="text-xs"
            >
              {box === "all" ? "All" : box.split("@")[0]}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {emails.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">No emails</p>
          )}
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => openEmail.mutate(email.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted ${
                selected?.id === email.id ? "bg-muted border-primary" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`text-sm truncate ${!email.isRead ? "font-semibold" : ""}`}>
                  {email.fromName ?? email.from}
                </span>
                {!email.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Email view */}
      <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select an email to read
          </div>
        ) : (
          <>
            <div className="p-4 border-b space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-lg">{selected.subject}</h2>
                <div className="flex gap-2 shrink-0">
                  {selected.isReplied && <Badge variant="secondary">Replied</Badge>}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => del.mutate(selected.id)}
                    disabled={del.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                From: <span className="text-foreground">{selected.fromName ? `${selected.fromName} <${selected.from}>` : selected.from}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                To: <span className="text-foreground">{selected.to}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selected.html ? (
                <iframe
                  srcDoc={selected.html}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              ) : (
                <pre className="text-sm whitespace-pre-wrap font-sans">{selected.text}</pre>
              )}
            </div>

            <div className="p-4 border-t space-y-2">
              <Textarea
                placeholder={`Reply to ${selected.from}…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <Button
                onClick={() => reply.mutate({ id: selected.id, text: replyText })}
                disabled={!replyText.trim() || reply.isPending}
              >
                Send Reply
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
