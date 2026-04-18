# WordPress-like Block Editor (Gutenberg-Style)

## Current State
The `ContentEditor` uses a plain `<Textarea>` for `contentHtml`. No WYSIWYG, no media insertion, no formatting tools, no blocks.

## Goal
Build a WordPress Gutenberg-like block editor with:
- **Block-based editing** — each paragraph, heading, image, list, embed is an independent block
- **Rich toolbar** — formatting, alignment, colors, typography
- **Media integration** — upload/embed images, videos, galleries from media library
- **Emoji picker** — insert emojis anywhere in text
- **HTML support** — toggle to raw HTML editing per-block or full document
- **Drag & drop** — reorder blocks, drag images in from desktop
- **Block patterns** — pre-built layouts (columns, buttons, spacers, dividers)
- **Reusable blocks** — save and reuse block combinations
- **Auto-save drafts** — never lose work
- **Revision history** — track changes over time
- **Full-screen mode** — distraction-free writing
- **Preview** — see how content renders before publishing

---

## Architecture Decision: Block Editor vs Rich Text

### Option A: Tiptap with Block Extensions (Recommended)
- **Why**: Headless, React-native, block-level nodes via `ReactNodeViewRenderer`
- **Block support**: Each block is a custom Tiptap node with its own UI
- **Gutenberg-like**: Can replicate block toolbar, drag handles, block switcher
- **Bundle**: ~80KB core + extensions
- **License**: MIT

### Option B: BlockNote (Built on Tiptap + ProseMirror)
- **Why**: Purpose-built block editor, Notion-like UI out of the box
- **Block support**: Native block architecture, drag & drop, slash commands
- **Gutenberg-like**: Very close, but more Notion-style than WordPress
- **Bundle**: ~120KB
- **License**: MPL-2.0

### Option C: Lexical (Meta)
- **Why**: Performant, block-level nodes, collaborative editing ready
- **Block support**: Requires custom node implementations
- **Gutenberg-like**: Possible but more work
- **Bundle**: ~60KB
- **License**: MIT

### Option D: React Page Editor (react-page)
- **Why**: Block-based, drag & drop, plugin system
- **Block support**: Native
- **Gutenberg-like**: Yes, but less mature
- **Bundle**: ~200KB
- **License**: MIT

**Recommendation: BlockNote** — it's built on Tiptap/ProseMirror, has native block architecture, slash commands, drag & drop, and emoji support out of the box. Closest to Gutenberg with least custom code.

If you want full Gutenberg parity with custom block UI, use **Tiptap with custom block nodes**.

---

## Implementation Plan

### Phase 1: BlockNote Editor (Core)

#### 1.1 Install Dependencies
```bash
bun add @blocknote/react @blocknote/mantine @blocknote/core
```

#### 1.2 File Structure
```
features/editor/
  components/
    block-editor.tsx           # Main BlockNote editor wrapper
    block-toolbar.tsx          # Custom block formatting toolbar
    block-side-panel.tsx       # Block settings (like WP sidebar)
    block-slash-menu.tsx       # Custom slash command menu
    emoji-picker.tsx           # Emoji picker integration
    html-toggle.tsx            # HTML source view toggle
    block-patterns.tsx         # Pre-built block patterns
  extensions/
    image-block.tsx            # Image block with media library
    embed-block.tsx            # YouTube, Twitter, etc.
    code-block.tsx             # Syntax-highlighted code
    spacer-block.tsx           # Spacing/divider blocks
    columns-block.tsx          # Multi-column layouts
    button-block.tsx           # CTA button blocks
    gallery-block.tsx          # Image gallery grid
    table-block.tsx            # Data tables
  hooks/
    use-auto-save.ts           # Auto-save to server
    use-revisions.ts           # Revision history
  lib/
    block-serializer.ts        # Convert blocks to HTML for storage
    block-parser.ts            # Convert stored HTML back to blocks
    emoji-data.ts              # Emoji list/search
```

#### 1.3 Basic Block Editor
```tsx
// features/editor/components/block-editor.tsx
"use client";

import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState } from "react";
import { BlockToolbar } from "./block-toolbar";
import { BlockSidePanel } from "./block-side-panel";
import { blocksToHTML, htmlToBlocks } from "../lib/block-serializer";

interface BlockEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function BlockEditor({ content, onChange, placeholder }: BlockEditorProps) {
  const [blocks, setBlocks] = useState(() => htmlToBlocks(content));

  const editor = useCreateBlockNote({
    initialContent: blocks,
    uploadFile: async (file) => {
      // Use existing upload API
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.data.url;
    },
  });

  useEffect(() => {
    editor.onChange(() => {
      const html = blocksToHTML(editor.document);
      onChange(html);
    });
  }, [editor, onChange]);

  return (
    <div className="flex gap-4">
      <div className="flex-1 rounded-lg border">
        <BlockToolbar editor={editor} />
        <BlockNoteView
          editor={editor}
          theme="light"
          formattingToolbar={false}
          slashMenu={true}
          placeholder={placeholder}
        />
      </div>
      <BlockSidePanel editor={editor} />
    </div>
  );
}
```

#### 1.4 Block Serializer (Blocks ↔ HTML)
Store as HTML in the database for compatibility with existing `contentHtml` field:
```tsx
// features/editor/lib/block-serializer.ts
import type { Block } from "@blocknote/core";

export function blocksToHTML(blocks: Block[]): string {
  return blocks.map(blockToHTML).join("\n");
}

function blockToHTML(block: Block): string {
  const content = block.content
    ? typeof block.content === "string"
      ? block.content
      : inlineContentToHTML(block.content)
    : "";

  switch (block.type) {
    case "paragraph":
      return `<p>${content}</p>`;
    case "heading":
      return `<h${block.props.level}>${content}</h${block.props.level}>`;
    case "bulletListItem":
      return `<ul><li>${content}</li></ul>`;
    case "numberedListItem":
      return `<ol><li>${content}</li></ol>`;
    case "image":
      return `<img src="${block.props.url}" alt="${block.props.caption || ""}" />`;
    case "codeBlock":
      return `<pre><code class="language-${block.props.language || "text"}">${content}</code></pre>`;
    case "table":
      return tableToHTML(block);
    case "divider":
      return "<hr />";
    default:
      return `<p>${content}</p>`;
  }
}

function inlineContentToHTML(content: unknown): string {
  // Handle bold, italic, links, etc.
  if (Array.isArray(content)) {
    return content.map((item) => {
      let text = item.text || "";
      if (item.bold) text = `<strong>${text}</strong>`;
      if (item.italic) text = `<em>${text}</em>`;
      if (item.underline) text = `<u>${text}</u>`;
      if (item.strikeThrough) text = `<s>${text}</s>`;
      if (item.href) text = `<a href="${item.href}">${text}</a>`;
      if (item.textColor) text = `<span style="color:${item.textColor}">${text}</span>`;
      if (item.backgroundColor) text = `<span style="background-color:${item.backgroundColor}">${text}</span>`;
      return text;
    }).join("");
  }
  return String(content || "");
}

function tableToHTML(block: Block): string {
  const rows = block.content as { cells: unknown[] }[];
  let html = "<table>";
  rows.forEach((row, i) => {
    const tag = i === 0 ? "th" : "td";
    html += "<tr>";
    row.cells.forEach((cell) => {
      html += `<${tag}>${inlineContentToHTML(cell)}</${tag}>`;
    });
    html += "</tr>";
  });
  return html + "</table>";
}

export function htmlToBlocks(html: string): Block[] | undefined {
  if (!html) return undefined;
  // Parse HTML string into BlockNote blocks
  // Use DOMParser or regex-based parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: Block[] = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      blocks.push({ type: "paragraph", content: node.textContent });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      switch (el.tagName.toLowerCase()) {
        case "p":
          blocks.push({ type: "paragraph", content: el.innerHTML });
          break;
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          blocks.push({
            type: "heading",
            props: { level: parseInt(el.tagName[1]) },
            content: el.innerHTML,
          });
          break;
        case "img":
          blocks.push({
            type: "image",
            props: { url: el.getAttribute("src") || "", caption: el.getAttribute("alt") || "" },
          });
          break;
        case "hr":
          blocks.push({ type: "divider" });
          break;
        case "pre":
          const code = el.querySelector("code");
          blocks.push({
            type: "codeBlock",
            props: { language: code?.className?.replace("language-", "") || "text" },
            content: code?.textContent || el.textContent || "",
          });
          break;
        default:
          blocks.push({ type: "paragraph", content: el.outerHTML });
      }
    }
  });

  return blocks.length > 0 ? blocks : undefined;
}
```

---

### Phase 2: Custom Block Types (WordPress Parity)

#### 2.1 Image Block with Media Library
```tsx
// features/editor/extensions/image-block.tsx
import {
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  createReactBlockSpec,
} from "@blocknote/react";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import MediaBrowser from "@/features/content/components/media-browser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const ImageBlock = createReactBlockSpec(
  {
    type: "imageUpload",
    propSchema: {
      url: { default: "" },
      caption: { default: "" },
      alignment: { default: "center" as const },
      width: { default: "100%" },
      mediaId: { default: "" },
    },
    content: "inline",
  },
  {
    render: ({ block, editor }) => {
      const [browserOpen, setBrowserOpen] = useState(false);
      const [editing, setEditing] = useState(false);

      if (!block.props.url) {
        return (
          <Dialog open={browserOpen} onOpenChange={setBrowserOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or select from media library</p>
                <p className="text-xs text-muted-foreground mt-1">or drag & drop an image here</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select Image</DialogTitle>
              </DialogHeader>
              <MediaBrowser
                onSelect={(id, url, alt) => {
                  editor.updateBlock(block, {
                    props: { url, caption: alt || "", mediaId: id },
                  });
                  setBrowserOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        );
      }

      return (
        <div className="group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.props.url}
            alt={block.props.caption}
            className={`rounded-lg w-full object-cover`}
            style={{ maxWidth: block.props.width }}
          />
          {block.props.caption && (
            <p className="text-sm text-muted-foreground text-center mt-2 italic">
              {block.props.caption}
            </p>
          )}
          {/* Block toolbar */}
          <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
            <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setEditing(true)}>
              <ImagePlus className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => {
              editor.updateBlock(block, { props: { url: "", caption: "", mediaId: "" } });
            }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    },
  }
);
```

#### 2.2 Embed Block (YouTube, Twitter, etc.)
```tsx
// features/editor/extensions/embed-block.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMBED_PROVIDERS = [
  { name: "YouTube", pattern: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/ },
  { name: "Twitter/X", pattern: /twitter\.com\/\w+\/status\/(\d+)/ },
  { name: "Vimeo", pattern: /vimeo\.com\/(\d+)/ },
];

function detectProvider(url: string) {
  for (const provider of EMBED_PROVIDERS) {
    const match = url.match(provider.pattern);
    if (match) return { provider: provider.name, id: match[1] };
  }
  return null;
}

export const EmbedBlock = createReactBlockSpec(
  {
    type: "embed",
    propSchema: {
      url: { default: "" },
      provider: { default: "" },
      embedId: { default: "" },
    },
  },
  {
    render: ({ block, editor }) => {
      const [inputUrl, setInputUrl] = useState(block.props.url);

      if (!block.props.url) {
        return (
          <div className="flex gap-2 items-center p-4 rounded-lg border bg-muted/30">
            <Input
              placeholder="Paste YouTube, Twitter, or Vimeo URL..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputUrl) {
                  const detected = detectProvider(inputUrl);
                  if (detected) {
                    editor.updateBlock(block, {
                      props: { url: inputUrl, provider: detected.provider, embedId: detected.id },
                    });
                  }
                }
              }}
            />
            <Button size="sm" onClick={() => {
              const detected = detectProvider(inputUrl);
              if (detected) {
                editor.updateBlock(block, {
                  props: { url: inputUrl, provider: detected.provider, embedId: detected.id },
                });
              }
            }}>Embed</Button>
          </div>
        );
      }

      // Render embed
      if (block.props.provider === "YouTube") {
        return (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${block.props.embedId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }

      return (
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {block.props.provider} embed: {block.props.url}
          </p>
        </div>
      );
    },
  }
);
```

#### 2.3 Spacer/Divider Block
```tsx
// features/editor/extensions/spacer-block.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export const SpacerBlock = createReactBlockSpec(
  {
    type: "spacer",
    propSchema: { height: { default: 24 } },
  },
  {
    render: ({ block, editor }) => (
      <div className="group relative py-2">
        <div style={{ height: `${block.props.height}px` }} className="border-t border-dashed border-muted-foreground/30" />
        <div className="absolute inset-x-0 top-0 hidden group-hover:flex items-center justify-center bg-muted/50 rounded py-1">
          <Slider
            value={[block.props.height]}
            onValueChange={([v]) => editor.updateBlock(block, { props: { height: v } })}
            min={8}
            max={120}
            step={4}
            className="w-32"
          />
          <span className="text-xs text-muted-foreground ml-2">{block.props.height}px</span>
        </div>
      </div>
    ),
  }
);
```

#### 2.4 Columns Block
```tsx
// features/editor/extensions/columns-block.tsx
import { createReactBlockSpec } from "@blocknote/react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export const ColumnsBlock = createReactBlockSpec(
  {
    type: "columns",
    propSchema: {
      columnCount: { default: 2 },
      widths: { default: "50%,50%" },
    },
    content: "inline",
  },
  {
    render: ({ block, editor }) => {
      const widths = block.props.widths.split(",").map(Number);
      return (
        <div className="group relative">
          <div className="flex gap-4">
            {Array.from({ length: block.props.columnCount }).map((_, i) => (
              <div
                key={i}
                className="flex-1 min-h-[60px] rounded border border-dashed p-2"
                style={{ flex: widths[i] || 1 }}
              >
                <p className="text-xs text-muted-foreground text-center">Column {i + 1}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-0 right-0 hidden group-hover:flex gap-1">
            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => {
              const newCount = block.props.columnCount + 1;
              editor.updateBlock(block, {
                props: {
                  columnCount: newCount,
                  widths: Array(newCount).fill(Math.round(100 / newCount)).join(","),
                },
              });
            }}>
              <Plus className="h-3 w-3" />
            </Button>
            {block.props.columnCount > 1 && (
              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => {
                const newCount = block.props.columnCount - 1;
                editor.updateBlock(block, {
                  props: {
                    columnCount: newCount,
                    widths: Array(newCount).fill(Math.round(100 / newCount)).join(","),
                  },
                });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      );
    },
  }
);
```

---

### Phase 3: Emoji Picker

#### 3.1 Install
```bash
bun add emoji-picker-react
```

#### 3.2 Emoji Picker Component
```tsx
// features/editor/components/emoji-picker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditorEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EditorEmojiPicker({ onEmojiSelect }: EditorEmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <EmojiPicker
          onEmojiClick={(data: EmojiClickData) => {
            onEmojiSelect(data.emoji);
          }}
          searchDisabled={false}
          skinTonesDisabled
          width={320}
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
}
```

#### 3.3 Slash Command for Emoji
```tsx
// In BlockNote config
slashMenu: {
  items: [
    ...defaultSlashMenuItems,
    {
      title: "Emoji",
      subtext: "Insert an emoji",
      onItemClick: () => {
        // Open emoji picker at cursor position
      },
      aliases: ["emoji", "smiley", "emoticon"],
      group: "Other",
    },
  ],
}
```

---

### Phase 4: HTML Source Toggle

```tsx
// features/editor/components/html-toggle.tsx
"use client";

import { useState } from "react";
import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { blocksToHTML, htmlToBlocks } from "../lib/block-serializer";
import type { BlockNoteEditor } from "@blocknote/core";

interface HtmlToggleProps {
  editor: BlockNoteEditor;
}

export function HtmlToggle({ editor }: HtmlToggleProps) {
  const [showHtml, setShowHtml] = useState(false);
  const [html, setHtml] = useState("");

  const toggleView = () => {
    if (!showHtml) {
      setHtml(blocksToHTML(editor.document));
    } else {
      const blocks = htmlToBlocks(html);
      if (blocks) editor.replaceBlocks(editor.document, blocks);
    }
    setShowHtml(!showHtml);
  };

  if (showHtml) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">HTML Source</span>
          <Button variant="outline" size="sm" onClick={toggleView}>
            <Code className="h-3 w-3 mr-1" /> Visual Editor
          </Button>
        </div>
        <Textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="font-mono text-sm min-h-[400px]"
        />
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleView}>
      <Code className="h-4 w-4" />
    </Button>
  );
}
```

---

### Phase 5: Block Patterns (Pre-built Layouts)

```tsx
// features/editor/components/block-patterns.tsx
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BlockNoteEditor } from "@blocknote/core";

const PATTERNS = [
  {
    name: "Two Columns",
    description: "Side-by-side content blocks",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "Two Column Layout" },
      { type: "columns", props: { columnCount: 2, widths: "50,50" } },
    ],
  },
  {
    name: "Call to Action",
    description: "Heading + text + button",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "Get Started Today" },
      { type: "paragraph", content: "Join thousands of users who trust our platform." },
      { type: "button", props: { text: "Sign Up Now", url: "#", alignment: "center" } },
    ],
  },
  {
    name: "Image Gallery",
    description: "3-column image grid",
    blocks: [
      { type: "heading", props: { level: 3 }, content: "Gallery" },
      { type: "image", props: { url: "", caption: "" } },
      { type: "image", props: { url: "", caption: "" } },
      { type: "image", props: { url: "", caption: "" } },
    ],
  },
  {
    name: "FAQ Section",
    description: "Question and answer format",
    blocks: [
      { type: "heading", props: { level: 2 }, content: "Frequently Asked Questions" },
      { type: "heading", props: { level: 3 }, content: "Question 1?" },
      { type: "paragraph", content: "Answer 1..." },
      { type: "heading", props: { level: 3 }, content: "Question 2?" },
      { type: "paragraph", content: "Answer 2..." },
    ],
  },
  {
    name: "Divider Section",
    description: "Spacer with horizontal rule",
    blocks: [
      { type: "spacer", props: { height: 32 } },
      { type: "divider" },
      { type: "spacer", props: { height: 32 } },
    ],
  },
];

interface BlockPatternsProps {
  editor: BlockNoteEditor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockPatterns({ editor, open, onOpenChange }: BlockPatternsProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="grid grid-cols-2 gap-3 p-4">
        {PATTERNS.map((pattern) => (
          <Button
            key={pattern.name}
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-4"
            onClick={() => {
              editor.insertBlocks(pattern.blocks, editor.getTextCursorPosition().block, "after");
              onOpenChange(false);
            }}
          >
            <span className="font-medium text-sm">{pattern.name}</span>
            <span className="text-xs text-muted-foreground">{pattern.description}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
```

---

### Phase 6: Auto-Save & Revisions

#### 6.1 Auto-Save Hook
```tsx
// features/editor/hooks/use-auto-save.ts
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export function useAutoSave(
  getHtml: () => string,
  postId: string | null,
  enabled: boolean = true
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const savingRef = useRef(false);

  const save = useCallback(async () => {
    if (savingRef.current || !postId) return;
    savingRef.current = true;

    try {
      const html = getHtml();
      await fetch(`/api/content/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentHtml: html }),
      });
      toast.success("Draft saved");
    } catch {
      toast.error("Failed to save draft");
    } finally {
      savingRef.current = false;
    }
  }, [getHtml, postId]);

  useEffect(() => {
    if (!enabled) return;

    const handler = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(save, 3000);
    };

    document.addEventListener("input", handler);
    return () => {
      document.removeEventListener("input", handler);
      clearTimeout(timerRef.current);
    };
  }, [save, enabled]);

  return save;
}
```

#### 6.2 Revision History
Add to Post model:
```prisma
model Post {
  // ... existing fields
  revisions PostRevision[]
}

model PostRevision {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  content   String   // Full HTML content at this point
  title     String
  createdAt DateTime @default(now())
  authorId  String
  
  @@index([postId, createdAt])
  @@map("post_revision")
}
```

Auto-save creates revision every 5 minutes:
```tsx
// In auto-save hook, create revision periodically
const lastRevisionRef = useRef(Date.now());

if (Date.now() - lastRevisionRef.current > 5 * 60 * 1000) {
  await fetch(`/api/content/posts/${postId}/revision`, {
    method: "POST",
    body: JSON.stringify({ contentHtml: html, title }),
  });
  lastRevisionRef.current = Date.now();
}
```

---

### Phase 7: ContentEditor Integration

Replace the `<Textarea>` in `content-editor.tsx`:
```tsx
// In content-editor.tsx
import { BlockEditor } from "@/features/editor/components/block-editor";

<FormField
  control={form.control}
  name="contentHtml"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Content</FormLabel>
      <FormControl>
        <BlockEditor
          content={field.value ?? ""}
          onChange={field.onChange}
          placeholder="Start writing or type / for commands..."
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### Phase 8: Public Page Rendering

```tsx
// app/(public)/posts/[slug]/page.tsx
import { sanitizeHtml } from "@/lib/sanitize";

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  const safeHtml = sanitizeHtml(post.contentHtml);

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <h1>{post.title}</h1>
      {post.excerpt && <p className="lead">{post.excerpt}</p>}
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </article>
  );
}
```

---

## Block Types Reference (WordPress Parity)

| WordPress Block | Our Block | Status |
|-----------------|-----------|--------|
| Paragraph | `paragraph` | Built-in |
| Heading | `heading` | Built-in |
| Image | `imageUpload` | Custom |
| Gallery | `gallery` | Custom |
| List (bullet) | `bulletListItem` | Built-in |
| List (numbered) | `numberedListItem` | Built-in |
| Quote | `quote` | Built-in |
| Code | `codeBlock` | Built-in |
| Embed (YouTube, etc.) | `embed` | Custom |
| Table | `table` | Built-in |
| Columns | `columns` | Custom |
| Spacer | `spacer` | Custom |
| Separator | `divider` | Built-in |
| Button | `button` | Custom |
| File | `file` | Custom |
| Video | `video` | Custom |
| Audio | `audio` | Custom |
| Details (accordion) | `details` | Custom |
| Pullquote | `pullquote` | Custom |
| Verse | `verse` | Custom |
| Preformatted | `preformatted` | Built-in |

---

## File Structure (Complete)

```
features/editor/
  components/
    block-editor.tsx           # Main BlockNote wrapper
    block-toolbar.tsx          # Formatting toolbar
    block-side-panel.tsx       # Block settings sidebar
    block-patterns.tsx         # Pre-built layout patterns
    emoji-picker.tsx           # Emoji picker popover
    html-toggle.tsx            # HTML source view
    revision-history.tsx       # Revision browser
  extensions/
    image-block.tsx            # Image with media library
    embed-block.tsx            # YouTube/Twitter/Vimeo
    spacer-block.tsx           # Adjustable spacer
    columns-block.tsx          # Multi-column layout
    button-block.tsx           # CTA button
    gallery-block.tsx          # Image grid
    details-block.tsx          # Accordion/collapsible
    pullquote-block.tsx        # Styled pullquote
  hooks/
    use-auto-save.ts           # Auto-save drafts
    use-revisions.ts           # Revision management
  lib/
    block-serializer.ts        # Blocks ↔ HTML conversion
    emoji-data.ts              # Emoji categories/search
app/
  (public)/posts/[slug]/
    page.tsx                   # Render with sanitizeHtml
  (public)/news/[slug]/
    page.tsx                   # Render with sanitizeHtml
lib/
  sanitize.ts                  # DOMPurify wrapper
prisma/
  schema.prisma                # Add PostRevision model
```

---

## Implementation Priority

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| 1. BlockNote core | Medium | Critical | Start here |
| 2. Custom blocks (image, embed, spacer, columns) | High | High | Next |
| 3. Emoji picker | Low | Medium | Quick win |
| 4. HTML toggle | Low | High | Do with Phase 1 |
| 5. Block patterns | Medium | Medium | After Phase 2 |
| 6. Auto-save + revisions | Medium | High | Do with Phase 1 |
| 7. ContentEditor integration | Low | Critical | Do with Phase 1 |
| 8. Public rendering + sanitization | Low | Critical | Do with Phase 1 |

---

## Recommendations

1. **Use BlockNote** — closest to Gutenberg with least custom code, built on ProseMirror/Tiptap
2. **Store as HTML** in `contentHtml` — backward compatible, renders anywhere, easy migration
3. **Always sanitize** — DOMPurify on server-side before rendering
4. **Auto-save every 3 seconds** — debounced, non-blocking
5. **Revisions every 5 minutes** — not on every keystroke
6. **Emoji picker in toolbar** — accessible from any text block
7. **Slash commands** — type `/` to insert any block (Gutenberg-style)
8. **Drag & drop images** — from desktop directly into editor
9. **Responsive toolbar** — collapse to dropdown on mobile
10. **Myanmar font support** — ensure editor font supports Myanmar Unicode characters
11. **Keyboard shortcuts** — Cmd+B/I/U, Cmd+K for links, Cmd+Shift+X for code
12. **Block navigation** — arrow keys between blocks, Cmd+Shift+D to duplicate
13. **Undo/redo** — built into BlockNote, expose in toolbar
14. **Word count** — in footer, update on every change
15. **Preview mode** — render with prose classes in a modal before publishing

---

## Missing Features & Improvements

### Content Organization

#### 1. Categories & Tags UI (Taxonomy Integration)
The schema has `Term` and `Taxonomy` models but no editor UI. Add a sidebar panel:
```tsx
// features/editor/components/taxonomy-panel.tsx
// - Checkbox tree for categories (hierarchical)
// - Tag input with autocomplete for tags (flat)
// - "Add new category" inline form
// - Most-used tags quick-select
```

#### 2. Translation Workflow
We have `locale` and `translationGroup` on Post but no UI:
```tsx
// features/editor/components/translation-panel.tsx
// - Show linked translations (EN ↔ MY)
// - "Create translation" button opens new editor with same group
// - Side-by-side comparison view
// - Translation progress indicator
```

#### 3. Internal Linking Helper
WordPress has a link picker that searches existing content:
```tsx
// features/editor/components/internal-link-picker.tsx
// - Search posts/pages by title
// - Auto-complete as you type
// - Shows post type badge and date
// - Inserts clean URL (not raw link)
```

#### 4. Table of Contents Generator
Auto-generate from heading blocks:
```tsx
// features/editor/extensions/toc-block.tsx
// - Scans document for headings
// - Renders clickable TOC with nested levels
// - Auto-updates when headings change
// - Option to show/hide on public page
```

### SEO & Publishing

#### 5. SEO Meta Panel
WordPress has Yoast/RankMath-style SEO analysis:
```tsx
// features/editor/components/seo-panel.tsx
// - Meta title (with character count, 60 max)
// - Meta description (with character count, 160 max)
// - Focus keyword analysis
// - Open Graph image selector
// - Canonical URL override
// - Schema markup type selector (Article, NewsArticle, BlogPosting)
// - SEO score indicator (red/yellow/green)
```

#### 6. Content Scheduling
WordPress has "Publish immediately" vs "Schedule for later":
```tsx
// In ContentEditor publish panel
// - Date/time picker for future publish
// - "Schedule" button instead of "Publish"
// - Cron job or server-side check for scheduled posts
// - Show scheduled status badge in admin table
```

#### 7. Social Preview Card
Show how the post looks when shared:
```tsx
// features/editor/components/social-preview.tsx
// - Facebook preview (large image + title + description)
// - Twitter/X preview (summary card)
// - Live preview updates as you edit title/excerpt/image
// - Toggle between Facebook and Twitter views
```

### Content Quality

#### 8. Reading Time Estimate
Auto-calculate and display:
```tsx
// features/editor/components/editor-footer.tsx
// Words: 1,234 | Reading time: ~5 min
// Formula: words / 200 (average reading speed)
```

#### 9. Content Outline Navigator
Sidebar showing heading structure (like Word's Navigation pane):
```tsx
// features/editor/components/content-outline.tsx
// - Tree view of all headings (H1 → H6)
// - Click to scroll to that section
// - Drag to reorder sections (moves blocks)
// - Shows which sections are empty
```

#### 10. Accessibility Checker
Real-time accessibility warnings:
```tsx
// features/editor/components/a11y-checker.tsx
// - Images missing alt text
// - Heading hierarchy skips (H1 → H3 without H2)
// - Links with non-descriptive text ("click here")
// - Low contrast text warnings
// - Table without headers
```

#### 11. Footnotes Support
Academic/research content needs footnotes:
```tsx
// features/editor/extensions/footnote-block.tsx
// - Insert footnote at cursor
// - Auto-numbered
// - Renders as superscript in editor
// - Collects all footnotes at end of document
// - Renders as proper <aside> or <ol> on public page
```

### Editor UX

#### 12. Content Templates
Save and reuse entire post structures:
```tsx
// features/editor/components/template-picker.tsx
// - "Save as template" button
// - Template gallery with previews
// - Pre-built: Review template, News template, Tutorial template
// - Templates include block structure + placeholder text
// - Stored in DB or localStorage
```

#### 13. Revision Diff Viewer
Visual comparison between revisions:
```tsx
// features/editor/components/revision-diff.tsx
// - Side-by-side or inline diff
// - Added text in green, removed in red
// - Block-level diff (not just character-level)
// - "Restore this revision" button
// - Who made the change + when
```

#### 14. Focus/Distraction-Free Mode
Full-screen writing experience:
```tsx
// features/editor/components/focus-mode.tsx
// - Hides sidebar, toolbar, admin chrome
// - Centered content column (max-width: 720px)
// - Subtle background color
// - Escape to exit
// - Optional: typewriter mode (current line centered)
```

#### 15. Performance Optimizations
For long-form content:
```tsx
// - Virtualize blocks (only render visible blocks)
// - Lazy-load images in editor (placeholder until scrolled into view)
// - Debounce onChange handler (100ms)
// - Web Worker for HTML sanitization
// - Split large documents into sections
```

### Advanced Features

#### 16. Collaborative Editing (Future)
Real-time multi-user editing:
```tsx
// - Use Yjs + Hocuspocus (WebSocket CRDT)
// - Show cursor positions of other users
// - Color-coded user avatars
// - Conflict resolution
// - Requires WebSocket server
```

#### 17. Import/Export
Move content in and out:
```tsx
// features/editor/lib/import-export.ts
// - Export as WordPress WXR (XML)
// - Export as Markdown
// - Export as JSON (BlockNote native format)
// - Import from WordPress WXR
// - Import from Markdown
// - Import from Google Docs (via copy-paste)
```

#### 18. Custom CSS Per Post
Advanced styling without touching theme:
```tsx
// features/editor/components/custom-css.tsx
// - Textarea for post-specific CSS
// - Scoped to article ID to avoid conflicts
// - Syntax highlighting (CodeMirror)
// - Live preview of CSS changes
// - Warning: "Custom CSS may break on theme changes"
```

#### 19. Content Warnings & Age Gates
```tsx
// features/editor/components/content-settings.tsx
// - "This content contains sensitive material" toggle
// - Age verification required (18+)
// - Spoiler/blur overlay on public page
// - Custom warning message
```

#### 20. Analytics in Editor
Show performance data while editing:
```tsx
// features/editor/components/post-analytics.tsx
// - View count (from view tracking feature)
// - Average time on page
// - Bounce rate
// - Top referrers
// - "This post is trending" badge
```

---

## Improvement Roadmap

### Quick Wins (1-2 days each)
1. Reading time estimate
2. Social preview card
3. Internal linking helper
4. Focus mode
5. Emoji picker (already planned)

### Medium Effort (3-5 days each)
6. SEO meta panel
7. Content outline navigator
8. Categories & tags UI
9. Content templates
10. Accessibility checker
11. Table of contents generator
12. Revision diff viewer
13. Content scheduling

### Large Effort (1-2 weeks each)
14. Translation workflow UI
15. Import/Export (WordPress, Markdown)
16. Footnotes support
17. Custom CSS per post
18. Analytics dashboard in editor
19. Performance optimizations (virtualization)

### Future/Optional
20. Collaborative editing (requires infrastructure)
21. AI writing assistant (integration with LLM API)
22. Auto-translations (machine translation)
23. Content scoring (readability, SEO score)

---

## AI Writing Assistant (Bonus)

Future integration with AI for content generation:
```tsx
// features/editor/components/ai-assistant.tsx
// - "Continue writing" from cursor position
// - "Rewrite this paragraph" (tone: formal, casual, technical)
// - "Generate summary/excerpt" from content
// - "Suggest SEO keywords" from content
// - "Translate to Myanmar" from English
// - "Fix grammar and spelling"
// - Requires API key for LLM service
// - Rate-limited to prevent abuse
```

---

## Testing Strategy

### Unit Tests
- Block serializer (blocks → HTML, HTML → blocks)
- Sanitization (XSS prevention)
- Emoji picker integration
- Auto-save debouncing

### Integration Tests
- Full editor lifecycle (create → edit → save → render)
- Image upload flow (select → upload → insert → save)
- Revision creation and restoration
- HTML toggle round-trip (visual → HTML → visual)

### E2E Tests (Playwright)
- Create a post with multiple block types
- Reorder blocks via drag & drop
- Insert image from media library
- Toggle HTML view and edit raw HTML
- Auto-save triggers and persists
- Preview renders correctly on public page
- Revision history shows changes
