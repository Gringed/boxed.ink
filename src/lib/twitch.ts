import { put } from "@vercel/blob";

const TWITCH_API_BASE = "https://api.twitch.tv/helix";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

export interface TwitchChannelData {
  channelId: string;
  title: string;
  avatar: string;
  channelUrl: string;
  isLive: boolean;
  category: string | null;
  categoryImage: string | null;
}

const parseTwitchChannelUrl = (rawUrl: string): string | null => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (!/(^|\.)twitch\.tv$/.test(url.hostname.replace(/^www\./, ""))) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // Ignore non-channel paths (videos, clips, directory, etc.)
  const reserved = new Set(["videos", "clips", "directory", "settings", "p"]);
  if (reserved.has(segments[0].toLowerCase())) return null;

  return segments[0];
};

const getTwitchAppToken = async (): Promise<string | null> => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });
    const res = await fetch(`${TWITCH_TOKEN_URL}?${params}`, {
      method: "POST",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.access_token ?? null;
  } catch {
    return null;
  }
};

// Mirror only the channel avatar to our own storage, same rationale as the
// YouTube integration — it's the one image shown on every card size.
const mirrorAvatarToBlob = async (
  avatarUrl: string,
  channelId: string
): Promise<string> => {
  if (!avatarUrl) return avatarUrl;
  try {
    const res = await fetch(avatarUrl);
    if (!res.ok) return avatarUrl;
    const blob = await res.blob();
    const uploaded = await put(`twitch-avatars/${channelId}.jpg`, blob, {
      access: "public",
      addRandomSuffix: true,
    });
    return uploaded.url;
  } catch {
    return avatarUrl;
  }
};

export const fetchTwitchChannelData = async (
  rawUrl: string
): Promise<TwitchChannelData | null> => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const login = parseTwitchChannelUrl(rawUrl);
  if (!clientId || !login) return null;

  const token = await getTwitchAppToken();
  if (!token) return null;

  const headers = {
    "Client-Id": clientId,
    Authorization: `Bearer ${token}`,
  };

  try {
    const userRes = await fetch(
      `${TWITCH_API_BASE}/users?login=${encodeURIComponent(login)}`,
      { headers }
    );
    if (!userRes.ok) return null;
    const userJson = await userRes.json();
    const user = userJson?.data?.[0];
    if (!user) return null;

    let isLive = false;
    try {
      const streamRes = await fetch(
        `${TWITCH_API_BASE}/streams?user_login=${encodeURIComponent(login)}`,
        { headers }
      );
      if (streamRes.ok) {
        const streamJson = await streamRes.json();
        isLive = !!streamJson?.data?.[0];
      }
    } catch {
      // live status is best-effort — a failure here shouldn't break the card
    }

    // The channel's configured category persists even while offline (it's
    // "last played" until the streamer changes it for their next stream),
    // unlike stream-only data which needs the channel to be live right now.
    let category: string | null = null;
    let categoryImage: string | null = null;
    try {
      const channelRes = await fetch(
        `${TWITCH_API_BASE}/channels?broadcaster_id=${user.id}`,
        { headers }
      );
      if (channelRes.ok) {
        const channelJson = await channelRes.json();
        const channelInfo = channelJson?.data?.[0];
        category = channelInfo?.game_name || null;
        const gameId = channelInfo?.game_id;
        if (gameId) {
          const gameRes = await fetch(
            `${TWITCH_API_BASE}/games?id=${gameId}`,
            { headers }
          );
          if (gameRes.ok) {
            const gameJson = await gameRes.json();
            const boxArt = gameJson?.data?.[0]?.box_art_url as
              | string
              | undefined;
            categoryImage =
              boxArt
                ?.replace("{width}", "285")
                ?.replace("{height}", "380") || null;
          }
        }
      }
    } catch {
      // category is best-effort too
    }

    return {
      channelId: user.id,
      title: user.display_name || user.login,
      avatar: await mirrorAvatarToBlob(user.profile_image_url, user.id),
      channelUrl: `https://www.twitch.tv/${user.login}`,
      isLive,
      category,
      categoryImage,
    };
  } catch {
    return null;
  }
};
