/**
 * System Resources and Statistics Monitor
 * 
 * This module provides comprehensive system monitoring including CPU, memory, disk, 
 * network statistics, and database performance tracking.
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { performance, PerformanceObserver } from "perf_hooks";
import * as os from "os";
import { monitorConfig } from "@/lib/config/monitoring";

// Memory stats (in bytes)
export interface MemoryStats {
  total: number;
  free: number;
  used: number;
  usedPercent: number;
  cache: number;
}

// CPU stats
export interface CPUStats {
  model: string;
  cores: number;
  load: {
    avg1: number;
    avg5: number;
    avg15: number;
  };
  usagePercent: number;
  user: number;
  nice: number;
  system: number;
  idle: number;
  irq: number;
}

// Disk stats
export interface DiskStats {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
  mount: string;
  filesystem: string;
}

// Network stats
export interface NetworkStats {
  interface: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  rxErrors: number;
  txErrors: number;
  rxDropped: number;
  txDropped: number;
}

// Process stats
export interface ProcessStats {
  pid: number;
  ppid: number;
  user: string;
  cpuPercent: number;
  memPercent: number;
  vmSize: number;
  rss: number;
  state: string;
  uptime: number;
}

// Database stats
export interface DatabaseStats {
  connections: number;
  queriesPerSecond: number;
  slowQueries: number;
  cacheHitRate: number;
  activeTransactions: number;
  locksWaiting: number;
}

// Server uptime
export interface UptimeStats {
  seconds: number;
  humanReadable: string;
  since: Date;
}

// System health summary
export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  timestamp: number;
  memory: MemoryStats;
  cpu: CPUStats;
  disk: DiskStats;
  network: NetworkStats[];
  process: ProcessStats;
  database: DatabaseStats;
  uptime: UptimeStats;
  errors: string[];
}

// Global stats cache
const statsCache = {
  memory: null as MemoryStats | null,
  cpu: null as CPUStats | null,
  disk: null as DiskStats | null,
  network: null as NetworkStats[] | null,
  cachedAt: 0,
  cacheTTL: monitorConfig.statsCacheTtlMs,
};

// Performance observer for request timing
let requestCount = 0;
let totalRequestTime = 0;
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === "http") {
      requestCount++;
      totalRequestTime += entry.duration;
    }
  }
});
performanceObserver.observe({ entryTypes: ["http"] });

/**
 * Get system memory statistics
 */
export function getMemoryStats(forceRefresh = false): MemoryStats {
  if (!forceRefresh && statsCache.memory && Date.now() - statsCache.cachedAt < statsCache.cacheTTL) {
    return statsCache.memory;
  }

  try {
    // Try to read from /proc/meminfo (Linux)
    const meminfo = readFileSync("/proc/meminfo", "utf8");
    const memTotal = parseInt(meminfo.match(/^MemTotal:\s+(\d+) kB$/m)?.[1] || "0");
    const memFree = parseInt(meminfo.match(/^MemFree:\s+(\d+) kB$/m)?.[1] || "0");
    const buffers = parseInt(meminfo.match(/^Buffers:\s+(\d+) kB$/m)?.[1] || "0");
    const cached = parseInt(meminfo.match(/^Cached:\s+(\d+) kB$/m)?.[1] || "0");
    const sReclaimable = parseInt(meminfo.match(/^SReclaimable:\s+(\d+) kB$/m)?.[1] || "0");

    const total = memTotal * 1024;
    const used = (memTotal - memFree - buffers - cached - sReclaimable) * 1024;
    const free = memFree * 1024;
    const cache = (cached + sReclaimable) * 1024;
    const usedPercent = total > 0 ? (used / total) * 100 : 0;

    const stats = {
      total,
      free,
      used,
      usedPercent: isNaN(usedPercent) ? 0 : usedPercent,
      cache,
    };
    
    statsCache.memory = stats;
    statsCache.cachedAt = Date.now();
    return stats;
  } catch {
    // Fallback: use Node.js process memory
    const mem = process.memoryUsage();
    const total = mem.heapTotal + mem.external;
    const used = mem.heapUsed + mem.external;
    
    return {
      total,
      free: total - used,
      used,
      usedPercent: total > 0 ? (used / total) * 100 : 0,
      cache: 0,
    };
  }
}

/**
 * Get system CPU statistics
 */
export function getCPUStats(forceRefresh = false): CPUStats {
  if (!forceRefresh && statsCache.cpu && Date.now() - statsCache.cachedAt < statsCache.cacheTTL) {
    return statsCache.cpu;
  }

  try {
    // Try to read CPU info from /proc
    const loadavg = execSync("uptime", { encoding: "utf8" }).trim();
    const loadMatch = loadavg.match(/load average[s]?:\s+([\d.]+),?\s*([\d.]+),?\s*([\d.]+)/);
    
    const cpuInfo = execSync("cat /proc/cpuinfo | grep 'model name'", { encoding: "utf8" }).trim();
    const model = cpuInfo ? cpuInfo.split("\n")[0].replace("model name\t: ", "") : "Unknown";
    
    const cores = parseInt(execSync("nproc", { encoding: "utf8" }).trim()) || 1;
    
    const load = loadMatch ? {
      avg1: parseFloat(loadMatch[1]),
      avg5: parseFloat(loadMatch[2]),
      avg15: parseFloat(loadMatch[3]),
    } : { avg1: 0, avg5: 0, avg15: 0 };
    
    // Get CPU usage from /proc/stat
    const stat = readFileSync("/proc/stat", "utf8");
    const cpuLine = stat.match(/^cpu\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/m);
    
    let user = 0, nice = 0, system = 0, idle = 0, irq = 0;
    if (cpuLine) {
      user = parseInt(cpuLine[1]);
      nice = parseInt(cpuLine[2]);
      system = parseInt(cpuLine[3]);
      idle = parseInt(cpuLine[4]);
      irq = parseInt(cpuLine[6]);
    }
    
    const total = user + nice + system + idle + irq;
    const usagePercent = total > 0 ? ((total - idle) / total) * 100 : 0;
    
    const stats: CPUStats = {
      model,
      cores,
      load,
      usagePercent: isNaN(usagePercent) ? 0 : usagePercent,
      user,
      nice,
      system,
      idle,
      irq,
    };
    
    statsCache.cpu = stats;
    statsCache.cachedAt = Date.now();
    return stats;
  } catch {
    // Fallback: basic stats
    const cpus = os.cpus();
    return {
      model: cpus[0].model,
      cores: cpus.length,
      load: { avg1: 0, avg5: 0, avg15: 0 },
      usagePercent: 0,
      user: 0,
      nice: 0,
      system: 0,
      idle: 0,
      irq: 0,
    };
  }
}

/**
 * Get disk statistics
 */
export function getDiskStats(forceRefresh = false): DiskStats {
  if (!forceRefresh && statsCache.disk && Date.now() - statsCache.cachedAt < statsCache.cacheTTL) {
    return statsCache.disk;
  }

  try {
    // Get disk usage from df command
    const output = execSync("df -B1 / | tail -1", { encoding: "utf8" }).trim();
    const parts = output.split(/\s+/);
    
    const total = parseInt(parts[1]);
    const used = parseInt(parts[2]);
    const free = parseInt(parts[3]);
    const usedPercent = parseFloat(parts[4].replace("%", "")) || 0;
    
    const stats: DiskStats = {
      total,
      used,
      free,
      usedPercent,
      mount: parts[5],
      filesystem: parts[0],
    };
    
    statsCache.disk = stats;
    statsCache.cachedAt = Date.now();
    return stats;
  } catch {
    // Fallback: return basic stats
    return {
      total: 0,
      used: 0,
      free: 0,
      usedPercent: 0,
      mount: "/",
      filesystem: "unknown",
    };
  }
}

/**
 * Get network interface statistics
 */
export function getNetworkStats(): NetworkStats[] {
  try {
    const interfaces = os.networkInterfaces();
    const result: NetworkStats[] = [];
    
    for (const [name] of Object.entries(interfaces)) {
      let rxBytes = 0, txBytes = 0, rxPackets = 0, txPackets = 0;
      let rxErrors = 0, txErrors = 0, rxDropped = 0, txDropped = 0;
      
      // Get stats from /proc/net/dev for each interface
      try {
        const netDev = readFileSync("/proc/net/dev", "utf8");
        const lines = netDev.split("\n");
        for (const line of lines) {
          if (line.includes(name) && !line.includes("lo:")) {
            const parts = line.split(":")[1].trim().split(/\s+/);
            // rx_bytes, rx_packets, rx_errors, rx_drop, tx_bytes, tx_packets, tx_errors, tx_drop
            rxBytes = parseInt(parts[0]) || 0;
            rxPackets = parseInt(parts[1]) || 0;
            rxErrors = parseInt(parts[2]) || 0;
            rxDropped = parseInt(parts[3]) || 0;
            txBytes = parseInt(parts[8]) || 0;
            txPackets = parseInt(parts[9]) || 0;
            txErrors = parseInt(parts[10]) || 0;
            txDropped = parseInt(parts[11]) || 0;
            break;
          }
        }
      } catch {
        // Use placeholder values if we can't read /proc/net/dev
      }
      
      result.push({
        interface: name,
        rxBytes,
        txBytes,
        rxPackets,
        txPackets,
        rxErrors,
        txErrors,
        rxDropped,
        txDropped,
      });
    }
    
    return result;
  } catch {
    return [];
  }
}

/**
 * Get process statistics
 */
export function getProcessStats(): ProcessStats {
  try {
    const stats = process.resourceUsage();
    const mem = process.memoryUsage();
    
    // Get process info from /proc
    const statFile = readFileSync(`/proc/${process.pid}/stat`, "utf8");
    
    // Parse /proc/pid/stat
    const parts = statFile.split(/\s+/);
    const ppid = parseInt(parts[3]) || 0;
    const utime = parseInt(parts[13]) || 0;
    const stime = parseInt(parts[14]) || 0;
    const starttime = parseInt(parts[21]) || 0;
    
    // Get process state
    const state = parts[2] || "R";
    
    // Calculate uptime
    const clockTicks = monitorConfig.processClockTicks;
    const uptime = (Date.now() / 1000) - (starttime / clockTicks);
    
    // Calculate memory percentages
    const memTotal = getMemoryStats().total;
    const memPercent = memTotal > 0 ? (mem.heapUsed / memTotal) * 100 : 0;
    
    // CPU percent (simple calculation based on process time vs system time)
    const totalCPUTime = utime + stime;
    const totalTime = monitorConfig.processCpuTimeDivisor;
    const cpuPercent = totalTime > 0 ? (totalCPUTime / totalTime) * 100 : 0;
    
    return {
      pid: process.pid,
      ppid,
      user: process.env.USER || "unknown",
      cpuPercent,
      memPercent,
      vmSize: stats.heapUsed,
      rss: stats.heapUsed,
      state,
      uptime: Math.floor(uptime),
    };
  } catch {
    return {
      pid: process.pid,
      ppid: 0,
      user: process.env.USER || "unknown",
      cpuPercent: 0,
      memPercent: 0,
      vmSize: process.memoryUsage().heapUsed,
      rss: process.memoryUsage().heapUsed,
      state: "R",
      uptime: 0,
    };
  }
}

/**
 * Get database connection statistics
 */
export function getDatabaseStats(dbAvailable: boolean): DatabaseStats {
  if (!dbAvailable) {
    return {
      connections: 0,
      queriesPerSecond: 0,
      slowQueries: 0,
      cacheHitRate: 0,
      activeTransactions: 0,
      locksWaiting: 0,
    };
  }

  try {
    // Read database stats from PostgreSQL
    const output = execSync("echo 'SELECT count(*) FROM pg_stat_activity;' | psql -t", { 
      encoding: "utf8",
      env: { ...process.env, PGPASSWORD: "" } 
    }).trim();
    
    const connections = parseInt(output) || 0;
    
    return {
      connections,
      queriesPerSecond: 0, // Requires more detailed stats
      slowQueries: 0,
      cacheHitRate: 0,
      activeTransactions: 0,
      locksWaiting: 0,
    };
  } catch {
    return {
      connections: 0,
      queriesPerSecond: 0,
      slowQueries: 0,
      cacheHitRate: 0,
      activeTransactions: 0,
      locksWaiting: 0,
    };
  }
}

/**
 * Get system uptime
 */
export function getUptimeStats(): UptimeStats {
  try {
    const uptimeSeconds = parseInt(execSync("cat /proc/uptime | cut -d' ' -f1", { encoding: "utf8" }).trim());
    const seconds = Math.floor(uptimeSeconds);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    let humanReadable = "";
    if (days > 0) humanReadable += `${days} day${days > 1 ? "s" : ""}, `;
    if (hours > 0) humanReadable += `${hours % 24} hour${hours % 24 > 1 ? "s" : ""}, `;
    humanReadable += `${minutes % 60} minute${minutes % 60 > 1 ? "s" : ""}`;
    
    return {
      seconds,
      humanReadable: humanReadable.trim().replace(/, $/, ""),
      since: new Date(Date.now() - seconds * 1000),
    };
  } catch {
    const uptime = process.uptime();
    const seconds = Math.floor(uptime);
    return {
      seconds,
      humanReadable: `${seconds} seconds`,
      since: new Date(Date.now() - seconds * 1000),
    };
  }
}

/**
 * Get comprehensive system health summary
 */
export function getSystemHealth(): SystemHealth {
  const errors: string[] = [];
  
  // Get all stats
  const memory = getMemoryStats();
  const cpu = getCPUStats();
  const disk = getDiskStats();
  const network = getNetworkStats();
  const processStats = getProcessStats();
  const uptime = getUptimeStats();
  
  // Check for potential issues
  if (memory.usedPercent > monitorConfig.memoryWarningPercent) {
    errors.push(`⚠️ High memory usage (>${monitorConfig.memoryWarningPercent}%)`);
  }
  if (memory.usedPercent > monitorConfig.memoryCriticalPercent) {
    errors.push(`🚨 Critical memory usage (>${monitorConfig.memoryCriticalPercent}%)`);
  }
  
  if (disk.usedPercent > monitorConfig.diskWarningPercent) {
    errors.push(`⚠️ High disk usage (>${monitorConfig.diskWarningPercent}%)`);
  }
  if (disk.usedPercent > monitorConfig.diskCriticalPercent) {
    errors.push(`🚨 Critical disk usage (>${monitorConfig.diskCriticalPercent}%)`);
  }
  
  if (cpu.usagePercent > monitorConfig.cpuWarningPercent) {
    errors.push(`⚠️ High CPU usage (>${monitorConfig.cpuWarningPercent}%)`);
  }
  
  // Check memory usage against thresholds
  const mem = process.memoryUsage();
  const heapMb = Math.round(mem.heapUsed / 1024 / 1024);
  if (heapMb > monitorConfig.heapWarningMb) {
    errors.push(`⚠️ High heap memory: ${heapMb}MB (threshold: ${monitorConfig.heapWarningMb}MB)`);
  }
  
  // Determine overall status
  let status: "healthy" | "warning" | "critical" = "healthy";
  if (errors.length > 0) status = "warning";
  if (errors.some(e => e.includes("🚨"))) status = "critical";
  
  return {
    status,
    timestamp: Date.now(),
    memory,
    cpu,
    disk,
    network,
    process: processStats,
    database: {
      connections: 0, // Will be updated by the actual DB connection count
      queriesPerSecond: requestCount / (uptime.seconds || 1),
      slowQueries: 0,
      cacheHitRate: 0,
      activeTransactions: 0,
      locksWaiting: 0,
    },
    uptime,
    errors,
  };
}

/**
 * Format system health stats for display
 */
export function formatSystemHealthStats(health: SystemHealth): string {
  const lines: string[] = [];
  
  lines.push(`📊 <b>System Health Summary</b>`);
  lines.push(`Status: ${health.status === "healthy" ? "✅ Healthy" : health.status === "warning" ? "⚠️ Warning" : "🚨 Critical"}`);
  lines.push(``);
  
  lines.push(`<b>📈 Memory:</b> ${Math.round(health.memory.used / 1024 / 1024)}MB / ${Math.round(health.memory.total / 1024 / 1024)}MB (${Math.round(health.memory.usedPercent)}%)`);
  lines.push(`<b>⚡ CPU:</b> ${Math.round(health.cpu.usagePercent)}% (Load: ${health.cpu.load.avg1}, ${health.cpu.load.avg5}, ${health.cpu.load.avg15})`);
  lines.push(`<b>💾 Disk:</b> ${Math.round(health.disk.used / 1024 / 1024 / 1024)}GB / ${Math.round(health.disk.total / 1024 / 1024 / 1024)}GB (${Math.round(health.disk.usedPercent)}%)`);
  lines.push(`<b>💻 Process:</b> PID ${health.process.pid}, ${Math.round(health.process.memPercent)}% memory, ${Math.round(health.process.cpuPercent)}% CPU`);
  lines.push(`<b>⏱️ Uptime:</b> ${health.uptime.humanReadable}`);
  
  if (health.errors.length > 0) {
    lines.push(``);
    lines.push(`<b>⚠️ Warnings:</b>`);
    health.errors.forEach(err => lines.push(`   ${err}`));
  }
  
  return lines.join("\n");
}

/**
 * Get server performance metrics
 */
export function getServerMetrics() {
  return {
    requestCount,
    totalRequestTime,
    avgRequestTime: requestCount > 0 ? totalRequestTime / requestCount : 0,
    memoryUsage: process.memoryUsage(),
    eventLoopDelay: performance.now() - nodeStartTime,
  };
}

// Initialize performance tracking
const nodeStartTime = performance.now();

// Create cleanup function for long-running processes
export function cleanup() {
  performanceObserver.disconnect();
}
