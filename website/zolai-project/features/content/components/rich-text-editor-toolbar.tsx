"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Table as TableIcon,
  Code,
  Quote,
  Minus,
  Type,
  Palette,
  AlertCircle,
  Indent,
  Outdent,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MediaBrowser from "@/features/content/components/media-browser";

export interface RichTextEditorToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  showAdvanced?: boolean;
  onImageSelect?: (id: string, url: string, altText: string | null) => void;
  onImageOpenChange?: (open: boolean) => void;
  imageOpen?: boolean;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
  className,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-muted transition-colors shrink-0",
        isActive && "bg-muted text-primary font-semibold",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1 shrink-0" />;
}

function ToolbarGroup({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function RichTextEditorToolbar({
  editor,
  disabled = false,
  showAdvanced = true,
  onImageOpenChange,
  imageOpen = false,
}: RichTextEditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [colorValue, setColorValue] = useState("#000000");
  const [bgColorValue, setBgColorValue] = useState("#FFFFFF");

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleImageSelect = useCallback(
    (_id: string, url: string, altText: string | null) => {
      if (url && editor) {
        editor.chain().focus().setImage({ src: url, alt: altText || "" }).run();
      }
      onImageOpenChange?.(false);
    },
    [editor, onImageOpenChange],
  );

  const handleFontSizeChange = (size: string) => {
    if (!editor) return;
    if (size === "normal") {
      editor
        .chain()
        .focus()
        .setMark("textStyle", { fontSize: null })
        .run();
    } else {
      editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
    }
  };

  const handleTextColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setMark("textStyle", { color }).run();
    setShowColorPicker(false);
  };

  const handleBgColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setMark("highlight", { color }).run();
    setShowBgColorPicker(false);
  };

  if (!editor) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 p-3 border-b bg-muted/30 overflow-x-auto",
        disabled && "pointer-events-none opacity-50",
      )}
      role="toolbar"
    >
      {/* History Group */}
      <ToolbarGroup label="History">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Text Formatting Group */}
      <ToolbarGroup label="Text Formatting">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Heading Group */}
      <ToolbarGroup label="Headings">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Font Size */}
      {showAdvanced && (
        <>
          <div className="flex items-center gap-1">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="normal" onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12px">Small</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="18px">Large</SelectItem>
                <SelectItem value="24px">XL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ToolbarDivider />
        </>
      )}

      {/* Color Picker */}
      {showAdvanced && (
        <>
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
              className="relative"
            >
              <Palette className="h-4 w-4" />
              <div
                className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: colorValue }}
              />
            </ToolbarButton>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-950 border rounded-lg p-2 shadow-lg z-50">
                <div className="flex gap-1 flex-wrap w-40">
                  {[
                    "#000000",
                    "#FFFFFF",
                    "#EF4444",
                    "#F97316",
                    "#EAB308",
                    "#22C55E",
                    "#06B6D4",
                    "#3B82F6",
                    "#8B5CF6",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setColorValue(color);
                        handleTextColor(color);
                      }}
                      title={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <ToolbarButton
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              title="Highlight Color"
              className="relative"
            >
              <div className="w-4 h-4 border-2 border-current flex items-center justify-center">
                <div
                  className="w-2 h-2"
                  style={{ backgroundColor: bgColorValue }}
                />
              </div>
            </ToolbarButton>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-950 border rounded-lg p-2 shadow-lg z-50">
                <div className="flex gap-1 flex-wrap w-40">
                  {[
                    "#FFFF00",
                    "#FFD700",
                    "#FFA500",
                    "#FF6B6B",
                    "#D1F4FF",
                    "#C8E6C9",
                    "#F8D7DA",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setBgColorValue(color);
                        handleBgColor(color);
                      }}
                      title={`Highlight ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <ToolbarDivider />
        </>
      )}

       {/* Lists Group */}
       <ToolbarGroup label="Lists">
         <ToolbarButton
           onClick={() => editor.chain().focus().toggleBulletList().run()}
           isActive={editor.isActive("bulletList")}
           title="Bullet List"
         >
           <List className="h-4 w-4" />
         </ToolbarButton>
         <ToolbarButton
           onClick={() => editor.chain().focus().toggleOrderedList().run()}
           isActive={editor.isActive("orderedList")}
           title="Ordered List"
         >
           <ListOrdered className="h-4 w-4" />
         </ToolbarButton>
         <ToolbarButton
           onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
           disabled={!editor.can().sinkListItem("listItem")}
           title="Indent (Tab)"
         >
           <Indent className="h-4 w-4" />
         </ToolbarButton>
         <ToolbarButton
           onClick={() => editor.chain().focus().liftListItem("listItem").run()}
           disabled={!editor.can().liftListItem("listItem")}
           title="Outdent (Shift+Tab)"
         >
           <Outdent className="h-4 w-4" />
         </ToolbarButton>
         <ToolbarButton
           onClick={() => editor.chain().focus().toggleBlockquote().run()}
           isActive={editor.isActive("blockquote")}
           title="Quote"
         >
           <Quote className="h-4 w-4" />
         </ToolbarButton>
         <ToolbarButton
           onClick={() => editor.chain().focus().setHorizontalRule().run()}
           title="Horizontal Rule"
         >
           <Minus className="h-4 w-4" />
         </ToolbarButton>
       </ToolbarGroup>

      <ToolbarDivider />

      {/* Alignment Group */}
      <ToolbarGroup label="Alignment">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Callout Group */}
      <ToolbarGroup label="Callouts">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              onClick={() => {}}
              title="Insert Callout"
            >
              <AlertCircle className="h-4 w-4" />
            </ToolbarButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => {
                const commands = editor.commands as Record<string, unknown>;
                const insertCallout = commands.insertCallout as ((type: string) => boolean) | undefined;
                if (insertCallout) {
                  insertCallout("info");
                }
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
              Info
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const commands = editor.commands as Record<string, unknown>;
                const insertCallout = commands.insertCallout as ((type: string) => boolean) | undefined;
                if (insertCallout) {
                  insertCallout("warning");
                }
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
              Warning
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const commands = editor.commands as Record<string, unknown>;
                const insertCallout = commands.insertCallout as ((type: string) => boolean) | undefined;
                if (insertCallout) {
                  insertCallout("danger");
                }
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
              Danger
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const commands = editor.commands as Record<string, unknown>;
                const insertCallout = commands.insertCallout as ((type: string) => boolean) | undefined;
                if (insertCallout) {
                  insertCallout("success");
                }
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2 text-green-600" />
              Success
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Media Group */}
      <ToolbarGroup label="Media">
        <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
          <DialogTrigger asChild>
            <ToolbarButton
              onClick={() => {
                setLinkUrl(editor.isActive("link") ? editor.getAttributes("link").href || "" : "");
              }}
              isActive={editor.isActive("link")}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                autoFocus
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
              <Button onClick={setLink}>Insert</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={imageOpen} onOpenChange={onImageOpenChange}>
          <DialogTrigger asChild>
            <ToolbarButton onClick={() => onImageOpenChange?.(true)} title="Insert Image">
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Image</DialogTitle>
            </DialogHeader>
            <MediaBrowser onSelect={handleImageSelect} selectedId={null} />
          </DialogContent>
        </Dialog>

        <ToolbarButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
}
