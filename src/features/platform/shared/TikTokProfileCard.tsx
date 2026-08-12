"use client";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount } from "@/lib/youtube";
import type { TikTokProfileData, TikTokVideo } from "@/lib/tiktok";

type LayoutMode = "compact" | "row" | "split" | "full";

const getLayoutMode = (w: number, h: number): LayoutMode => {
  if (w === 4 && h === 1) return "row";
  if (w === 4 && h === 2) return "split";
  if (w === 4 && h === 4) return "full";
  return "compact";
};

const BRAND = "#FE2C55";

interface TikTokProfileCardProps {
  tiktok: TikTokProfileData;
  color?: string;
  w: number;
  h: number;
  // False in the editor, where only the block action buttons may react.
  interactive?: boolean;
}

const TikTokLogo = ({ className }: { className?: string }) => (
  <img
    src="https://www.google.com/s2/favicons?sz=64&domain=tiktok.com"
    alt="TikTok"
    draggable={false}
    className={`${className} object-contain select-none`}
  />
);

const FollowButton = ({
  tiktok,
  size = "sm",
}: {
  tiktok: TikTokProfileData;
  size?: "xs" | "sm" | "md";
}) => {
  const t = useTranslations("editor");
  return (
    <a
      href={tiktok.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ color: BRAND, borderColor: BRAND }}
      className={`shrink-0 flex items-center bg-white border font-bold rounded-full transition-opacity hover:opacity-80 whitespace-nowrap ${
        size === "md"
          ? "text-sm gap-1.5 px-3.5 py-1.5"
          : size === "xs"
          ? "text-[10px] gap-1 px-2 py-0.5"
          : "text-xs gap-1 px-3 py-1"
      }`}
    >
      <TikTokLogo
        className={size === "md" ? "size-4" : size === "xs" ? "size-2.5" : "size-3"}
      />
      {t("follow")}
      {tiktok.followersCount > 0 && (
        <span className="opacity-60">
          · {formatCount(tiktok.followersCount)}
        </span>
      )}
    </a>
  );
};

const ProfileAvatar = ({ tiktok }: { tiktok: TikTokProfileData }) => (
  <Avatar className="size-9 border shrink-0">
    <AvatarFallback>{tiktok.username?.[0]}</AvatarFallback>
    <AvatarImage
      src={tiktok.avatar}
      draggable={false}
      className="object-cover select-none"
      alt={`${tiktok.username} avatar`}
    />
  </Avatar>
);

// The two older clips fan out behind, tilted and scaled down, while the
// newest sits upright and centred on top — so the latest post is what the
// eye lands on. Index 0 is the newest, hence the reversed paint order.
const STACK_STYLES = [
  { translateX: "0%", rotate: 0, scale: 1, z: 30, shadow: "0 10px 24px -8px rgba(0,0,0,0.45)" },
  { translateX: "-46%", rotate: -9, scale: 0.86, z: 20, shadow: "0 6px 16px -8px rgba(0,0,0,0.35)" },
  { translateX: "46%", rotate: 9, scale: 0.86, z: 10, shadow: "0 6px 16px -8px rgba(0,0,0,0.35)" },
];

const VideoStack = ({
  videos,
  className = "flex-1 min-h-0",
  interactive,
}: {
  videos: TikTokVideo[];
  className?: string;
  interactive: boolean;
}) => {
  const shown = (videos || []).slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Painted back-to-front so the newest ends up on top without relying
          on z-index alone across stacking contexts. */}
      {[...shown].reverse().map((video) => {
        const index = shown.indexOf(video);
        const style = STACK_STYLES[index] ?? STACK_STYLES[2];
        const cardStyle = {
          zIndex: style.z,
          boxShadow: style.shadow,
          transform: `translate(-50%, -50%) translateX(${style.translateX}) rotate(${style.rotate}deg) scale(${style.scale})`,
        };
        const cardClass =
          "absolute left-1/2 top-1/2 h-full aspect-[9/16] overflow-hidden rounded-xl border-2 border-white bg-noir/5";
        const cover = (
          <img
            src={video.cover}
            alt={video.title || ""}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover select-none"
          />
        );

        // In the editor these are plain images: a link here would hijack a
        // click meant to select the block, and swallow the drag.
        if (!interactive) {
          return (
            <div key={video.id} style={cardStyle} className={cardClass}>
              {cover}
            </div>
          );
        }

        return (
          <a
            key={video.id}
            href={video.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={cardStyle}
            className={cardClass}
          >
            {cover}
          </a>
        );
      })}
    </div>
  );
};

export const TikTokProfileCard = ({
  tiktok,
  color,
  w,
  h,
  interactive = true,
}: TikTokProfileCardProps) => {
  const mode = getLayoutMode(w, h);
  const nameStyle = { color: color || "black" };
  const shell = "relative z-10 flex h-full w-full p-3 gap-1.5";
  const name = tiktok.username ? `@${tiktok.username}` : tiktok.displayName;

  if (mode === "row") {
    return (
      <div className={`${shell} items-center`}>
        <ProfileAvatar tiktok={tiktok} />
        <span className="text-sm font-bold truncate flex-1" style={nameStyle}>
          {name}
        </span>
        <FollowButton tiktok={tiktok} />
      </div>
    );
  }

  if (mode === "split") {
    return (
      <div className={`${shell} flex-row`}>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <ProfileAvatar tiktok={tiktok} />
          <span className="text-sm font-bold truncate w-full" style={nameStyle}>
            {name}
          </span>
          <div className="mt-auto flex">
            <FollowButton tiktok={tiktok} />
          </div>
        </div>
        <VideoStack
          videos={tiktok.videos}
          className="h-full w-1/2 shrink-0"
          interactive={interactive}
        />
      </div>
    );
  }

  if (mode === "full") {
    return (
      <div className={`${shell} flex-col`}>
        <div className="flex items-center gap-1.5">
          <ProfileAvatar tiktok={tiktok} />
          <div className="ml-auto flex items-center">
            <FollowButton tiktok={tiktok} size="md" />
          </div>
        </div>
        <span className="text-base font-bold truncate w-full" style={nameStyle}>
          {name}
        </span>
        <VideoStack videos={tiktok.videos} interactive={interactive} />
      </div>
    );
  }

  return (
    <div className={`${shell} flex-col`}>
      <div className="flex items-start justify-between gap-1.5">
        <ProfileAvatar tiktok={tiktok} />
        <FollowButton tiktok={tiktok} size="xs" />
      </div>
      <span className="text-sm font-bold truncate w-full" style={nameStyle}>
        {name}
      </span>
      <VideoStack videos={tiktok.videos} interactive={interactive} />
    </div>
  );
};
