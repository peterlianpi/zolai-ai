"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeForm } from "./SubscribeForm";
import { Mail } from "lucide-react";

interface SubscribeWidgetProps {
  className?: string;
  title?: string;
  description?: string;
  showName?: boolean;
  source?: string;
}

export function SubscribeWidget({
  className = "",
  title = "Subscribe to our newsletter",
  description = "Get the latest news and updates delivered to your inbox.",
  showName = false,
  source = "sidebar-widget",
}: SubscribeWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SubscribeForm
          showName={showName}
          source={source}
          placeholder="you@example.com"
          buttonText="Subscribe"
        />
      </CardContent>
    </Card>
  );
}
