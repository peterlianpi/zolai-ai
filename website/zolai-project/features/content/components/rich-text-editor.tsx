"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { common, createLowlight } from "lowlight";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";
import { RichTextEditorToolbar } from "@/features/content/components/rich-text-editor-toolbar";
import { Callout } from "@/features/content/extensions/callout";
import { FontSize } from "@/features/content/extensions/font-size";

const lowlight = createLowlight(common);

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  /** Minimum height of the writing area in pixels. Default 320. */
  minHeightPx?: number;
  /** Maximum height of the writing area in pixels (scroll + resize cap). Default 900. */
  maxHeightPx?: number;
  /** Allow vertical resize by dragging the corner handle. Default true. */
  resizable?: boolean;
  showAdvancedFeatures?: boolean;
  showStats?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  disabled = false,
  "aria-invalid": ariaInvalid,
  minHeightPx = 320,
  maxHeightPx = 900,
  resizable = true,
  showAdvancedFeatures = true,
  showStats = true,
}: RichTextEditorProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editorExtensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      codeBlock: false,
      link: false,
      underline: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline",
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full h-auto",
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Underline,
    TextStyle,
    FontSize,
    Color.configure({
      types: ["textStyle"],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Callout,
  ] as unknown as NonNullable<
    Parameters<typeof useEditor>[0]["extensions"]
  >;

  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    immediatelyRender: false,
    editable: !disabled,
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageSelect = useCallback(
    (_id: string, url: string, altText: string | null) => {
      if (url && editor) {
        editor.chain().focus().setImage({ src: url, alt: altText || "" }).run();
      }
      setImageOpen(false);
    },
    [editor],
  );

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-lg border border-input bg-muted/20 animate-pulse",
          className,
        )}
        style={{ minHeight: minHeightPx }}
        aria-hidden
      />
    );
  }

  const characterCount = editor.storage.characterCount?.characters() || 0;
  const wordCount = editor.storage.characterCount?.words() || 0;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  return (
    <div
      className={cn(
        "border rounded-lg bg-background flex flex-col overflow-hidden",
        ariaInvalid && "ring-2 ring-destructive",
        className,
      )}
    >
      {/* Toolbar */}
      <RichTextEditorToolbar
        editor={editor}
        disabled={disabled}
        showAdvanced={showAdvancedFeatures}
        onImageSelect={handleImageSelect}
        onImageOpenChange={setImageOpen}
        imageOpen={imageOpen}
      />

      {/* Preview Toggle */}
      {showStats && (
        <div className="px-3 py-2 border-b bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span>{characterCount} characters</span>
            <span>{wordCount} words</span>
            <span>{readingTime} min read</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-2 py-1 rounded hover:bg-muted transition-colors"
            title="Toggle preview mode"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
      )}

       {/* Writing area or Preview */}
       <div
         className={cn(
           "relative overflow-y-auto border-t border-border bg-background flex-1",
           resizable && !disabled && "resize-y",
           (!resizable || disabled) && "rounded-b-lg",
         )}
         style={{
           minHeight: minHeightPx,
           maxHeight: maxHeightPx,
         }}
       >
         {showPreview ? (
           <div className="prose prose-lg dark:prose-invert max-w-none p-4 [&_img]:rounded-lg [&_img]:max-w-full [&_pre]:bg-slate-900 [&_pre]:text-slate-50 [&_code]:text-sm [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_.callout-wrapper]:my-4 [&_.callout-wrapper]:rounded-lg [&_.callout-wrapper]:p-4 [&_.callout-wrapper]:border-l-4 [&_.callout-info]:bg-blue-50 [&_.callout-info]:dark:bg-blue-950 [&_.callout-info]:border-blue-200 [&_.callout-info]:dark:border-blue-800 [&_.callout-info]:text-blue-900 [&_.callout-info]:dark:text-blue-100 [&_.callout-warning]:bg-yellow-50 [&_.callout-warning]:dark:bg-yellow-950 [&_.callout-warning]:border-yellow-200 [&_.callout-warning]:dark:border-yellow-800 [&_.callout-warning]:text-yellow-900 [&_.callout-warning]:dark:text-yellow-100 [&_.callout-danger]:bg-red-50 [&_.callout-danger]:dark:bg-red-950 [&_.callout-danger]:border-red-200 [&_.callout-danger]:dark:border-red-800 [&_.callout-danger]:text-red-900 [&_.callout-danger]:dark:text-red-100 [&_.callout-success]:bg-green-50 [&_.callout-success]:dark:bg-green-950 [&_.callout-success]:border-green-200 [&_.callout-success]:dark:border-green-800 [&_.callout-success]:text-green-900 [&_.callout-success]:dark:text-green-100">
             <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
           </div>
         ) : (
           <EditorContent
             editor={editor}
             className="prose prose-lg dark:prose-invert max-w-none min-h-full p-4 focus:outline-none [&_.ProseMirror]:outline-none"
           />
         )}
       </div>

      {resizable && !disabled && (
        <div
          className="flex items-center justify-center gap-1.5 rounded-b-lg border border-t-0 border-border bg-muted/25 py-1.5 text-[10px] text-muted-foreground cursor-row-resize"
          aria-hidden
          title="Drag to resize"
        >
          <GripHorizontal className="size-3.5 shrink-0 opacity-70" />
          <span>Drag the corner to resize</span>
        </div>
      )}
    </div>
  );
}
