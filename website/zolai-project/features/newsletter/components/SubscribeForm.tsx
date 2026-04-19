"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscribe } from "@/features/newsletter/hooks/use-subscribe";
import { Loader2 } from "lucide-react";

interface SubscribeFormProps {
  className?: string;
  showName?: boolean;
  placeholder?: string;
  buttonText?: string;
  source?: string;
  onSuccess?: () => void;
}

export function SubscribeForm({
  className = "",
  showName = false,
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  source = "newsletter-form",
  onSuccess,
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const subscribe = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    subscribe.mutate(
      {
        email,
        name: showName ? name : undefined,
        source,
      },
      {
        onSuccess: () => {
          setEmail("");
          setName("");
          onSuccess?.();
        },
      }
    );
  };

  const isLoading = subscribe.isPending;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {showName && (
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Name (optional)
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={isLoading}
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          required
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !email}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>

      <p className="text-xs text-muted-foreground">
        We&apos;ll never share your email. Unsubscribe at any time.
      </p>
    </form>
  );
}
