import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";

type KgNodeRow = {
  iri: string;
  kind?: string | null;
  label?: string | null;
  description?: string | null;
  properties?: unknown;
  sourceKey?: string | null;
};

type KgEdgeRow = {
  fromIri: string;
  toIri: string;
  predicate: string;
  weight?: number | null;
  confidence?: number | null;
  properties?: unknown;
  sourceKey?: string | null;
};

type RagChunkRow = {
  sourceType: string;
  sourceKey?: string | null;
  sourceRef: string;
  chunkIndex: number;
  content: string;
  contentHash: string;
  tokensApprox?: number | null;
  metadata?: unknown;
  embedding?: unknown;
  embeddingModel?: string | null;
  embeddingDim?: number | null;
  nodeIri?: string | null;
};

function readJsonl<T>(filePath: string): T[] {
  const lines = fs.readFileSync(filePath, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map((l) => JSON.parse(l) as T);
}

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function main() {
  const artifactsDir = process.argv[2] || path.join(process.cwd(), "..", "artifacts", "kg");
  const nodesPath = path.join(artifactsDir, "kg_nodes.jsonl");
  const edgesPath = path.join(artifactsDir, "kg_edges.jsonl");
  const chunksPath = path.join(artifactsDir, "rag_chunks_embedded.jsonl");

  if (!fs.existsSync(nodesPath)) {
    throw new Error(`Missing ${nodesPath}. Run: python scripts/kg/ingest_wiki.py`);
  }
  if (!fs.existsSync(edgesPath)) {
    throw new Error(`Missing ${edgesPath}. Run: python scripts/kg/ingest_wiki.py`);
  }
  if (!fs.existsSync(chunksPath)) {
    throw new Error(`Missing ${chunksPath}. Run: python scripts/kg/embed.py`);
  }

  const nodes = readJsonl<KgNodeRow>(nodesPath);
  const edges = readJsonl<KgEdgeRow>(edgesPath);
  const chunks = readJsonl<RagChunkRow>(chunksPath);

  // 1) Upsert nodes
  for (const n of nodes) {
    await prisma.kgNode.upsert({
      where: { iri: n.iri },
      create: {
        iri: n.iri,
        kind: n.kind ?? null,
        label: n.label ?? null,
        description: n.description ?? null,
        properties: (n.properties ?? {}) as never,
        sourceKey: n.sourceKey ?? "wiki",
      },
      update: {
        kind: n.kind ?? undefined,
        label: n.label ?? undefined,
        description: n.description ?? undefined,
        properties: (n.properties ?? {}) as never,
        sourceKey: n.sourceKey ?? undefined,
      },
    });
  }

  const nodeIdByIri = new Map<string, string>();
  const all = await prisma.kgNode.findMany({ select: { id: true, iri: true } });
  for (const n of all) nodeIdByIri.set(n.iri, n.id);

  // 2) Upsert edges (idempotent)
  for (const e of edges) {
    const fromId = nodeIdByIri.get(e.fromIri);
    const toId = nodeIdByIri.get(e.toIri);
    if (!fromId || !toId) continue;

    await prisma.kgEdge.upsert({
      where: {
        fromId_predicate_toId_sourceKey: {
          fromId,
          predicate: e.predicate,
          toId,
          sourceKey: e.sourceKey ?? "wiki",
        },
      },
      create: {
        fromId,
        toId,
        predicate: e.predicate,
        weight: e.weight ?? 1.0,
        confidence: e.confidence ?? null,
        properties: (e.properties ?? {}) as never,
        sourceKey: e.sourceKey ?? "wiki",
      },
      update: {
        weight: e.weight ?? undefined,
        confidence: e.confidence ?? undefined,
        properties: (e.properties ?? {}) as never,
      },
    });
  }

  // 3) Upsert chunks
  for (const c of chunks) {
    const nodeId = c.nodeIri ? nodeIdByIri.get(c.nodeIri) : undefined;
    const contentHash = c.contentHash || sha256(`${c.sourceRef}\n${c.chunkIndex}\n${c.content}`);
    await prisma.ragChunk.upsert({
      where: { contentHash },
      create: {
        sourceType: c.sourceType,
        sourceKey: c.sourceKey ?? "wiki",
        sourceRef: c.sourceRef,
        chunkIndex: c.chunkIndex,
        content: c.content,
        contentHash,
        tokensApprox: c.tokensApprox ?? null,
        metadata: (c.metadata ?? {}) as never,
        embedding: (c.embedding ?? null) as never,
        embeddingModel: c.embeddingModel ?? null,
        embeddingDim: c.embeddingDim ?? null,
        nodeId: nodeId ?? null,
      },
      update: {
        content: c.content,
        tokensApprox: c.tokensApprox ?? undefined,
        metadata: (c.metadata ?? {}) as never,
        embedding: (c.embedding ?? null) as never,
        embeddingModel: c.embeddingModel ?? undefined,
        embeddingDim: c.embeddingDim ?? undefined,
        nodeId: nodeId ?? undefined,
      },
    });
  }

  const [nodeCount, edgeCount, chunkCount] = await Promise.all([
    prisma.kgNode.count(),
    prisma.kgEdge.count(),
    prisma.ragChunk.count(),
  ]);

  console.log(JSON.stringify({ ok: true, nodeCount, edgeCount, chunkCount }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

