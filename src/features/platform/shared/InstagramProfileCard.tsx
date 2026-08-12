"use client";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount } from "@/lib/youtube";
import type { InstagramProfileData } from "@/lib/instagram";

type LayoutMode = "compact" | "row" | "split" | "full";

const getLayoutMode = (w: number, h: number): LayoutMode => {
  if (w === 4 && h === 1) return "row";
  if (w === 4 && h === 2) return "split";
  if (w === 4 && h === 4) return "full";
  return "compact";
};

const BRAND = "#E4405F";

interface InstagramProfileCardProps {
  instagram: InstagramProfileData;
  color?: string;
  w: number;
  h: number;
  // False in the editor, where only the block action buttons may react.
  interactive?: boolean;
}

const InstagramLogo = ({ className }: { className?: string }) => (
  <img
    src="https://www.google.com/s2/favicons?sz=64&domain=instagram.com"
    alt="Instagram"
    draggable={false}
    className={`${className} object-contain select-none`}
  />
);

const FollowButton = ({
  instagram,
  size = "sm",
}: {
  instagram: InstagramProfileData;
  size?: "xs" | "sm" | "md";
}) => {
  const t = useTranslations("editor");
  return (
    <a
      href={instagram.profileUrl}
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
      <InstagramLogo
        className={size === "md" ? "size-4" : size === "xs" ? "size-2.5" : "size-3"}
      />
      {t("follow")}
      {instagram.followersCount > 0 && (
        <span className="opacity-60">
          · {formatCount(instagram.followersCount)}
        </span>
      )}
    </a>
  );
};

const ProfileAvatar = ({ instagram }: { instagram: InstagramProfileData }) => (
  <Avatar className="size-9 border shrink-0">
    <AvatarFallback>{instagram.username?.[0]}</AvatarFallback>
    <AvatarImage
      src={instagram.avatar}
      draggable={false}
      className="object-cover select-none"
      alt={`${instagram.username} avatar`}
    />
  </Avatar>
);

// In the editor the thumbnails are plain images: making them links would
// hijack a click meant to select the block, and swallow the drag.
const Post = ({
  post,
  interactive,
}: {
  post: InstagramProfileData["posts"][number];
  interactive: boolean;
}) => {
  const image = (
    <img
      src={post.thumbnail}
      alt={post.caption || ""}
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover select-none"
    />
  );
  const className =
    "relative min-h-0 min-w-0 overflow-hidden rounded-lg bg-noir/5";

  if (!interactive) return <div className={className}>{image}</div>;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={className}
    >
      {image}
    </a>
  );
};

// 2x2 wall of the 4 latest posts, mirroring the YouTube card so the two read
// as the same family of block.
const PostGrid = ({
  posts,
  gap = "gap-1",
  className = "flex-1 min-h-0",
  interactive,
}: {
  posts: InstagramProfileData["posts"];
  gap?: string;
  className?: string;
  interactive: boolean;
}) => {
  const shown = (posts || []).slice(0, 4);
  if (shown.length === 0) return null;
  return (
    <div className={`grid grid-cols-2 grid-rows-2 ${gap} ${className}`}>
      {shown.map((p) => (
        <Post key={p.id} post={p} interactive={interactive} />
      ))}
    </div>
  );
};

export const InstagramProfileCard = ({
  instagram,
  color,
  w,
  h,
  interactive = true,
}: InstagramProfileCardProps) => {
  const mode = getLayoutMode(w, h);
  const nameStyle = { color: color || "black" };
  const shell = "relative z-10 flex h-full w-full p-3 gap-1.5";
  const name = instagram.username ? `@${instagram.username}` : "";

  if (mode === "row") {
    return (
      <div className={`${shell} items-center`}>
        <ProfileAvatar instagram={instagram} />
        <span className="text-sm font-bold truncate flex-1" style={nameStyle}>
          {name}
        </span>
        <FollowButton instagram={instagram} />
      </div>
    );
  }

  if (mode === "split") {
    return (
      <div className={`${shell} flex-row`}>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <ProfileAvatar instagram={instagram} />
          <span className="text-sm font-bold truncate w-full" style={nameStyle}>
            {name}
          </span>
          <div className="mt-auto flex">
            <FollowButton instagram={instagram} />
          </div>
        </div>
        <PostGrid
          posts={instagram.posts}
          gap="gap-1.5"
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
          <ProfileAvatar instagram={instagram} />
          <div className="ml-auto flex items-center">
            <FollowButton instagram={instagram} size="md" />
          </div>
        </div>
        <span className="text-base font-bold truncate w-full" style={nameStyle}>
          {name}
        </span>
        <PostGrid posts={instagram.posts} gap="gap-1.5" interactive={interactive} />
      </div>
    );
  }

  return (
    <div className={`${shell} flex-col`}>
      <div className="flex items-start justify-between gap-1.5">
        <ProfileAvatar instagram={instagram} />
        <FollowButton instagram={instagram} size="xs" />
      </div>
      <span className="text-sm font-bold truncate w-full" style={nameStyle}>
        {name}
      </span>
      <PostGrid posts={instagram.posts} gap="gap-1" interactive={interactive} />
    </div>
  );
};
