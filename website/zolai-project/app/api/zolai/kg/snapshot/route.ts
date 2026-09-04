import { NextResponse } from "next/server";

// Category → sphere group + color
const CAT_META: Record<string, { group: number; color: string }> = {
  "Zolai-Language":  { group: 1, color: "#facc15" },  // gold  — inner
  "Zolai-Culture":   { group: 1, color: "#4ade80" },  // green — inner
  "AI-Training":     { group: 2, color: "#60a5fa" },  // blue  — mid
  "Tech-Dev":        { group: 2, color: "#9ca3af" },  // gray  — mid
  "Research":        { group: 2, color: "#a78bfa" },  // purple— mid
  "Bible-Scripture": { group: 3, color: "#d8b4fe" },  // lavender — outer
  "Personal":        { group: 3, color: "#f87171" },  // red   — outer
  "Ideas":           { group: 3, color: "#fb923c" },  // orange— outer
  "Daily-Life":      { group: 3, color: "#94a3b8" },  // slate — outer
};

function spreadLatLon(idx: number, total: number): { lat: number; lon: number } {
  // Fibonacci sphere distribution for even spread
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (idx / Math.max(1, total - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = golden * idx;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((theta * 180) / Math.PI) % 360 - 180;
  return { lat, lon };
}

export async function GET() {
  // Fetch brain from n8n VPS — falls back to empty if unavailable
  let brain: Record<string, Array<{ title: string; summary: string; tags?: string[] }>> = {};

  try {
    const brainUrl = process.env.NEXT_PUBLIC_BRAIN_URL || process.env.BRAIN_URL || "https://n8n.zolai.space/webhook/brain-snapshot";
    const res = await fetch(brainUrl, { next: { revalidate: 60 } });
    if (res.ok) brain = await res.json();
  } catch {
    // use empty brain — globe still renders with default nodes
  }

  const nodes: object[] = [
    { id: "Zolai AI", group: 1, val: 20, color: "#ffffff", desc: "Second Brain Core", fx: 0, fy: 0, fz: 0 },
  ];
  const links: object[] = [];

  // Category hub nodes (inner sphere)
  const cats = Object.keys(brain).filter((c) => brain[c].length > 0);
  cats.forEach((cat) => {
    const meta = CAT_META[cat] ?? { group: 2, color: "#94a3b8" };
    nodes.push({
      id: cat,
      group: meta.group,
      val: 10 + Math.min(brain[cat].length, 20),
      color: meta.color,
      desc: `${cat} — ${brain[cat].length} entries`,
    });
    links.push({ source: "Zolai AI", target: cat, color: meta.color, label: "" });
  });

  // Entry nodes (outer sphere) — max 200 total to keep it fast
  let entryIdx = 0;
  const allEntries: Array<{ cat: string; item: { title: string; summary: string; tags?: string[] } }> = [];
  for (const cat of cats) {
    for (const item of brain[cat]) {
      allEntries.push({ cat, item });
    }
  }

  // Sample evenly if too many
  const maxEntries = 200;
  const step = allEntries.length > maxEntries ? Math.ceil(allEntries.length / maxEntries) : 1;

  for (let i = 0; i < allEntries.length; i += step) {
    const { cat, item } = allEntries[i];
    const meta = CAT_META[cat] ?? { group: 3, color: "#94a3b8" };
    const { lat, lon } = spreadLatLon(entryIdx, Math.min(allEntries.length, maxEntries));
    const nodeId = `${cat}::${item.title.slice(0, 40)}`;

    nodes.push({
      id: nodeId,
      group: 3,
      val: 4,
      color: meta.color,
      desc: item.summary?.slice(0, 120) || item.title,
      lat,
      lon,
    });
    links.push({ source: cat, target: nodeId, color: meta.color + "88", label: "" });
    entryIdx++;
  }

  return NextResponse.json({ data: { nodes, links } });
}
