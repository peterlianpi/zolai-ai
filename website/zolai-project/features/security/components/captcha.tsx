"use client";

import { useState, useCallback, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  className?: string;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark";
  action?: string;
}

/**
 * Universal CAPTCHA component that supports both hCaptcha and Google reCAPTCHA v3.
 * Priority is given to Google reCAPTCHA v3 (Score-based) if configured.
 * Otherwise falls back to hCaptcha.
 */
export function Captcha({ 
  onVerify, 
  onExpire, 
  onError, 
  className,
  size = "normal",
  theme = "light",
  action = "form_submission"
}: CaptchaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Load configuration from environment variables
  const googleSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  // reCAPTCHA v3 execution
  const handleReCaptchaExecute = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    try {
      const token = await executeRecaptcha(action);
      onVerify(token);
    } catch (_err) {
      onError?.("reCAPTCHA v3 failed");
    }
  }, [executeRecaptcha, onVerify, onError, action]);

  // Execute v3 immediately on mount for forms
  useEffect(() => {
    if (googleSiteKey && executeRecaptcha) {
      handleReCaptchaExecute();
    }
  }, [googleSiteKey, executeRecaptcha, handleReCaptchaExecute]);

  // hCaptcha handlers
  const handleHCaptchaVerify = useCallback((token: string) => {
    setIsLoading(false);
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    setIsLoading(false);
    onExpire?.();
  }, [onExpire]);

  const handleHCaptchaError = useCallback((error: string) => {
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Use Google reCAPTCHA v3 if configured
  if (googleSiteKey) {
    // reCAPTCHA v3 is invisible, so we just return a small info text or nothing
    return (
      <div className={`${className} text-[10px] text-muted-foreground`}>
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
      </div>
    );
  }

  // Fallback to hCaptcha if configured
  if (hcaptchaSiteKey) {
    return (
      <div className={className}>
        {isLoading && (
          <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-sm text-gray-600">Loading CAPTCHA...</span>
          </div>
        )}
        <HCaptcha
          sitekey={hcaptchaSiteKey}
          onVerify={handleHCaptchaVerify}
          onExpire={handleExpire}
          onError={handleHCaptchaError}
          onLoad={handleLoad}
          size={size}
          theme={theme}
        />
      </div>
    );
  }

  // No CAPTCHA provider configured
  return null;
}
