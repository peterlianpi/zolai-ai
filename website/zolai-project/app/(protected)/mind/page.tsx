import { Metadata } from "next";
import { MindMap3D } from "@/features/zolai/components/MindMap3D";

export const metadata: Metadata = {
  title: "Mind - Zolai Neural Protocol",
  description: "3D Spatial Memory Protocol and Cognitive Operating System Visualization",
};

export default function MindPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Cognitive Operating System (COS)</h1>
        <p className="text-muted-foreground">Zolai Neural Protocol 3D Sphere of Light</p>
      </div>
      <div className="flex-1 w-full h-[calc(100vh-140px)] min-h-[600px] border border-border rounded-xl overflow-hidden shadow-sm">
        <MindMap3D />
      </div>
    </div>
  );
}
