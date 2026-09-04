"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import SpriteText from "three-spritetext";
import * as THREE from "three";

// Dynamically import to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

// Graph data interfaces
interface GraphNode {
  id: string;
  group: number;
  val: number;
  color: string;
  desc: string;
  fx?: number;
  fy?: number;
  fz?: number;
  lat?: number; // degrees
  lon?: number; // degrees
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const BREADCRUMB_KEY = "zolai:mind:breadcrumbs:v1";

function getRadiusForGroup(group: number): number {
  switch (group) {
    case 1:
      return 60;
    case 2:
      return 120;
    case 3:
      return 200;
    default:
      return 160;
  }
}

function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

function latLonToVec3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  // lat: -90..90, lon: -180..180
  const lat = degToRad(latDeg);
  const lon = degToRad(lonDeg);
  const y = radius * Math.sin(lat);
  const r = radius * Math.cos(lat);
  const x = r * Math.cos(lon);
  const z = r * Math.sin(lon);
  return new THREE.Vector3(x, y, z);
}

function getGravityForGroup(group: number): number {
  switch (group) {
    case 1:
      return 1.0;
    case 2:
      return 0.5;
    case 3:
      return 0.1;
    default:
      return 0.2;
  }
}

function getVectorForGroup(group: number): [number, number, number] {
  // X: Professional/Technical(-1) <-> Cultural/Personal(+1)
  // Y: Historical(-1) <-> Future(+1)
  // Z: Relational gravity (0..1)
  const z = getGravityForGroup(group);
  if (group === 1) return [-0.2, 0.3, z];
  if (group === 2) return [-0.7, 0.2, z];
  return [0.1, -0.1, z];
}

function addSphereRing(scene: THREE.Scene, radius: number, color: string, opacity: number): THREE.Object3D {
  const geo = new THREE.SphereGeometry(radius, 64, 32);
  const mat = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return mesh;
}

function createLine(points: THREE.Vector3[], color: string, opacity: number): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geo, mat);
}

function addLonLatGrid(
  scene: THREE.Scene,
  radius: number,
  color: string,
  opacity: number,
  opts?: { meridians?: number; parallels?: number; segments?: number },
): THREE.Object3D {
  const meridians = opts?.meridians ?? 24; // longitude lines
  const parallels = opts?.parallels ?? 12; // latitude circles (excluding poles)
  const segments = opts?.segments ?? 256;

  const group = new THREE.Group();

  // Parallels: circles around Y-axis at different latitudes
  for (let i = 1; i <= parallels; i += 1) {
    const lat = (i / (parallels + 1)) * Math.PI - Math.PI / 2; // (-pi/2, +pi/2)
    const y = radius * Math.sin(lat);
    const r = radius * Math.cos(lat);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= segments; s += 1) {
      const t = (s / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(t), y, r * Math.sin(t)));
    }
    group.add(createLine(pts, color, opacity));
  }

  // Meridians: great circles passing through poles (rotate around Y)
  for (let i = 0; i < meridians; i += 1) {
    const lon = (i / meridians) * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= segments; s += 1) {
      const phi = (s / segments) * Math.PI; // 0..pi
      const x0 = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);
      const z0 = 0;
      const x = x0 * Math.cos(lon) - z0 * Math.sin(lon);
      const z = x0 * Math.sin(lon) + z0 * Math.cos(lon);
      pts.push(new THREE.Vector3(x, y, z));
    }
    group.add(createLine(pts, color, opacity));
  }

  scene.add(group);
  return group;
}

// Default graph is used as a fallback while the KG loads.
const defaultGraphData: GraphData = {
  nodes: [
    // Inner Sphere (Core: 1.0 Gravity)
    { id: "Peter", group: 1, val: 20, color: "#ffffff", desc: "Origin (0,0,0) - Zolai Innovator" },
    { id: "Global Net", group: 1, val: 10, color: "#4ade80", desc: "Professional Core" },
    { id: "Zolai Language", group: 1, val: 15, color: "#facc15", desc: "Linguistic Core" },
    { id: "2026 Goals", group: 1, val: 10, color: "#60a5fa", desc: "Future Core" },

    // Mid-Sphere (Gravity: 0.5)
    { id: "Next.js", group: 2, val: 8, color: "#9ca3af", desc: "Tech Stack" },
    { id: "PostgreSQL", group: 2, val: 8, color: "#9ca3af", desc: "Tech Stack" },
    { id: "Cursor Pro", group: 2, val: 8, color: "#9ca3af", desc: "Tools" },
    { id: "UoPeople", group: 2, val: 8, color: "#f87171", desc: "Education" },
    { id: "P-Core Modules", group: 2, val: 10, color: "#a78bfa", desc: "Architecture" },

    // Outer Sphere (Latent/Exploratory: 0.1 Gravity)
    { id: "Market Analysis", group: 3, val: 5, color: "#f472b6", desc: "Crypto/Finance" },
    { id: "Bible Archive", group: 3, val: 6, color: "#d8b4fe", desc: "Genetic Code" },
    { id: "Dictionary", group: 3, val: 6, color: "#d8b4fe", desc: "Genetic Code" },
    { id: "Entrepreneurship", group: 3, val: 7, color: "#fb923c", desc: "Brand Building" },
  ],
  links: [
    // In (Subject - Green), Na/Ah (Location - Blue), Sem/Bawl (Action - Gold)
    { source: "Peter", target: "Global Net", color: "#fbbf24", label: "Sem (Action)" },
    { source: "Peter", target: "Zolai Language", color: "#fbbf24", label: "Bawl (Action)" },
    { source: "Peter", target: "Next.js", color: "#fbbf24", label: "Zang (Action)" },
    { source: "Peter", target: "UoPeople", color: "#60a5fa", label: "Sang ah (Location)" },
    { source: "Zolai Language", target: "Bible Archive", color: "#60a5fa", label: "Sung ah (Location)" },
    { source: "Zolai Language", target: "Dictionary", color: "#60a5fa", label: "Sung ah (Location)" },
    { source: "Peter", target: "2026 Goals", color: "#fbbf24", label: "Ngim (Action)" },
    { source: "Next.js", target: "P-Core Modules", color: "#4ade80", label: "In (Subject)" },
    { source: "PostgreSQL", target: "P-Core Modules", color: "#4ade80", label: "In (Subject)" },
    { source: "Peter", target: "Market Analysis", color: "#fbbf24", label: "En (Action)" },
    { source: "2026 Goals", target: "Entrepreneurship", color: "#fbbf24", label: "Suak (Action)" },
    { source: "Cursor Pro", target: "Next.js", color: "#fbbf24", label: "Zang (Action)" },
  ]
};

// Pre-assign lat/lon so nodes "live on the earth" surface (per sphere group)
const nonOriginNodes = defaultGraphData.nodes.filter((n) => n.id !== "Peter");
nonOriginNodes.forEach((n, idx) => {
  // Spread around globe: latitude bands + rotating longitude
  const count = nonOriginNodes.length;
  const latBands = Math.max(3, Math.ceil(Math.sqrt(count)));
  const band = idx % latBands;
  const row = Math.floor(idx / latBands);
  const lat = -60 + (120 * band) / Math.max(1, latBands - 1); // [-60..60]
  const lon = ((row * 360) / Math.max(1, Math.ceil(count / latBands))) + (band * 25);
  n.lat = lat;
  n.lon = ((lon + 540) % 360) - 180; // normalize to [-180..180]
});

export function MindMap3D() {
  const { resolvedTheme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<GraphData>(defaultGraphData);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(BREADCRUMB_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((x) => typeof x === "string").slice(0, 200);
    } catch {
      return [];
    }
  });

  const breadcrumbSet = useMemo(() => new Set(breadcrumbs), [breadcrumbs]);

  const renderGraphData = useMemo<GraphData>(() => {
    // ForceGraph expects mutable node objects for simulation. To keep React state immutable
    // (and satisfy lint rules), we pass a derived copy for rendering.
    const nodes = graphData.nodes.map((n) => ({ ...n }));
    const links = graphData.links.map((l) => ({ ...l }));

    for (const n of nodes) {
      if (n.id === "Peter") {
        n.fx = 0;
        n.fy = 0;
        n.fz = 0;
        continue;
      }
      const radius = getRadiusForGroup(n.group);
      const lat = typeof n.lat === "number" ? n.lat : 0;
      const lon = typeof n.lon === "number" ? n.lon : 0;
      const pos = latLonToVec3(lat, lon, radius);
      n.fx = pos.x;
      n.fy = pos.y;
      n.fz = pos.z;
    }

    return { nodes, links };
  }, [graphData]);

  useEffect(() => {
    try {
      localStorage.setItem(BREADCRUMB_KEY, JSON.stringify(breadcrumbs.slice(0, 200)));
    } catch {
      // ignore
    }
  }, [breadcrumbs]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/zolai/kg/snapshot", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: GraphData };
        const next = payload?.data;
        if (!next || !Array.isArray(next.nodes) || !Array.isArray(next.links)) return;
        if (!cancelled) setGraphData(next);
      } catch {
        // ignore; fallback graph stays
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;

    let rafId: number | null = null;
    const applySize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const rect = el.getBoundingClientRect();
        setDimensions((prev) => {
          const next = {
            width: Math.max(0, Math.floor(rect.width)),
            height: Math.max(0, Math.floor(rect.height)),
          };
          // Avoid tiny oscillations that can cause ResizeObserver loops
          if (prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });
      });
    };

    applySize();

    const ro = new ResizeObserver(() => applySize());
    ro.observe(el);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  // Note: node positions are fixed via `renderGraphData` (useMemo) to avoid mutating React state.

  useEffect(() => {
    if (!fgRef.current) return;

    // Add inner/mid/outer circle grid + sphere rings once
    const scene: THREE.Scene | undefined = fgRef.current.scene?.();
    if (!scene) return;

    const taggedScene = scene as THREE.Scene & { __zolai_circle_grid__?: boolean };
    if (taggedScene.__zolai_circle_grid__) return;
    taggedScene.__zolai_circle_grid__ = true;

    const isDark = resolvedTheme === "dark";
    const gridColor = isDark ? "#334155" : "#cbd5e1"; // slate-700 / slate-300

    // Inner/Mid/Outer spheres (wireframe rings)
    addSphereRing(scene, 60, gridColor, 0.25);
    addSphereRing(scene, 120, gridColor, 0.18);
    addSphereRing(scene, 200, gridColor, 0.12);

    // Globe grid (longitude/latitude)
    addLonLatGrid(scene, 60, gridColor, isDark ? 0.22 : 0.18, { meridians: 18, parallels: 8, segments: 192 });
    addLonLatGrid(scene, 120, gridColor, isDark ? 0.18 : 0.14, { meridians: 24, parallels: 10, segments: 224 });
    addLonLatGrid(scene, 200, gridColor, isDark ? 0.12 : 0.10, { meridians: 30, parallels: 12, segments: 256 });

    // Light so spheres look “alive”
    const amb = new THREE.AmbientLight(isDark ? 0xffffff : 0xffffff, isDark ? 0.75 : 0.55);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, isDark ? 0.7 : 0.5);
    dir.position.set(80, 120, 140);
    scene.add(dir);

    // Orbit controls: auto spin + mouse zoom/pan
    const controls = fgRef.current.controls?.();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.9;
      controls.panSpeed = 0.6;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.65;
      controls.minDistance = 80;
      controls.maxDistance = 700;
      controls.update();
    }

    // Camera start position
    const camera: THREE.PerspectiveCamera | undefined = fgRef.current.camera?.();
    if (camera) {
      camera.position.set(0, 80, 280);
      camera.lookAt(0, 0, 0);
    }
  }, [resolvedTheme]);

  const backgroundColor = resolvedTheme === "dark" ? "#0f172a" : "#f8fafc"; // slate-900 / slate-50

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm relative"
    >
      <div ref={viewportRef} className="absolute inset-0">
        {typeof window !== "undefined" && dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={renderGraphData}
            backgroundColor={backgroundColor}
            nodeLabel="desc"
            nodeColor="color"
            nodeVal="val"
            linkWidth={1.5}
            linkColor="color"
            linkOpacity={0.6}
            onNodeClick={(node: object) => {
              const n = node as GraphNode;
              setSelectedNode(n);
              setBreadcrumbs((prev) => {
                if (prev[prev.length - 1] === n.id) return prev;
                return [...prev, n.id].slice(-200);
              });
            }}
            onBackgroundClick={() => {
              const controls = fgRef.current?.controls?.();
              if (controls) {
                controls.autoRotate = !controls.autoRotate;
                controls.update();
              }
              setSelectedNode(null);
            }}
            enableNodeDrag={false}
            cooldownTicks={0}
            warmupTicks={0}
            nodeThreeObject={(node: object) => {
              const graphNode = node as GraphNode;
              const sprite = new SpriteText(graphNode.id);
              sprite.color = breadcrumbSet.has(graphNode.id) ? "#f97316" : graphNode.color;
              sprite.textHeight = 8;
              sprite.fontWeight = "bold";
              sprite.position.y = graphNode.val * 0.5 + 4;

              const group = new THREE.Group();

              const geometry = new THREE.SphereGeometry(graphNode.val * 0.5);
              const material = new THREE.MeshLambertMaterial({
                color: graphNode.color,
                transparent: true,
                opacity: 0.8,
              });
              const sphere = new THREE.Mesh(geometry, material);

              group.add(sphere);
              group.add(sprite);

              return group;
            }}
            linkThreeObjectExtend={true}
            linkThreeObject={(link: object) => {
              const graphLink = link as GraphLink;
              if (!graphLink.label) return new THREE.Object3D();

              const sprite = new SpriteText(graphLink.label);
              sprite.color = graphLink.color || "lightgrey";
              sprite.textHeight = 3;
              sprite.fontWeight = "normal";
              return sprite;
            }}
            linkPositionUpdate={(
              sprite: object,
              { start, end }: { start: { x: number; y: number; z: number }; end: { x: number; y: number; z: number } },
            ) => {
              const spriteObj = sprite as THREE.Object3D & { position: { x: number; y: number; z: number } };
              if (!spriteObj) return;
              const startRecord = start as Record<string, number>;
              const endRecord = end as Record<string, number>;
              const middlePos = {
                x: startRecord.x + (endRecord.x - startRecord.x) / 2,
                y: startRecord.y + (endRecord.y - startRecord.y) / 2,
                z: startRecord.z + (endRecord.z - startRecord.z) / 2,
              };

              Object.assign(spriteObj.position, middlePos);
            }}
          />
        )}

        {typeof window !== "undefined" && (dimensions.width === 0 || dimensions.height === 0) && (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-600 dark:text-slate-300">
            Loading 3D view…
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Zolai Neural Protocol</h2>
        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white border border-slate-300"></span> Origin: Peter (0,0,0)</li>
          <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span> Inner Sphere</li>
          <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Mid Sphere</li>
          <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-400"></span> Outer Sphere</li>
          <li className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
            Gold: Sem (Action)<br/>
            Blue: Na/Ah (Location)<br/>
            Green: In (Subject)
          </li>
        </ul>
      </div>

      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 w-[320px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedNode.id}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{selectedNode.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-900/60"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Gravity</span>
              <span className="font-mono">{getGravityForGroup(selectedNode.group).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Vector</span>
              <span className="font-mono">[{getVectorForGroup(selectedNode.group).join(", ")}]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Sphere</span>
              <span className="font-mono">{selectedNode.group === 1 ? "Inner" : selectedNode.group === 2 ? "Mid" : "Outer"}</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Mouse: drag=spin, wheel=zoom, right-drag=pan. Double click background=auto-spin toggle.
            </div>
          </div>
        </div>
      )}

      {/* ForceGraph3D renders inside viewportRef */}
    </div>
  );
}
