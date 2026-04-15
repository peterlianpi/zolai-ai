/**
 * Domain Configuration Utility
 * Provides consistent access to application domain configuration
 * Used by email templates and other client-side features
 */

/**
 * Get the application URL for client-side features
 * Prioritizes environment variables in this order:
 * 1. NEXT_PUBLIC_APP_URL (primary - for email templates)
 * 2. NEXT_PUBLIC_API_URL (fallback)
 * 3. NEXT_PUBLIC_BASE_URL (legacy fallback)
 * 4. localhost:3000 (development fallback)
 */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"
  );
}

/**
 * Get the base URL for authentication flows
 * Uses the same prioritization as getAppUrl()
 */
export function getAuthBaseUrl(): string {
  return getAppUrl();
}

/**
 * Get the API URL for server-side requests
 */
export function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get the app name for display in emails and UI
 */
export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || "P-Core System";
}
