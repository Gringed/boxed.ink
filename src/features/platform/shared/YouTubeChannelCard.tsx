"use client";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, type YouTubeChannelData } from "@/lib/youtube";

type YouTubeLayoutMode = "compact" | "row" | "split" | "full";

const getYouTubeLayoutMode = (w: number, h: number): YouTubeLayoutMode => {
  if (w === 4 && h === 1) return "row";
  if (w === 4 && h === 2) return "split";
  if (w === 4 && h === 4) return "full";
  return "compact";
};

interface YouTubeChannelCardProps {
  youtube: YouTubeChannelData;
  color?: string;
  w: number;
  h: number;
}

const YouTubeLogo = ({ className }: { className?: string }) => (
  <img
    src="https://www.google.com/s2/favicons?sz=64&domain=youtube.com"
    alt="YouTube"
    draggable={false}
    className={`${className} object-contain select-none`}
  />
);

const WatchButton = ({
  youtube,
  size = "sm",
}: {
  youtube: YouTubeChannelData;
  size?: "xs" | "sm" | "md";
}) => {
  const t = useTranslations("editor");
  return (
    <a
      href={youtube.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`shrink-0 flex items-center bg-white hover:bg-[#FFF5F5] border border-[#FF0000] text-[#FF0000] font-bold rounded-full transition-colors whitespace-nowrap ${
        size === "md"
          ? "text-sm gap-1.5 px-3.5 py-1.5"
          : size === "xs"
          ? "text-[10px] gap-1 px-2 py-0.5"
          : "text-xs gap-1 px-3 py-1"
      }`}
    >
      <YouTubeLogo
        className={size === "md" ? "size-4" : size === "xs" ? "size-2.5" : "size-3"}
      />
      {t("subscribe")}
      {youtube.subscriberCount > 0 && (
        <span className="opacity-60">
          · {formatCount(youtube.subscriberCount)}
        </span>
      )}
    </a>
  );
};

// size-9 matches the logo on regular link blocks, so a YouTube card sitting
// next to them lines up instead of standing out.
const ChannelAvatar = ({ youtube }: { youtube: YouTubeChannelData }) => (
  <Avatar className="size-9 border shrink-0">
    <AvatarFallback>{youtube.title?.[0]}</AvatarFallback>
    <AvatarImage
      src={youtube.avatar}
      draggable={false}
      className="object-cover select-none"
      alt={`${youtube.title} avatar`}
    />
  </Avatar>
);

// Blocks created before we started picking 16:9 variants still have a
// `hqdefault`/`sddefault`/`default` URL stored, and those bake black bars
// around the frame. Rewriting the filename here fixes them on sight, without
// waiting for the refresh cron to rewrite the stored data.
const BARRED_THUMBNAIL = /\/(hqdefault|sddefault|default)\.jpg/;
const to16by9Thumbnail = (url: string) =>
  BARRED_THUMBNAIL.test(url || "")
    ? url.replace(BARRED_THUMBNAIL, "/mqdefault.jpg")
    : url;

// object-cover fills the cell; the scale on top is the fine adjustment for
// how tight the crop is. Kept modest because the source is now a true 16:9
// frame — a 1.35 like the old bar-covering trick would crop a clean
// thumbnail for nothing. Cell proportions differ per layout, hence a value
// per block size rather than one global one.
const Thumb = ({
  video,
  scale = 1,
}: {
  video: YouTubeChannelData["videos"][number];
  scale?: number;
}) => (
  <div className="relative min-h-0 min-w-0 overflow-hidden rounded-lg bg-noir/5">
    <img
      src={to16by9Thumbnail(video.thumbnail)}
      alt={video.title}
      draggable={false}
      style={{ transform: `scale(${scale})` }}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
    />
  </div>
);

// Always a 2x2 wall of the 4 latest videos, whatever the block size — the
// cell size adapts instead of the count.
const ThumbGrid = ({
  videos,
  gap = "gap-1",
  className = "flex-1 min-h-0",
  scale,
}: {
  videos: YouTubeChannelData["videos"];
  gap?: string;
  className?: string;
  scale?: number;
}) => {
  const thumbs = (videos || []).slice(0, 4);
  if (thumbs.length === 0) return null;
  return (
    <div className={`grid grid-cols-2 grid-rows-2 ${gap} ${className}`}>
      {thumbs.map((v) => (
        <Thumb key={v.id} video={v} scale={scale} />
      ))}
    </div>
  );
};

// Per-block-size crop tightness, since the 2x2 cells aren't the same shape
// in every layout. Tweak these to taste — 1 = no extra crop on top of
// object-cover.
const THUMB_SCALE: Record<YouTubeLayoutMode, number> = {
  row: 1,
  compact: 1.15,
  split: 1.1,
  full: 1,
};

export const YouTubeChannelCard = ({
  youtube,
  color,
  w,
  h,
}: YouTubeChannelCardProps) => {
  const mode = getYouTubeLayoutMode(w, h);
  const thumbScale = THUMB_SCALE[mode];
  const videos = youtube.videos || [];
  const nameStyle = { color: color || "black" };

  // p-3 / gap-1.5 mirrors the regular link block shell at every size, so the
  // content lines up with neighbouring blocks whatever preset is used.
  const shell = "relative z-10 flex h-full w-full p-3 gap-1.5";

  if (mode === "row") {
    return (
      <div className={`${shell} items-center`}>
        <ChannelAvatar youtube={youtube} />
        <span className="text-sm font-bold truncate flex-1" style={nameStyle}>
          {youtube.title}
        </span>
        <WatchButton youtube={youtube} />
      </div>
    );
  }

  if (mode === "split") {
    return (
      <div className={`${shell} flex-row`}>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <ChannelAvatar youtube={youtube} />
          <span className="text-sm font-bold truncate w-full" style={nameStyle}>
            {youtube.title}
          </span>
          {/* mt-auto pins it to the bottom-left, whatever the title height */}
          <div className="mt-auto flex">
            <WatchButton youtube={youtube} />
          </div>
        </div>
        {/* Half the width, flat out: deriving it from a 16:9 grid instead
            worked out to ~90% of the block and starved the text column. The
            cells stop being 16:9, object-cover crops them to fit. */}
        <ThumbGrid
          videos={videos}
          gap="gap-1.5"
          className="h-full w-1/2 shrink-0"
          scale={thumbScale}
        />
      </div>
    );
  }

  if (mode === "full") {
    return (
      <div className={`${shell} flex-col`}>
        <div className="flex items-center gap-1.5">
          <ChannelAvatar youtube={youtube} />
          <div className="ml-auto flex items-center">
            <WatchButton youtube={youtube} size="md" />
          </div>
        </div>
        <span
          className="text-base font-bold truncate w-full"
          style={nameStyle}
        >
          {youtube.title}
        </span>
        <ThumbGrid
          videos={videos}
          gap="gap-1.5"
          scale={thumbScale}
        />
      </div>
    );
  }

  // compact — 2x2 and any other/unhandled size (e.g. the tall 2x4 preset)
  return (
    <div className={`${shell} flex-col`}>
      <div className="flex items-start justify-between gap-1.5">
        <ChannelAvatar youtube={youtube} />
        <WatchButton youtube={youtube} size="xs" />
      </div>
      <span className="text-sm font-bold truncate w-full" style={nameStyle}>
        {youtube.title}
      </span>
      <ThumbGrid videos={videos} gap="gap-1" scale={thumbScale} />
    </div>
  );
};
