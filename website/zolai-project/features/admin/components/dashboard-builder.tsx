"use client";

import { useState } from "react";
import {
  GripVertical,
  Plus,
  X,
  Check,
  type LucideIcon,
} from "lucide-react";
import {
  Users,
  Activity,
  FileText,
  Newspaper,
  File,
  Image,
  ArrowLeftRight,
  Loader2,
  LineChart,
  Menu,
} from "lucide-react";
import { StatsCard } from "@/features/dashboard/components/stats-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Users,
  Activity,
  FileText,
  Newspaper,
  File,
  Image,
  ArrowLeftRight,
  LineChart,
  Menu,
};

interface DashboardBuilderProps {
  layout: string[];
  availableCards: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    dataKey: string;
  }>;
  stats: Record<string, number> | undefined;
  isLoading: boolean;
  error: boolean;
  isSaving: boolean;
  onSave: (layout: string[]) => void;
}

export function DashboardBuilder({
  layout,
  availableCards,
  stats,
  isLoading,
  error,
  isSaving,
  onSave,
}: DashboardBuilderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localLayout, setLocalLayout] = useState<string[]>(layout);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedItem === null) return;
    
    const newLayout = [...localLayout];
    const [removed] = newLayout.splice(draggedItem, 1);
    newLayout.splice(dropIndex, 0, removed);
    setLocalLayout(newLayout);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleRemove = (id: string) => {
    setLocalLayout(localLayout.filter((item) => item !== id));
  };

  const handleAdd = (id: string) => {
    if (!localLayout.includes(id)) {
      setLocalLayout([...localLayout, id]);
    }
  };

  const handleSave = () => {
    onSave(localLayout);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalLayout(layout);
    setIsEditing(false);
  };

  const getCardValue = (dataKey: string) => {
    if (!stats) return "...";
    if (dataKey === "systemStatus") return "Active";
    return stats[dataKey] ?? 0;
  };

  const availableToAdd = availableCards.filter(
    (card) => !localLayout.includes(card.id)
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Customize Dashboard
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Current Cards (drag to reorder)</h3>
              <span className="text-sm text-muted-foreground">
                Minimum 3 cards required
              </span>
            </div>
            
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {localLayout.map((cardId, index) => {
                const card = availableCards.find((c) => c.id === cardId);
                if (!card) return null;
                const Icon = ICONS[card.icon];
                
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-3 bg-background cursor-move",
                      dragOverIndex === index && "border-primary ring-2 ring-primary/20"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">
                      {card.title}
                    </span>
                    <button
                      onClick={() => handleRemove(card.id)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            {localLayout.length < 3 && (
              <p className="text-sm text-destructive mt-2">
                At least 3 cards are required. Add more cards below.
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-4">Add Cards</h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {availableToAdd.map((card) => {
                const Icon = ICONS[card.icon];
                return (
                  <button
                    key={card.id}
                    onClick={() => handleAdd(card.id)}
                    className="flex items-center gap-2 rounded-lg border p-3 bg-background hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">
                      {card.title}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
              
              {availableToAdd.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">
                  All available cards are already in your dashboard.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={localLayout.length < 3 || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {localLayout.map((cardId) => {
            const card = availableCards.find((c) => c.id === cardId);
            if (!card) return null;
            const Icon = ICONS[card.icon];
            
            return (
              <StatsCard
                key={card.id}
                title={card.title}
                value={getCardValue(card.dataKey)}
                description={card.description}
                icon={Icon}
                isLoading={isLoading}
                error={!!error}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface QuickActionsBuilderProps {
  layout: string[];
  availableActions: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
  }>;
  isSaving: boolean;
  onSave: (layout: string[]) => void;
}

export function QuickActionsBuilder({
  layout,
  availableActions,
  isSaving,
  onSave,
}: QuickActionsBuilderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localLayout, setLocalLayout] = useState<string[]>(layout);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedItem === null) return;
    
    const newLayout = [...localLayout];
    const [removed] = newLayout.splice(draggedItem, 1);
    newLayout.splice(dropIndex, 0, removed);
    setLocalLayout(newLayout);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleRemove = (id: string) => {
    setLocalLayout(localLayout.filter((item) => item !== id));
  };

  const handleAdd = (id: string) => {
    if (!localLayout.includes(id)) {
      setLocalLayout([...localLayout, id]);
    }
  };

  const handleSave = () => {
    onSave(localLayout);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalLayout(layout);
    setIsEditing(false);
  };

  const availableToAdd = availableActions.filter(
    (action) => !localLayout.includes(action.id)
  );

  const getActionById = (id: string) => availableActions.find((a) => a.id === id);

  return (
    <div>
      {isEditing ? (
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Current Actions (drag to reorder)</h3>
              <span className="text-sm text-muted-foreground">
                Minimum 1 action required
              </span>
            </div>
            
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {localLayout.map((actionId, index) => {
                const action = getActionById(actionId);
                if (!action) return null;
                const Icon = ICONS[action.icon];
                
                return (
                  <div
                    key={action.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-3 bg-background cursor-move",
                      dragOverIndex === index && "border-primary ring-2 ring-primary/20"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">
                      {action.title}
                    </span>
                    <button
                      onClick={() => handleRemove(action.id)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            {localLayout.length < 1 && (
              <p className="text-sm text-destructive mt-2">
                At least 1 action is required. Add more below.
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-4">Add Actions</h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {availableToAdd.map((action) => {
                const Icon = ICONS[action.icon];
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAdd(action.id)}
                    className="flex items-center gap-2 rounded-lg border p-3 bg-background hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">
                      {action.title}
                    </span>
                    <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
              
              {availableToAdd.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">
                  All available actions are already in your quick actions.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={localLayout.length < 1 || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {localLayout.map((actionId) => {
            const action = getActionById(actionId);
            if (!action) return null;
            const Icon = ICONS[action.icon];
            
            return (
              <Link
                key={action.id}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
