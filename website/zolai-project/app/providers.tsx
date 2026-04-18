"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { setupCSRFInterceptor } from "@/lib/middleware/csrf-interceptor";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState<string>(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""
  );

  useEffect(() => {
    setupCSRFInterceptor();
    // Fetch recaptcha key from DB (admin-configurable), fallback to env
    fetch("/api/site-settings?keys=recaptcha_site_key")
      .then((r) => r.json())
      .then((json: { data?: { key: string; value: string }[] }) => {
        const key = json.data?.find((s) => s.key === "recaptcha_site_key")?.value;
        if (key) setRecaptchaSiteKey(key);
      })
      .catch(() => {});
  }, []);

  const content = (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  if (recaptchaSiteKey) {
    return (
      <GoogleReCaptchaProvider 
        reCaptchaKey={recaptchaSiteKey}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: "head",
          nonce: undefined,
        }}
      >
        {content}
      </GoogleReCaptchaProvider>
    );
  }

  return content;
}
