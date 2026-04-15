"use client";

import { useState, useCallback } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  className?: string;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark";
}

export function Captcha({ 
  onVerify, 
  onExpire, 
  onError, 
  className,
  size = "normal",
  theme = "light"
}: CaptchaProps) {
  const [isLoading, setIsLoading] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  const handleVerify = useCallback((token: string) => {
    setIsLoading(false);
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    setIsLoading(false);
    onExpire?.();
  }, [onExpire]);

  const handleError = useCallback((error: string) => {
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const _handleRender = useCallback(() => {
    setIsLoading(true);
  }, []);

  if (!siteKey) {
    console.warn("CAPTCHA site key not configured");
    return null;
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-sm text-gray-600">Loading CAPTCHA...</span>
        </div>
      )}
      <HCaptcha
        sitekey={siteKey}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        onLoad={handleLoad}
        size={size}
        theme={theme}
      />
    </div>
  );
}

// Alternative reCAPTCHA component (if using Google reCAPTCHA)
// Uncomment and use if you prefer Google reCAPTCHA over hCaptcha

// import ReCAPTCHA from "react-google-recaptcha";
// 
// export function GoogleCaptcha({ onVerify, onExpire, onError, className }: CaptchaProps) {
//   const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
// 
//   if (!siteKey) {
//     console.warn("reCAPTCHA site key not configured");
//     return null;
//   }
// 
//   return (
//     <div className={className}>
//       <ReCAPTCHA
//         sitekey={siteKey}
//         onChange={(token) => token && onVerify(token)}
//         onExpired={onExpire}
//         onError={() => onError?.("reCAPTCHA error")}
//       />
//     </div>
//   );
// }