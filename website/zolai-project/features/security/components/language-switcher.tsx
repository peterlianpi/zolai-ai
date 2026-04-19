"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, locales, localeNames } from "@/lib/i18n-client";

export function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => changeLocale(lang)}
            className={locale === lang ? "bg-accent" : ""}
          >
            {localeNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Alternative compact language switcher for mobile/small spaces
export function CompactLanguageSwitcher() {
  const { locale, changeLocale } = useLocale();
  
  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'my' : 'en';
    changeLocale(nextLocale);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} className="h-8 px-2">
      <span className="text-xs font-medium">
        {locale === 'en' ? 'မြန်မာ' : 'EN'}
      </span>
    </Button>
  );
}