/**
 * Login History and Device Management Service
 * 
 * Provides functions for tracking, retrieving, and managing user login history.
 */

import prisma from "@/lib/prisma";
import type { SecuritySeverity } from "@/lib/generated/prisma";

export interface LoginEvent {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
  details: Record<string, unknown>;
  severity: SecuritySeverity;
}

/**
 * Get recent login history for a user
 */
export async function getLoginHistory(userId: string, limit: number = 20) {
  try {
    const events = await prisma.securityEvent.findMany({
      where: {
        userId,
        type: {
          in: ["DEVICE_SESSION_CREATED", "LOGIN_SUCCESS", "SUSPICIOUS_LOGIN"] as const
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
    
    return events;
  } catch (error) {
    console.error("[LoginHistory] Error fetching history:", error);
    return [];
  }
}

/**
 * Get detailed device info from user agent
 */
export function parseUserAgent(ua: string | null) {
  if (!ua) return { os: "Unknown", browser: "Unknown", device: "Unknown" };
  
  const os = 
    ua.includes("Windows") ? "Windows" :
    ua.includes("Mac OS") ? "macOS" :
    ua.includes("Android") ? "Android" :
    ua.includes("iPhone") || ua.includes("iPad") ? "iOS" :
    ua.includes("Linux") ? "Linux" : "Unknown OS";
    
  const browser = 
    ua.includes("Chrome") ? "Chrome" :
    ua.includes("Firefox") ? "Firefox" :
    ua.includes("Safari") && !ua.includes("Chrome") ? "Safari" :
    ua.includes("Edge") ? "Edge" : "Unknown Browser";
    
  const device = 
    ua.includes("Mobi") ? "Mobile" : "Desktop";
    
  return { os, browser, device };
}

/**
 * Get geographic info from IP (Mock for now)
 */
export async function getGeoInfo(ip: string | null) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return { country: "Local", city: "Localhost" };
  
  // In a real implementation, we would use a library or API like ip-api.com or MaxMind
  return { country: "Unknown", city: "Unknown" };
}
