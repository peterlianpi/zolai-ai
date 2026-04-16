"use client";

import { useState } from "react";
import { client } from "@/lib/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle } from "lucide-react";

const CATEGORIES = [
  { value: "general",     label: "General Question" },
  { value: "dictionary",  label: "Dictionary & Vocabulary" },
  { value: "tutor",       label: "Language Tutor" },
  { value: "grammar",     label: "Grammar & Linguistics" },
  { value: "bug",         label: "Bug Report" },
  { value: "feature",     label: "Feature Request" },
  { value: "account",     label: "Account Issue" },
  { value: "other",       label: "Other" },
];

export function SupportForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", subject: "", category: "general", message: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await client.support.$post({ json: form as never });
      const json = await res.json() as { data?: { sent: boolean } };
      if (json.data?.sent) {
        setSent(true);
      } else {
        toast.error("Failed to send. Please try again.");
      }
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 lg:py-16 gap-6 text-center">
        <div className="p-4 rounded-full bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl lg:text-2xl font-bold">Message sent successfully!</h3>
          <p className="text-muted-foreground max-w-md">
            Thank you for contacting us. We&apos;ll review your message and get back to you within 2–3 business days.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => { 
            setSent(false); 
            setForm({ name: "", email: "", subject: "", category: "general", message: "" }); 
          }}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Name and Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="name" 
            required 
            value={form.name} 
            onChange={(e) => set("name", e.target.value)} 
            placeholder="Enter your full name"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="email" 
            type="email" 
            required 
            value={form.email} 
            onChange={(e) => set("email", e.target.value)} 
            placeholder="you@example.com"
            className="h-11"
          />
        </div>
      </div>

      {/* Category and Subject Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger id="category" className="w-full" style={{ height: '44px' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium">
            Subject <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="subject" 
            required 
            value={form.subject} 
            onChange={(e) => set("subject", e.target.value)} 
            placeholder="Brief summary of your inquiry"
            className="h-11"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea 
          id="message" 
          required 
          rows={6} 
          value={form.message} 
          onChange={(e) => set("message", e.target.value)} 
          placeholder="Please describe your question, issue, or feedback in detail. Include any relevant information that might help us assist you better."
          className="resize-y min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground">
          For technical issues, please include steps to reproduce the problem.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={loading} 
          size="lg"
          className="w-full sm:w-auto sm:min-w-[160px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground self-center">
          We&apos;ll respond within 2–3 business days
        </p>
      </div>
    </form>
  );
}
