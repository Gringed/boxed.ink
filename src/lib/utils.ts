import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Picks a black or white highlight/text color for UI adapting to whatever
// custom background color a block has, so it stays legible on any of them.
export const isLightColor = (hex?: string) => {
  if (!hex) return true;
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (full.length !== 6 || /[^0-9a-f]/i.test(full)) return true;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
};

// Scraped og:image/twitter:image URLs sometimes point at the source site's
// own dev machine (http://localhost:3000/logo.png) — never loadable by a
// real visitor. New scrapes get filtered server-side, but this also guards
// already-stored links so they fall back to the placeholder immediately
// instead of waiting on a browser image-error event that may not fire
// consistently for a 200-status non-image response.
export const isUsableImageUrl = (url?: unknown): url is string => {
  if (typeof url !== "string" || !url) return false;
  try {
    const { hostname } = new URL(url, "https://placeholder.invalid");
    return !(
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
};
