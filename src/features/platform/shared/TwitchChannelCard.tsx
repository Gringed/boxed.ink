"use client";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type TwitchChannelData } from "@/lib/twitch";

type TwitchLayoutMode = "compact" | "row" | "split" | "full" | "tall";

const getTwitchLayoutMode = (w: number, h: number): TwitchLayoutMode => {
  if (w === 4 && h === 1) return "row";
  if (w === 4 && h === 2) return "split";
  if (w === 4 && h === 4) return "full";
  if (w === 2 && h === 4) return "tall";
  return "compact";
};

interface TwitchChannelCardProps {
  twitch: TwitchChannelData;
  color?: string;
  w: number;
  h: number;
}

const TwitchLogo = ({ className }: { className?: string }) => (
  <img
    src="https://www.google.com/s2/favicons?sz=64&domain=twitch.tv"
    alt="Twitch"
    draggable={false}
    className={`${className} object-contain select-none`}
  />
);

const WatchButton = ({
  twitch,
  size = "sm",
}: {
  twitch: TwitchChannelData;
  size?: "xs" | "sm" | "md";
}) => {
  const t = useTranslations("editor");
  return (
    <a
      href={twitch.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`shrink-0 flex items-center bg-white hover:bg-[#F5F0FF] border border-[#9146FF] text-[#9146FF] font-bold rounded-full transition-colors whitespace-nowrap ${
        size === "md"
          ? "text-sm gap-1.5 px-3.5 py-1.5"
          : size === "xs"
          ? "text-xs gap-1 px-2.5 py-0.5"
          : "text-xs gap-1 px-3 py-1"
      }`}
    >
      <TwitchLogo
        className={size === "md" ? "size-4" : size === "xs" ? "size-3" : "size-3"}
      />
      {t("watch")}
    </a>
  );
};

// size-9 matches the logo on regular link blocks and the other channel
// cards, so a Twitch block lines up with its neighbours at every size.
const ChannelAvatar = ({ twitch }: { twitch: TwitchChannelData }) => (
  <span className="relative flex size-9 shrink-0">
    {twitch.isLive && (
      <span className="absolute inset-0 rounded-full border-2 border-[#9146FF] animate-ping-soft" />
    )}
    <Avatar
      className={`relative size-9 shrink-0 ${
        twitch.isLive ? "border-2 border-[#9146FF]" : "border"
      }`}
    >
      <AvatarFallback>{twitch.title?.[0]}</AvatarFallback>
      <AvatarImage
        src={twitch.avatar}
        draggable={false}
        className="object-cover select-none"
        alt={`${twitch.title} avatar`}
      />
    </Avatar>
  </span>
);

const LiveStatus = ({
  twitch,
  small,
}: {
  twitch: TwitchChannelData;
  small?: boolean;
}) => {
  const t = useTranslations("editor");
  return twitch.isLive ? (
    <span
      className={`flex items-center gap-1 font-bold text-[#9146FF] whitespace-nowrap ${
        small ? "text-xs" : "text-sm"
      }`}
    >
      {/* Solid dot with a ping ring behind it — the ring expands and fades
          while the dot stays put, so the status reads as a heartbeat. */}
      <span className="relative flex size-1.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-[#9146FF] opacity-75 animate-ping" />
        <span className="relative size-1.5 rounded-full bg-[#9146FF]" />
      </span>
      {t("live")}
    </span>
  ) : (
    <span
      className={`text-gray-500 whitespace-nowrap ${
        small ? "text-xs" : "text-sm"
      }`}
    >
      {t("offline")}
    </span>
  );
};

const CategoryDisplay = ({
  twitch,
  compact,
}: {
  twitch: TwitchChannelData;
  compact?: boolean;
}) => {
  const t = useTranslations("editor");
  if (!twitch.category) return null;
  return (
    <div className="flex items-center gap-2 min-h-0 overflow-hidden">
      {twitch.categoryImage && (
        <img
          src={twitch.categoryImage}
          alt={twitch.category}
          draggable={false}
          className={`${
            compact ? "h-9" : "h-14"
          } w-auto shrink-0 rounded object-cover pointer-events-none select-none`}
        />
      )}
      <span
        className={`text-gray-600 truncate ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {twitch.isLive ? t("playingPrefix") : t("lastPlayedPrefix")}{" "}
        <span className="font-semibold">{twitch.category}</span>
      </span>
    </div>
  );
};

const CategoryDisplayLarge = ({ twitch }: { twitch: TwitchChannelData }) => {
  const t = useTranslations("editor");
  if (!twitch.category) return null;
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full w-full min-h-0">
      {twitch.categoryImage && (
        <img
          src={twitch.categoryImage}
          alt={twitch.category}
          draggable={false}
          className="flex-1 min-h-0 w-auto rounded-lg object-contain shadow pointer-events-none select-none"
        />
      )}
      <div className="text-center shrink-0">
        <div className="text-xs text-gray-500">
          {twitch.isLive ? t("playingPrefix") : t("lastPlayedPrefix")}
        </div>
        <div className="text-sm font-bold truncate max-w-full">
          {twitch.category}
        </div>
      </div>
    </div>
  );
};

export const TwitchChannelCard = ({
  twitch,
  color,
  w,
  h,
}: TwitchChannelCardProps) => {
  const mode = getTwitchLayoutMode(w, h);
  const nameStyle = { color: color || "black" };
  // p-3 / gap-1.5 mirrors the regular link block shell at every size, like
  // the YouTube, Instagram and TikTok cards.
  const shell = "relative z-10 flex h-full w-full p-3 gap-1.5";

  if (mode === "row") {
    return (
      <div className={`${shell} items-center`}>
        <ChannelAvatar twitch={twitch} />
        <span className="text-sm font-bold truncate flex-1" style={nameStyle}>
          {twitch.title}
        </span>
        <LiveStatus twitch={twitch} />
        <WatchButton twitch={twitch} />
      </div>
    );
  }

  if (mode === "split") {
    return (
      <div className={`${shell} flex-col`}>
        <div className="flex items-center gap-1.5">
          <ChannelAvatar twitch={twitch} />
          <div className="ml-auto flex items-center gap-2">
            <LiveStatus twitch={twitch} />
            <WatchButton twitch={twitch} />
          </div>
        </div>
        <span className="text-base font-bold truncate w-full" style={nameStyle}>
          {twitch.title}
        </span>
        <div className="flex-1 min-h-0 flex items-center">
          <CategoryDisplay twitch={twitch} />
        </div>
      </div>
    );
  }

  if (mode === "full") {
    return (
      <div className={`${shell} flex-col`}>
        <div className="flex items-center gap-1.5">
          <ChannelAvatar twitch={twitch} />
          <div className="ml-auto flex items-center gap-2">
            <LiveStatus twitch={twitch} />
            <WatchButton twitch={twitch} size="md" />
          </div>
        </div>
        <span
          className="text-base font-bold truncate w-full"
          style={nameStyle}
        >
          {twitch.title}
        </span>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <CategoryDisplayLarge twitch={twitch} />
        </div>
      </div>
    );
  }

  if (mode === "tall") {
    return (
      <div className={`${shell} flex-col`}>
        <div className="flex items-start justify-between gap-1.5">
          <ChannelAvatar twitch={twitch} />
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <LiveStatus twitch={twitch} small />
            <WatchButton twitch={twitch} size="xs" />
          </div>
        </div>
        <span className="text-base font-bold truncate w-full" style={nameStyle}>
          {twitch.title}
        </span>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <CategoryDisplayLarge twitch={twitch} />
        </div>
      </div>
    );
  }

  // compact — 2x2
  return (
    <div className={`${shell} flex-col`}>
      <div className="flex items-start justify-between gap-1.5">
        <ChannelAvatar twitch={twitch} />
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <LiveStatus twitch={twitch} small />
          <WatchButton twitch={twitch} size="xs" />
        </div>
      </div>
      <span className="text-base font-bold truncate w-full" style={nameStyle}>
        {twitch.title}
      </span>
      <div className="flex-1 min-h-0 flex items-center">
        <CategoryDisplay twitch={twitch} compact />
      </div>
    </div>
  );
};
