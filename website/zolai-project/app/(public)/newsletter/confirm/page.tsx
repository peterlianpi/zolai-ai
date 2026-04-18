"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmSubscription } from "@/features/newsletter/server/actions";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(() =>
    token ? "" : "Invalid or missing confirmation token."
  );

  useEffect(() => {
    if (!token) return;

    const confirm = async () => {
      try {
        const result = await confirmSubscription(token);
        if (result.success) {
          setStatus("success");
          setMessage((result.data as { message?: string })?.message || "Your subscription has been confirmed successfully!");
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed. The link may have expired.");
        }
      } catch (_err) {
        setStatus("error");
        setMessage("A connection error occurred. Please try again later.");
      }
    };

    confirm();
  }, [token]);

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Confirming..."}
            {status === "success" && "Subscription Confirmed!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === "loading" && "Please wait while we verify your email address."}
            {status === "success" && "Lungdam! You are now part of the Zolai AI community."}
            {status === "error" && "We couldn't confirm your subscription."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {status === "success" ? (
            <Button asChild className="w-full py-6 text-lg">
              <Link href="/">
                Go to Homepage <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : status === "error" ? (
            <Button asChild variant="outline" className="w-full py-6">
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          ) : null}
          
          <Button asChild variant="ghost" className="w-full">
            <Link href="/news">Read Latest News</Link>
          </Button>
        </CardFooter>
      </Card>
      
      <p className="text-center text-sm text-muted-foreground mt-8">
        © {new Date().getFullYear()} Zolai AI. All rights reserved.
      </p>
    </div>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-md mx-auto py-20 px-4 flex justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
