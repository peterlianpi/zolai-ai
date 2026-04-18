"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brain, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/features/nav/components/theme-toggle";
import { DEFAULT_SITE_NAME } from "@/lib/constants/site";
import type { Menu as MenuType } from "@/features/menus/types";
import type { SiteSetting } from "@/features/settings/api";

const ALL_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Dictionary" },
  { href: "/posts", label: "Posts" },
  { href: "/news", label: "News" },
  { href: "/resources", label: "Resources" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/getting-started", label: "Get Started" },
  { href: "/help", label: "Help" },
];

interface HeaderProps {
  menus?: MenuType[];
  siteSettings?: SiteSetting[];
}

export function Header({ menus = [], siteSettings = [] }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const siteName = siteSettings.find((s) => s.key === "site_name")?.value ?? DEFAULT_SITE_NAME;

  const primaryMenu = menus.find((m) => m.location === "primary");
  const navLinks = primaryMenu?.items?.length
    ? primaryMenu.items
        .filter((i) => i.url)
        .sort((a, b) => a.order - b.order)
        .map((i) => ({ href: i.url as string, label: i.label }))
    : ALL_NAV_LINKS;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkCls = (href: string, mobile = false) =>
    cn(
      "text-sm font-medium rounded-md transition-colors",
      mobile ? "px-3 py-2.5" : "px-3 py-1.5",
      isActive(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-0.5 bg-gradient-to-r from-primary via-amber-400 to-green-500" aria-hidden="true" />
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label={`${siteName} home`}>
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <Brain className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-base">{siteName}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/70">
            ZVS
          </Badge>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 ml-auto mr-4" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkCls(href)}>{label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-8 w-8" asChild aria-label="Search dictionary">
            <Link href="/search"><Search className="h-4 w-4" /></Link>
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/signup">Get Started</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
                      <Brain className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-bold">{siteName}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-0.5" aria-label="Mobile navigation">
                {navLinks.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={linkCls(href, true)}>
                    {label}
                  </Link>
                ))}
                <div className="mt-3 pt-3 border-t flex flex-col gap-2">
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
