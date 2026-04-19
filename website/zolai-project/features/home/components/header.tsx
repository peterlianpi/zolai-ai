"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brain, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/features/nav/components/theme-toggle";
import { DEFAULT_SITE_NAME } from "@/lib/constants/site";
import type { Menu as MenuType } from "@/features/menus/types";
import type { SiteSetting } from "@/features/settings/api";

const LEARN_LINKS = [
  { href: "/search", label: "Dictionary" },
  { href: "/tutor", label: "Tutor" },
  { href: "/grammar", label: "Grammar" },
  { href: "/wiki", label: "Wiki" },
];

const RESOURCES_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/recommended", label: "Recommended" },
  { href: "/getting-started", label: "Get Started" },
];

const COMMUNITY_LINKS = [
  { href: "/community", label: "Community" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
];

// For mobile menu - all links flat
const ALL_NAV_LINKS = [
  { href: "/", label: "Home" },
  ...LEARN_LINKS,
  ...RESOURCES_LINKS,
  ...COMMUNITY_LINKS,
];

interface HeaderProps {
  menus?: MenuType[];
  siteSettings?: SiteSetting[];
}

export function Header({ siteSettings = [] }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const getSetting = (key: string, fallback: string) =>
    siteSettings.find((s) => s.key === key)?.value ?? fallback;

  const siteName = getSetting("site_name", DEFAULT_SITE_NAME);
  const isSticky = getSetting("header_sticky", "true") === "true";
  const showSearch = getSetting("header_show_search", "true") === "true";

  return (
    <header className={cn("z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", isSticky && "sticky top-0")}>
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-bold text-base">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto mr-4">
          <Link
            href="/"
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            Home
          </Link>

          {/* Learn Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-3 py-1.5 h-auto font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                Learn <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {LEARN_LINKS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-3 py-1.5 h-auto font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                Resources <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {RESOURCES_LINKS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-3 py-1.5 h-auto font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                Community <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {COMMUNITY_LINKS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/signup">Get Started</Link>
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-60 p-4">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-bold">{siteName}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {ALL_NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                      pathname === href || (href !== "/" && pathname.startsWith(href))
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    {label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup" onClick={() => setOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
