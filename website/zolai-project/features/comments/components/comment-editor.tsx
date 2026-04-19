"use client";

import { JSX, useState } from "react";
import { RichTextEditor } from "@/features/content/components/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface CommentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Allow switching between plain text and rich text mode. Default false for plain text only. */
  allowRichText?: boolean;
  /** Enable rich text by default if allowRichText is true. Default false. */
  defaultRichText?: boolean;
}

/**
 * Comment editor component with optional rich text support
 * Can render as plain textarea or rich text editor based on mode selection
 */
export function CommentEditor({
  value,
  onChange,
  placeholder = "Write your comment...",
  disabled = false,
  className = "",
  allowRichText = false,
  defaultRichText = false,
}: CommentEditorProps): JSX.Element {
  const [useRichText, setUseRichText] = useState(defaultRichText);

  if (allowRichText) {
    return (
      <Tabs
        value={useRichText ? "rich" : "plain"}
        onValueChange={(val) => setUseRichText(val === "rich")}
        className={className}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plain">Plain Text</TabsTrigger>
          <TabsTrigger value="rich">Rich Text</TabsTrigger>
        </TabsList>

        <TabsContent value="plain" className="mt-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className="resize-none"
          />
        </TabsContent>

        <TabsContent value="rich" className="mt-4">
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            minHeightPx={200}
            maxHeightPx={400}
            resizable={true}
            showStats={false}
            showAdvancedFeatures={false}
          />
        </TabsContent>
      </Tabs>
    );
  }

  // Plain text only mode
  return (
    <div className={className}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className="resize-none"
      />
    </div>
  );
}
