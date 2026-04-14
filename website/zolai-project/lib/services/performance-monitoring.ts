/**
 * Performance Monitoring and Metrics Collection
 * 
 * This module provides comprehensive performance monitoring for the Zolai AI application.
 * It tracks key metrics like response times, database query performance, cache hit rates, and more.
 */

import { after } from "next/server";
import { Redis } from "@upstash/redis";
import { monitorConfig } from "@/lib/config/monitoring";

// Initialize Redis client for metrics (if available)
let metricsRedis: Redis | null = null;
try {
  if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
    metricsRedis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }
} catch (error) {
  console.warn("Metrics Redis client initialization failed:", error);
}

// In-memory fallback for metrics
const memoryMetrics = new Map<string, { count: number; totalTime: number; lastReset: number }>();
const METRICS_RESET_INTERVAL = monitorConfig.metricsResetIntervalMs;

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  dbQueries?: number;
  cacheHit?: boolean;
  userId?: string;
  userAgent?: string;
  timestamp: number;
}

export interface AggregatedMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate?: number;
  slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>;
}

/**
 * Record performance metrics for an API request
 */
export async function recordMetrics(metrics: PerformanceMetrics): Promise<void> {
  const key = `perf:${metrics.method}:${metrics.endpoint}`;
  
  // Use after() for non-blocking metrics recording
  after(async () => {
    try {
      if (metricsRedis) {
        // Store in Redis with TTL
        await Promise.all([
          // Detailed metrics with 1-hour TTL
          metricsRedis.lpush(`${key}:detailed`, JSON.stringify(metrics)),
          metricsRedis.expire(`${key}:detailed`, monitorConfig.redisDetailedTtlSeconds),
          
          // Aggregated counters with 24-hour TTL
          metricsRedis.hincrby(`${key}:agg`, "count", 1),
          metricsRedis.hincrby(`${key}:agg`, "totalTime", Math.round(metrics.responseTime)),
          metricsRedis.hincrby(`${key}:agg`, metrics.statusCode >= 400 ? "errors" : "success", 1),
          metricsRedis.expire(`${key}:agg`, monitorConfig.redisAggregateTtlSeconds),
          
          // Cache hit tracking
          ...(metrics.cacheHit !== undefined ? [
            metricsRedis.hincrby(`${key}:cache`, metrics.cacheHit ? "hits" : "misses", 1),
            metricsRedis.expire(`${key}:cache`, monitorConfig.redisCacheTtlSeconds)
          ] : []),
        ]);
      } else {
        // Fallback to in-memory tracking
        const now = Date.now();
        const existing = memoryMetrics.get(key) || { count: 0, totalTime: 0, lastReset: now };
        
        // Reset counters every 5 minutes
        if (now - existing.lastReset > METRICS_RESET_INTERVAL) {
          existing.count = 0;
          existing.totalTime = 0;
          existing.lastReset = now;
        }
        
        existing.count += 1;
        existing.totalTime += metrics.responseTime;
        memoryMetrics.set(key, existing);
      }
    } catch (error) {
      console.error("Failed to record metrics:", error);
    }
  });
}

/**
 * Get aggregated performance metrics
 */
export async function getPerformanceMetrics(_timeRange: "1h" | "24h" = "1h"): Promise<AggregatedMetrics> {
  try {
    if (metricsRedis) {
      // Get all aggregated keys
      const keys = await metricsRedis.keys("perf:*:agg");
      const aggregated: AggregatedMetrics = {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        cacheHitRate: 0,
        slowestEndpoints: [],
      };
      
      const endpointMetrics: Array<{ endpoint: string; count: number; totalTime: number; errors: number }> = [];
      
      for (const key of keys) {
        const data = await metricsRedis.hgetall(key) || {};
        const count = parseInt((data.count as string) || "0");
        const totalTime = parseInt((data.totalTime as string) || "0");
        const errors = parseInt((data.errors as string) || "0");
        const _success = parseInt((data.success as string) || "0");
        
        const endpoint = key.replace("perf:", "").replace(":agg", "");
        
        aggregated.totalRequests += count;
        
        if (count > 0) {
          endpointMetrics.push({ endpoint, count, totalTime, errors });
        }
      }
      
      if (aggregated.totalRequests > 0) {
        const totalTime = endpointMetrics.reduce((sum, m) => sum + m.totalTime, 0);
        const totalErrors = endpointMetrics.reduce((sum, m) => sum + m.errors, 0);
        
        aggregated.averageResponseTime = totalTime / aggregated.totalRequests;
        aggregated.errorRate = (totalErrors / aggregated.totalRequests) * 100;
        
        // Calculate slowest endpoints
        aggregated.slowestEndpoints = endpointMetrics
          .map(m => ({
            endpoint: m.endpoint,
            avgTime: m.totalTime / m.count,
            count: m.count,
          }))
          .sort((a, b) => b.avgTime - a.avgTime)
          .slice(0, 10);
      }
      
      return aggregated;
    } else {
      // Fallback in-memory metrics
      let totalRequests = 0;
      let totalTime = 0;
      const slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }> = [];
      
      for (const [key, metrics] of memoryMetrics.entries()) {
        totalRequests += metrics.count;
        totalTime += metrics.totalTime;
        
        if (metrics.count > 0) {
          slowestEndpoints.push({
            endpoint: key.replace("perf:", ""),
            avgTime: metrics.totalTime / metrics.count,
            count: metrics.count,
          });
        }
      }
      
      return {
        totalRequests,
        averageResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
        errorRate: 0, // Not tracked in memory fallback
        p95ResponseTime: 0, // Not calculated in memory fallback
        p99ResponseTime: 0, // Not calculated in memory fallback
        slowestEndpoints: slowestEndpoints.sort((a, b) => b.avgTime - a.avgTime).slice(0, 10),
      };
    }
  } catch (error) {
    console.error("Failed to get performance metrics:", error);
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      slowestEndpoints: [],
    };
  }
}

/**
 * Middleware to automatically track API performance
 */
export function createPerformanceMiddleware() {
  return async (request: Request, next: () => Promise<Response>) => {
    const start = performance.now();
    const url = new URL(request.url);
    
    let response: Response;
    const dbQueries = 0;
    
    try {
      response = await next();
    } catch (error) {
      console.error("Request failed:", error);
      response = new Response("Internal Server Error", { status: 500 });
    }
    
    const responseTime = performance.now() - start;
    
    // Record metrics (non-blocking)
    recordMetrics({
      endpoint: url.pathname,
      method: request.method,
      statusCode: response.status,
      responseTime,
      dbQueries,
      timestamp: Date.now(),
      userAgent: request.headers.get("user-agent") || undefined,
    });
    
    // Add performance headers
    response.headers.set("X-Response-Time", `${responseTime.toFixed(2)}ms`);
    
    return response;
  };
}

/**
 * Database query performance tracking
 */
export class DatabaseMetrics {
  private static queryCount = 0;
  private static totalQueryTime = 0;
  
  static startQuery(): () => void {
    const start = performance.now();
    this.queryCount++;
    
    return () => {
      const duration = performance.now() - start;
      this.totalQueryTime += duration;
      
       // Log slow queries based on configured threshold
      if (duration > monitorConfig.slowQueryThresholdMs) {
        console.warn(`Slow database query detected: ${duration.toFixed(2)}ms`);
      }
    };
  }
  
  static getStats() {
    return {
      totalQueries: this.queryCount,
      averageQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
      totalQueryTime: this.totalQueryTime,
    };
  }
  
  static reset() {
    this.queryCount = 0;
    this.totalQueryTime = 0;
  }
}
