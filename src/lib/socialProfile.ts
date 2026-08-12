// Detects whether a URL is a creator's own profile/channel page on a known
// social platform (not a single post/video/status on that platform) — used
// to decide when a link block earns a Follow/Support button.

export type SocialPlatform =
  | "twitter"
  | "instagram"
  | "tiktok"
  | "github"
  | "patreon"
  | "kofi"
  | "buymeacoffee";

export interface SocialProfile {
  platform: SocialPlatform;
  handle: string;
  // "Follow" for social platforms, "Support" for funding platforms.
  label: "Follow" | "Support";
  // Whether we can reliably fetch a public follower count for this
  // platform without a paid/authenticated API.
  canFetchCount: boolean;
}

// Brand colours for the Follow/Support button, mirroring how the YouTube and
// Twitch cards render theirs: white pill, brand-coloured border and text.
// `background` exists for brands whose colour is too light to read on white —
// Buy Me a Coffee's yellow only works as a fill with dark text.
// Applied as inline styles on purpose: Tailwind can't generate arbitrary
// classes like `border-[${color}]` from a runtime value.
export const SOCIAL_BRAND: Record<
  SocialPlatform,
  { color: string; background: string }
> = {
  twitter: { color: "#000000", background: "#ffffff" },
  instagram: { color: "#E4405F", background: "#ffffff" },
  tiktok: { color: "#FE2C55", background: "#ffffff" },
  github: { color: "#181717", background: "#ffffff" },
  patreon: { color: "#F96854", background: "#ffffff" },
  kofi: { color: "#FF5E5B", background: "#ffffff" },
  buymeacoffee: { color: "#000000", background: "#FFDD00" },
};

const RESERVED: Record<string, string[]> = {
  twitter: [
    "home",
    "explore",
    "notifications",
    "messages",
    "i",
    "search",
    "settings",
    "intent",
    "hashtag",
    "share",
    "compose",
  ],
  instagram: [
    "p",
    "reel",
    "reels",
    "stories",
    "explore",
    "accounts",
    "direct",
    "tv",
    "about",
    "developer",
  ],
  github: [
    "orgs",
    "marketplace",
    "sponsors",
    "settings",
    "notifications",
    "issues",
    "pulls",
    "explore",
    "topics",
    "collections",
    "events",
    "features",
    "about",
    "apps",
    "codespaces",
    "search",
  ],
  kofi: ["gold", "shop", "drops", "about", "manage", "help"],
  buymeacoffee: ["explore", "help", "c", "b", "about"],
};

const stripAt = (segment: string) => segment.replace(/^@/, "");

export const detectSocialProfile = (rawUrl: string): SocialProfile | null => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  if (hostname === "twitter.com" || hostname === "x.com") {
    if (segments.length !== 1) return null;
    const handle = stripAt(segments[0]);
    if (RESERVED.twitter.includes(handle.toLowerCase())) return null;
    return { platform: "twitter", handle, label: "Follow", canFetchCount: false };
  }

  if (hostname === "instagram.com") {
    if (segments.length !== 1) return null;
    const handle = stripAt(segments[0]);
    if (RESERVED.instagram.includes(handle.toLowerCase())) return null;
    return { platform: "instagram", handle, label: "Follow", canFetchCount: false };
  }

  if (hostname === "tiktok.com") {
    if (segments.length !== 1 || !segments[0].startsWith("@")) return null;
    const handle = stripAt(segments[0]);
    return { platform: "tiktok", handle, label: "Follow", canFetchCount: false };
  }

  if (hostname === "github.com") {
    if (segments.length !== 1) return null;
    const handle = segments[0];
    if (RESERVED.github.includes(handle.toLowerCase())) return null;
    return { platform: "github", handle, label: "Follow", canFetchCount: true };
  }

  if (hostname === "patreon.com") {
    if (segments.length === 1) {
      return {
        platform: "patreon",
        handle: segments[0],
        label: "Support",
        canFetchCount: false,
      };
    }
    if (segments.length === 2 && segments[0] === "c") {
      return {
        platform: "patreon",
        handle: segments[1],
        label: "Support",
        canFetchCount: false,
      };
    }
    return null;
  }

  if (hostname === "ko-fi.com") {
    if (segments.length !== 1) return null;
    const handle = segments[0];
    if (RESERVED.kofi.includes(handle.toLowerCase())) return null;
    return { platform: "kofi", handle, label: "Support", canFetchCount: false };
  }

  if (hostname === "buymeacoffee.com") {
    if (segments.length !== 1) return null;
    const handle = segments[0];
    if (RESERVED.buymeacoffee.includes(handle.toLowerCase())) return null;
    return {
      platform: "buymeacoffee",
      handle,
      label: "Support",
      canFetchCount: false,
    };
  }

  return null;
};

// Public, unauthenticated, free — no key needed, generous rate limit.
export const fetchGithubFollowerCount = async (
  username: string
): Promise<number | null> => {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json?.followers === "number" ? json.followers : null;
  } catch {
    return null;
  }
};
