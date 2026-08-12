import { put } from "@vercel/blob";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeChannelData {
  channelId: string;
  title: string;
  avatar: string;
  subscriberCount: number;
  channelUrl: string;
  videos: { id: string; thumbnail: string; title: string }[];
}

type ChannelLookup =
  | { by: "id"; value: string }
  | { by: "handle"; value: string }
  | { by: "username"; value: string };

const parseYouTubeChannelUrl = (rawUrl: string): ChannelLookup | null => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (!/(^|\.)youtube\.com$/.test(url.hostname.replace(/^www\./, ""))) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  if (segments[0] === "channel" && segments[1]) {
    return { by: "id", value: segments[1] };
  }
  if (segments[0] === "c" && segments[1]) {
    return { by: "username", value: segments[1] };
  }
  if (segments[0] === "user" && segments[1]) {
    return { by: "username", value: segments[1] };
  }
  if (segments[0].startsWith("@")) {
    return { by: "handle", value: segments[0].slice(1) };
  }

  return null;
};

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
};

export { formatCount };

// Mirror only the channel avatar to our own storage — it's the one image
// shown on every card size, unlike the video thumbnails which only appear
// on some layouts. Falls back to the Google CDN URL if the upload fails.
const mirrorAvatarToBlob = async (
  avatarUrl: string,
  channelId: string
): Promise<string> => {
  if (!avatarUrl) return avatarUrl;
  try {
    const res = await fetch(avatarUrl);
    if (!res.ok) return avatarUrl;
    const blob = await res.blob();
    const uploaded = await put(`youtube-avatars/${channelId}.jpg`, blob, {
      access: "public",
      addRandomSuffix: true,
    });
    return uploaded.url;
  } catch {
    return avatarUrl;
  }
};

const MAX_VIDEOS = 4;

const fetchLatestVideos = async (
  playlistId: string,
  apiKey: string
): Promise<YouTubeChannelData["videos"]> => {
  const videosParams = new URLSearchParams({
    part: "snippet",
    playlistId,
    maxResults: String(MAX_VIDEOS),
    key: apiKey,
  });
  const videosRes = await fetch(
    `${YOUTUBE_API_BASE}/playlistItems?${videosParams}`
  );
  if (!videosRes.ok) return [];
  const videosJson = await videosRes.json();
  return (videosJson?.items ?? [])
    .map((item: any) => ({
      id: item?.snippet?.resourceId?.videoId,
      title: item?.snippet?.title,
      // `high`/`default` are 4:3 crops with black bars baked around the 16:9
      // frame — `maxres` and `medium` are true 16:9, so they fill a
      // widescreen thumbnail cleanly.
      thumbnail:
        item?.snippet?.thumbnails?.maxres?.url ||
        item?.snippet?.thumbnails?.medium?.url,
    }))
    .filter((v: any) => v.id && v.thumbnail);
};

export const fetchYouTubeChannelData = async (
  rawUrl: string
): Promise<YouTubeChannelData | null> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const lookup = parseYouTubeChannelUrl(rawUrl);
  if (!lookup) return null;

  try {
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      key: apiKey,
    });
    if (lookup.by === "id") params.set("id", lookup.value);
    if (lookup.by === "handle") params.set("forHandle", lookup.value);
    if (lookup.by === "username") params.set("forUsername", lookup.value);

    const channelRes = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
    if (!channelRes.ok) return null;
    const channelJson = await channelRes.json();
    const channel = channelJson?.items?.[0];
    if (!channel) return null;

    const channelId: string = channel.id;
    const uploadsPlaylistId: string | undefined =
      channel.contentDetails?.relatedPlaylists?.uploads;

    const videos = uploadsPlaylistId
      ? await fetchLatestVideos(uploadsPlaylistId, apiKey)
      : [];

    const rawAvatar =
      channel.snippet?.thumbnails?.medium?.url ||
      channel.snippet?.thumbnails?.default?.url ||
      "";

    return {
      channelId,
      title: channel.snippet?.title ?? "",
      avatar: await mirrorAvatarToBlob(rawAvatar, channelId),
      subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
      channelUrl: `https://www.youtube.com/channel/${channelId}`,
      videos,
    };
  } catch {
    return null;
  }
};

// Re-fetches only the fields that can change after the block was created
// (subscriber count, latest videos, display name) — skips re-mirroring the
// avatar to avoid burning Blob storage/bandwidth on every periodic refresh.
export const refreshYouTubeChannelData = async (
  channelId: string
): Promise<Pick<
  YouTubeChannelData,
  "title" | "subscriberCount" | "videos"
> | null> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      id: channelId,
      key: apiKey,
    });
    const channelRes = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
    if (!channelRes.ok) return null;
    const channelJson = await channelRes.json();
    const channel = channelJson?.items?.[0];
    if (!channel) return null;

    const uploadsPlaylistId: string | undefined =
      channel.contentDetails?.relatedPlaylists?.uploads;
    const videos = uploadsPlaylistId
      ? await fetchLatestVideos(uploadsPlaylistId, apiKey)
      : [];

    return {
      title: channel.snippet?.title ?? "",
      subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
      videos,
    };
  } catch {
    return null;
  }
};
