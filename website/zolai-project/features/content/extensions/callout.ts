import { Node, type NodeViewRenderer } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutNodeView } from "./callout-node-view";

export type CalloutType = "info" | "warning" | "danger" | "success";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

const DEFAULT_OPTIONS: CalloutOptions = {
  HTMLAttributes: {},
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      insertCallout: (type: CalloutType) => ReturnType;
      toggleCallout: (type: CalloutType) => ReturnType;
    };
  }
}

/**
 * Callout extension for TipTap editor
 * Renders admonition/callout blocks with different types and styling
 */
export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "block+",

  draggable: true,

  selectable: true,

  atom: false,

  isolating: true,

  addOptions() {
    return DEFAULT_OPTIONS;
  },

  addAttributes() {
    return {
      type: {
        default: "info" as CalloutType,
        parseHTML: (element) => {
          const type = element.getAttribute("data-type");
          return (["info", "warning", "danger", "success"].includes(type || "") 
            ? type 
            : "info") as CalloutType;
        },
        renderHTML: (attributes) => ({
          "data-type": attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            type: (el.getAttribute("data-type") || "info") as CalloutType,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        "data-callout": "true",
        class: `callout callout-${HTMLAttributes["data-type"]}`,
      },
      ["div", { class: "callout-content" }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView) as unknown as NodeViewRenderer;
  },

  addCommands() {
    return {
      insertCallout:
        (type: CalloutType) =>
        ({ commands }: { commands: Record<string, unknown> }) => {
          const insertContent = commands.insertContent as ((config: unknown) => boolean) | undefined;
          if (insertContent) {
            return insertContent({
              type: "callout",
              attrs: { type },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Callout text goes here",
                    },
                  ],
                },
              ],
            });
          }
          return false;
        },

      toggleCallout:
        (type: CalloutType) =>
        ({ commands }: { commands: Record<string, unknown> }) => {
          const toggleNode = commands.toggleNode as ((name: string, fallback: string, attrs: unknown) => boolean) | undefined;
          if (toggleNode) {
            return toggleNode("callout", "paragraph", { type });
          }
          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => {
        // Keyboard shortcut to insert a callout block
        // The command will be handled by the insertCallout command
        return true;
      },
    };
  },
});
