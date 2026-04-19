"use client";

import {
  NodeViewWrapper,
  NodeViewContent,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { AlertCircle, AlertTriangle, AlertOctagon, CheckCircle, X } from "lucide-react";
import type { CalloutType } from "./callout";

function isCalloutType(value: unknown): value is CalloutType {
  return (
    value === "info" ||
    value === "warning" ||
    value === "danger" ||
    value === "success"
  );
}

const CALLOUT_CONFIG: Record<CalloutType, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
}> = {
  info: {
    icon: AlertCircle,
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-900 dark:text-blue-100",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-900 dark:text-yellow-100",
    label: "Warning",
  },
  danger: {
    icon: AlertOctagon,
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-900 dark:text-red-100",
    label: "Danger",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-900 dark:text-green-100",
    label: "Success",
  },
};

export function CalloutNodeView({
  node,
  deleteNode,
  updateAttributes,
  editor,
  selected,
}: ReactNodeViewProps): React.ReactElement {
  const isEditable = editor.isEditable;
  const type: CalloutType = isCalloutType(node.attrs.type)
    ? node.attrs.type
    : "info";
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;

  return (
    <NodeViewWrapper
      as="div"
      className={`callout-wrapper my-4 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor} ${config.textColor} p-4 ${
        selected ? "ring-2 ring-offset-2 ring-primary" : ""
      }`}
      data-type={type}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditable && (
            <div className="flex items-center justify-between mb-2">
              <select
                value={type}
                onChange={(e) => updateAttributes({ type: e.target.value as CalloutType })}
                className="text-xs font-semibold px-2 py-1 rounded bg-white/50 dark:bg-black/20 border border-current/20"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
              </select>
              {isEditable && (
                <button
                  type="button"
                  onClick={deleteNode}
                  className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                  title="Delete callout"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <NodeViewContent className="text-sm [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
