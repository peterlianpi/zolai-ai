import { BookMarked, BookOpen, Cpu, GraduationCap, LucideIcon, Mail } from "lucide-react";
import { DEFAULT_SITE_NAME, DEFAULT_SITE_DESCRIPTION } from "@/lib/constants/site";

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const landingConfig = {
  hero: {
    badge: DEFAULT_SITE_NAME,
    title: "The Zomi People's AI Second Brain",
    description: DEFAULT_SITE_DESCRIPTION,
  },
  quickLinks: [
    {
      title: "Language Tutor",
      description: "AI-powered Socratic tutor, A1–C2",
      href: "/tutor",
      icon: GraduationCap,
    },
    {
      title: "Bible Corpus",
      description: "Tedim Zolai Bible aligned with KJV",
      href: "/bible",
      icon: BookMarked,
    },
    {
      title: "Linguistics Wiki",
      description: "Grammar, phonology, morphology",
      href: "/wiki",
      icon: BookOpen,
    },
    {
      title: "AI Training",
      description: "Track fine-tuning runs and datasets",
      href: "/training",
      icon: Cpu,
    },
    {
      title: "Contact",
      description: "Get in touch with the team",
      href: "/contact",
      icon: Mail,
    },
  ] as QuickLink[],
};
