"use client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type SocialPlatformKey = "instagram" | "tiktok";

const BRAND: Record<SocialPlatformKey, string> = {
  instagram: "#E4405F",
  tiktok: "#FE2C55",
};

export const isSocialConnectEnabled = (platform: SocialPlatformKey) =>
  platform !== "tiktok" || process.env.NEXT_PUBLIC_TIKTOK_CONNECT === "on";

// Offered right after a profile link is added, and again from the block's
// action bar. Connecting is entirely optional: declining just leaves a
// regular link block, which is why "maybe later" is a plain dismiss rather
// than something that has to be remembered or undone.
export const SocialConnectDialog = ({
  platform,
  open,
  onOpenChange,
}: {
  platform: SocialPlatformKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslations("editor");
  if (!platform) return null;

  const label =
    platform === "instagram" ? t("connectInstagram") : t("connectTiktok");
  const hint =
    platform === "instagram"
      ? t("connectInstagramHint")
      : t("connectTiktokHint");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{hint}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("maybeLater")}
          </Button>
          <a
            href={`/api/auth/${platform}`}
            style={{ backgroundColor: BRAND[platform] }}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <PlatformLogo platform={platform} className="size-5" />
            {label}
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PlatformLogo = ({
  platform,
  className,
}: {
  platform: SocialPlatformKey;
  className?: string;
}) => (
  <img
    src={`https://www.google.com/s2/favicons?sz=64&domain=${platform}.com`}
    alt={platform}
    draggable={false}
    className={`${className} object-contain select-none`}
  />
);

// Trigger inside a block's action bar, replacing the text colour control on
// an unconnected Instagram/TikTok block.
export const SocialConnectButton = ({
  platform,
  onClick,
}: {
  platform: SocialPlatformKey;
  onClick: () => void;
}) => {
  const t = useTranslations("editor");
  const label =
    platform === "instagram" ? t("connectInstagram") : t("connectTiktok");
  return (
    <button
      type="button"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      title={label}
      style={{ color: BRAND[platform] }}
      // Matches the colour pill it sits next to: same white background,
      // border, shadow and vertical padding, so the two read as one row.
      className="flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-bold whitespace-nowrap shadow transition-colors hover:bg-gray-50"
    >
      <PlatformLogo platform={platform} className="size-4" />
      {label}
    </button>
  );
};

// Same pill as the connect button so the two read as one control that
// toggles state, rather than a prominent "connect" and a barely-there
// "disconnect".
export const SocialDisconnectButton = ({
  platform,
  onClick,
}: {
  platform: SocialPlatformKey;
  onClick: () => void;
}) => {
  const t = useTranslations("editor");
  return (
    <button
      type="button"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      title={t("disconnect")}
      className="flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-bold text-noir/60 whitespace-nowrap shadow transition-colors hover:bg-gray-50 hover:text-noir"
    >
      <PlatformLogo platform={platform} className="size-4" />
      {t("disconnect")}
    </button>
  );
};
