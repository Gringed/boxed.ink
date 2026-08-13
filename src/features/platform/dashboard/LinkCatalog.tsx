"use client";
import React from "react";
import { Link2, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

// Same favicon source the Twitch/YouTube cards already use, so the catalogue
// shows the real brand marks without shipping a folder of logo assets.
const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

const PLATFORMS = [
  { domain: "twitch.tv", name: "Twitch" },
  { domain: "youtube.com", name: "YouTube" },
  { domain: "instagram.com", name: "Instagram" },
  { domain: "tiktok.com", name: "TikTok" },
  { domain: "x.com", name: "X" },
  { domain: "facebook.com", name: "Facebook" },
  { domain: "snapchat.com", name: "Snapchat" },
  { domain: "discord.com", name: "Discord" },
  { domain: "whatsapp.com", name: "WhatsApp" },
  { domain: "github.com", name: "GitHub" },
  { domain: "patreon.com", name: "Patreon" },
  { domain: "ko-fi.com", name: "Ko-fi" },
  { domain: "buymeacoffee.com", name: "Buy Me a Coffee" },
];

// shrink-0 + whitespace-nowrap matter here: without them the flex line
// compresses the chips to fit and the longer names get clipped by the border.
const chip =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white p-1.5 text-[13px] font-bold leading-none";

export const LinkCatalog = () => {
  const t = useTranslations("editor");

  return (
    <div className="flex flex-wrap gap-1.5">
      {PLATFORMS.map((item) => (
        <span key={item.domain} className={chip}>
          <img
            src={favicon(item.domain)}
            alt=""
            draggable={false}
            className="size-4 select-none rounded object-contain"
          />
          {item.name}
        </span>
      ))}
      {[
        { icon: Link2, name: t("linkAny") },
        { icon: Mail, name: t("linkEmail") },
        { icon: Phone, name: t("linkPhone") },
      ].map(({ icon: Icon, name }) => (
        <span key={name} className={chip}>
          <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-gray-100">
            <Icon size={14} strokeWidth={2.5} className="text-noir/60" />
          </span>
          {name}
        </span>
      ))}
      <span className="flex shrink-0 items-center whitespace-nowrap px-1 text-[13px] font-bold text-noir/45">
        {t("andMore")}
      </span>
    </div>
  );
};
