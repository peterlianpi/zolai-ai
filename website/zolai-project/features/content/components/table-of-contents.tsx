"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(html: string): TocItem[] {
  const regex = /<h([2-4])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;
  const items: TocItem[] = [];
  let match;
  let index = 0;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    if (text) {
      items.push({
        id: `toc-heading-${index++}`,
        text,
        level,
      });
    }
  }
  return items;
}

export function TableOfContents({ contentHtml }: { contentHtml: string }) {
  const items = useMemo(() => extractHeadings(contentHtml), [contentHtml]);
  const [activeId, setActiveId] = useState<string>("");
  const idsInjectedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 || idsInjectedRef.current) return;
    idsInjectedRef.current = true;

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) {
        const allHeadings = document.querySelectorAll(`h${item.level}`);
        allHeadings.forEach((h) => {
          const text = h.textContent?.trim();
          const matchingItem = items.find(
            (i) => i.id === item.id && i.text === text
          );
          if (matchingItem && !h.id) {
            h.id = item.id;
          }
        });
      }
    });
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <h3 className="font-semibold text-sm mb-3">Table of Contents</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-sm py-1 px-2 rounded-md transition-colors hover:text-primary",
                item.level === 3 && "pl-4 text-muted-foreground",
                item.level === 4 && "pl-6 text-muted-foreground text-xs",
                activeId === item.id && "text-primary font-medium bg-primary/5"
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
