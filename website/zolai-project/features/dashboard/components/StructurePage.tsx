import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const repoDiagram = `zolai-project/
│
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (about, contact, posts, news)
│   ├── (protected)/              # Auth-gated: dashboard, wiki, bible, tutor, training, chat, admin
│   └── api/[[...route]]/         # Hono catch-all (content, media, chat, …)
│
├── features/                     # Feature-sliced modules
│   ├── content/                  # CMS: ContentEditor, RichTextEditor, media
│   ├── admin/                    # Admin tables & resource flows
│   ├── nav/                      # Sidebar, breadcrumbs
│   ├── dictionary/               # Zolai dictionary lookup
│   ├── grammar/                  # Grammar rule browser
│   └── zolai/                    # Zolai-specific API helpers
│
├── lib/                          # Auth, Prisma, API client, site config, constants
├── prisma/                       # Schema & migrations
└── proxy.ts                      # Next.js request proxy (auth + headers)`;

const editorSteps = [
  {
    title: "Dependencies",
    body: "TipTap packages are declared in package.json (StarterKit, React, Link, Image, Table kit, TextAlign, Underline, Placeholder). The editor runs only in client components.",
  },
  {
    title: "RichTextEditor component",
    body: "features/content/components/rich-text-editor.tsx wires useEditor with immediatelyRender: false for Next.js, syncs HTML with React Hook Form, and exposes a toolbar for lists, headings, alignment, links, images from the media library, and tables.",
  },
  {
    title: "ContentEditor layout",
    body: "features/content/components/content-editor.tsx places the TipTap surface in the main column with title, slug, and excerpt; metadata and featured image sit in a sticky sidebar on large screens.",
  },
  {
    title: "Public rendering",
    body: "Published HTML is rendered with existing prose styles on public post, news, and page routes. Keep markup semantic and avoid pasting untrusted HTML from outside the editor.",
  },
];

const agentWorkflow = [
  {
    role: "ui-agent / content-agent",
    tasks: [
      "Implement TipTap toolbar, dialogs, and layout in ContentEditor.",
      "Match shadcn/Radix patterns (Toggle, Popover, Dialog) for accessibility.",
    ],
  },
  {
    role: "api-agent",
    tasks: [
      "Ensure POST/PATCH content payloads accept contentHtml strings.",
      "Wire /api/chat endpoint to the configured LLM for tutor and chat pages.",
      "Hono chain rule: declare ALL schemas/constants BEFORE new Hono() — nothing between new Hono() and the first .get()/.post() or type inference breaks (client.routeName becomes undefined).",
      "Never use raw fetch('/api/...') in client code — always use the typed Hono RPC client from @/lib/api/client.",
    ],
  },
  {
    role: "prisma-agent",
    tasks: [
      "Manage BibleVerse, WikiEntry, TrainingRun, DatasetStat, DictionaryEntry models.",
      "Post.template and content fields unchanged; edit pages must map template from GET /api/content/posts/:id.",
    ],
  },
  {
    role: "test-agent (when enabled)",
    tasks: [
      "Add Playwright flows: create draft with bold + link + image from library.",
      "Test tutor level/mode switching and chat message flow.",
    ],
  },
];

export function StructurePage() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Architecture Guide</h1>
        <p className="text-muted-foreground max-w-2xl">
          Repository layout, the TipTap-based rich editor pipeline, and how work is split across agents for the Zolai AI project.
        </p>
      </div>

      <Tabs defaultValue="repo" className="w-full gap-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3 h-auto flex-wrap gap-1 sm:flex sm:h-9">
          <TabsTrigger value="repo" className="text-xs sm:text-sm">
            Repository
          </TabsTrigger>
          <TabsTrigger value="editor" className="text-xs sm:text-sm">
            Rich editor
          </TabsTrigger>
          <TabsTrigger value="agents" className="text-xs sm:text-sm">
            Agent workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repo" className="mt-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>High-level map</CardTitle>
              <CardDescription>
                Mirrors the project structure section in README and docs/PROJECT.md, trimmed for the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre rounded-lg border bg-muted/20 p-4 text-xs leading-relaxed font-mono sm:text-sm">
                {repoDiagram}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-0 space-y-4 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>TipTap integration (step by step)</CardTitle>
              <CardDescription>
                End-to-end path from dependencies to the resource form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ol className="list-decimal space-y-4 pl-5 text-sm">
                {editorSteps.map((step) => (
                  <li key={step.title} className="marker:font-semibold">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-muted-foreground leading-relaxed">{step.body}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-0 outline-none">
          <div className="grid gap-4 md:grid-cols-2">
            {agentWorkflow.map((block) => (
              <Card key={block.role}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{block.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {block.tasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
