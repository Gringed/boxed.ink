"use client";
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
}) => (
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
    Watch
  </a>
);

const ChannelAvatar = ({
  youtube,
  size = "size-9",
}: {
  youtube: YouTubeChannelData;
  size?: string;
}) => (
  <Avatar className={`${size} border shrink-0`}>
    <AvatarFallback>{youtube.title?.[0]}</AvatarFallback>
    <AvatarImage
      src={youtube.avatar}
      draggable={false}
      className="object-cover select-none"
      alt={`${youtube.title} avatar`}
    />
  </Avatar>
);

const Followers = ({
  youtube,
  small,
}: {
  youtube: YouTubeChannelData;
  small?: boolean;
}) => (
  <span
    className={`text-gray-500 whitespace-nowrap ${
      small ? "text-[10px]" : "text-xs"
    }`}
  >
    {formatCount(youtube.subscriberCount)} subscribers
  </span>
);

const Thumb = ({ video }: { video: YouTubeChannelData["videos"][number] }) => (
  <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-lg">
    <img
      src={video.thumbnail}
      alt={video.title}
      draggable={false}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
    />
  </div>
);

export const YouTubeChannelCard = ({
  youtube,
  color,
  w,
  h,
}: YouTubeChannelCardProps) => {
  const mode = getYouTubeLayoutMode(w, h);
  const nameStyle = { color: color || "black" };

  if (mode === "row") {
    return (
      <div className="relative z-10 flex items-center h-full w-full p-2 gap-2">
        <ChannelAvatar youtube={youtube} />
        <span className="text-sm font-bold truncate flex-1" style={nameStyle}>
          {youtube.title}
        </span>
        <Followers youtube={youtube} />
        <WatchButton youtube={youtube} />
      </div>
    );
  }

  if (mode === "split") {
    const thumbs = (youtube.videos || []).slice(0, 2);
    return (
      <div className="relative z-10 flex flex-col h-full w-full p-2 gap-1">
        <div className="flex items-start justify-between gap-2">
          <ChannelAvatar youtube={youtube} />
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <Followers youtube={youtube} small />
            <WatchButton youtube={youtube} size="xs" />
          </div>
        </div>
        <span className="text-sm font-bold truncate w-full" style={nameStyle}>
          {youtube.title}
        </span>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-1">
          {thumbs.map((v) => (
            <Thumb key={v.id} video={v} />
          ))}
        </div>
      </div>
    );
  }

  if (mode === "full") {
    const thumbs = (youtube.videos || []).slice(0, 4);
    return (
      <div className="relative z-10 flex flex-col h-full w-full p-3 gap-2">
        <div className="flex items-center gap-2">
          <ChannelAvatar youtube={youtube} size="size-10" />
          <div className="ml-auto flex items-center gap-2">
            <Followers youtube={youtube} />
            <WatchButton youtube={youtube} size="md" />
          </div>
        </div>
        <span
          className="text-base font-bold truncate w-full"
          style={nameStyle}
        >
          {youtube.title}
        </span>
        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-1">
          {thumbs.map((v) => (
            <Thumb key={v.id} video={v} />
          ))}
        </div>
      </div>
    );
  }

  // compact — 2x2 and any other/unhandled size (e.g. the tall 2x4 preset)
  const thumb = (youtube.videos || [])[0];
  return (
    <div className="relative z-10 flex flex-col h-full w-full p-2 gap-1">
      <div className="flex items-start justify-between gap-2">
        <ChannelAvatar youtube={youtube} />
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <Followers youtube={youtube} small />
          <WatchButton youtube={youtube} size="xs" />
        </div>
      </div>
      <span className="text-sm font-bold truncate w-full" style={nameStyle}>
        {youtube.title}
      </span>
      {thumb && (
        <div className="flex-1 min-h-0 flex">
          <Thumb video={thumb} />
        </div>
      )}
    </div>
  );
};
