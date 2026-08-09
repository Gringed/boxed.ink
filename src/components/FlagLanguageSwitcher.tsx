"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleAction } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";

// Emoji flags render as plain "GB"/"FR" text on Windows (no color-flag font
// support there), so we use real flag images instead - consistent with the
// favicon images already hotlinked elsewhere in the app.
const FLAG_COUNTRY_CODE: Record<Locale, string> = {
  en: "gb",
  fr: "fr",
};

const NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

const FlagImg = ({ locale, className }: { locale: Locale; className?: string }) => (
  <img
    src={`https://flagcdn.com/w40/${FLAG_COUNTRY_CODE[locale]}.png`}
    alt={NAMES[locale]}
    draggable={false}
    className={className}
  />
);

export const FlagLanguageSwitcher = ({ bare = false }: { bare?: boolean }) => {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label="Change language"
          className={
            bare
              ? "flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-60"
              : "flex size-8 items-center justify-center rounded-full border bg-white/90 backdrop-blur-xl shadow hover:bg-white transition-colors disabled:opacity-60"
          }
        >
          <FlagImg
            locale={locale}
            className="h-3 w-[18px] rounded-[2px] object-cover"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            className="flex cursor-pointer items-center gap-2"
            onClick={() => startTransition(() => setLocaleAction(l))}
          >
            <FlagImg
              locale={l}
              className="h-3 w-[18px] rounded-[2px] object-cover"
            />
            <span className="text-sm font-medium">{NAMES[l]}</span>
            {l === locale && (
              <Check size={14} className="ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
