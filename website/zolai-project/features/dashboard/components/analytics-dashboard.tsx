"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isDesktop } from "@/lib/runtime";

type AnalyticsPayload = {
  kg: { nodeCount: number; edgeCount: number; chunkCount: number };
  datasetAnalytics: unknown | null;
};

type DatasetAnalyticsFile = {
  path?: string;
  exists?: boolean;
  sampledRows?: number;
  textStats?: { count?: number; avg_len?: number; forbidden_hits?: Record<string, number> };
};

type DatasetAnalyticsReport = {
  generatedAt?: string;
  sampleLimit?: number;
  files?: Record<string, DatasetAnalyticsFile>;
};

async function invokeDesktopRunKgBuild(): Promise<void> {
  const w = window as unknown as { __TAURI__?: { core?: { invoke?: (cmd: string, args?: unknown) => Promise<unknown> } } };
  const invoke = w.__TAURI__?.core?.invoke;
  if (!invoke) throw new Error("Tauri invoke unavailable");
  await invoke("run_kg_build_stream");
}

export function AnalyticsDashboard() {
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isDesktop()) return;
    const w = window as unknown as {
      __TAURI__?: {
        event?: { listen?: (event: string, cb: (e: { payload: unknown }) => void) => Promise<() => void> };
      };
    };
    const listen = w.__TAURI__?.event?.listen;
    if (!listen) return;

    let unlistenLog: null | (() => void) = null;
    let unlistenDone: null | (() => void) = null;

    (async () => {
      unlistenLog = await listen("kg_build:log", (e) => {
        const line = typeof e.payload === "string" ? e.payload : JSON.stringify(e.payload);
        setLogs((prev) => [...prev, line].slice(-500));
      });
      unlistenDone = await listen("kg_build:done", () => {
        setRunning(false);
      });
    })().catch(() => {});

    return () => {
      try { unlistenLog?.(); } catch {}
      try { unlistenDone?.(); } catch {}
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch("/api/zolai/analytics/report", { cache: "no-store" });
        const json = (await res.json()) as { data?: AnalyticsPayload; message?: string };
        if (!cancelled) setPayload(json.data ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load analytics");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const datasetSummary = useMemo(() => {
    const d = payload?.datasetAnalytics as DatasetAnalyticsReport | null;
    if (!d?.files) return [];
    return Object.keys(d.files);
  }, [payload]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">KG + dataset reports (local-first)</p>
        </div>

        {isDesktop() && (
          <button
            type="button"
            disabled={running}
            onClick={async () => {
              try {
                setRunning(true);
                setLogs([]);
                await invokeDesktopRunKgBuild();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to start KG build");
              } finally {
                // running will be cleared by the "kg_build:done" event (desktop)
                if (!isDesktop()) setRunning(false);
              }
            }}
            className="text-xs px-3 py-2 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50"
          >
            {running ? "Running…" : "Run KG build (desktop)"}
          </button>
        )}
      </div>

      {error && (
        <Card>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className="text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>KG Nodes</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{payload?.kg.nodeCount?.toLocaleString() ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>KG Edges</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{payload?.kg.edgeCount?.toLocaleString() ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>RAG Chunks</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{payload?.kg.chunkCount?.toLocaleString() ?? "—"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Dataset report
            {payload?.datasetAnalytics ? <Badge variant="secondary">loaded</Badge> : <Badge variant="outline">not found</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {!payload?.datasetAnalytics && (
            <div className="text-muted-foreground">
              Run: <code>python scripts/maintenance/analytics/build_reports.py</code> then refresh.
            </div>
          )}
          {payload?.datasetAnalytics && (
            <div className="space-y-1">
              <div className="text-muted-foreground">Sections:</div>
              <ul className="list-disc pl-5">
                {datasetSummary.map((k) => (
                  <li key={k}><code>{k}</code></li>
                ))}
              </ul>
              <details className="mt-3">
                <summary className="cursor-pointer text-muted-foreground">Raw JSON</summary>
                <pre className="mt-2 p-3 rounded-md bg-muted overflow-auto text-xs">
                  {JSON.stringify(payload.datasetAnalytics, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {isDesktop() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              KG build logs
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-xs px-2 py-1 rounded-md border border-border bg-background hover:bg-muted"
              >
                Clear
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-3 rounded-md bg-muted overflow-auto text-xs whitespace-pre-wrap">
              {logs.length ? logs.join("\n") : "No logs yet."}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

