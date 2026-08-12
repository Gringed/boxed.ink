// Instagram, via the "Instagram API with Instagram Login" flow.
//
// Note on account types: the Basic Display API — the one that covered
// personal accounts — was shut down in December 2024. Only Professional
// (Business or Creator) accounts can be connected now, which is why the
// callback surfaces a specific error for personal accounts instead of a
// generic failure.

const AUTH_BASE = "https://www.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const GRAPH_BASE = "https://graph.instagram.com";

const SCOPES = [
  "instagram_business_basic",
];

export const MAX_INSTAGRAM_POSTS = 4;

export interface InstagramPost {
  id: string;
  thumbnail: string;
  permalink: string;
  caption?: string;
  isVideo?: boolean;
}

export interface InstagramProfileData {
  userId: string;
  username: string;
  avatar?: string;
  followersCount: number;
  mediaCount: number;
  profileUrl: string;
  posts: InstagramPost[];
}

export const getInstagramAuthUrl = (redirectUri: string, state: string) => {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state,
  });
  return `${AUTH_BASE}?${params}`;
};

export interface InstagramTokens {
  accessToken: string;
  userId: string;
  expiresAt: Date | null;
}

// Two steps on purpose: the code exchange only ever returns a short-lived
// token (1h), which is useless for a card refreshed by cron. It's immediately
// traded for the 60-day long-lived one.
export const exchangeInstagramCode = async (
  code: string,
  redirectUri: string
): Promise<InstagramTokens | null> => {
  const body = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID || "",
    client_secret: process.env.INSTAGRAM_APP_SECRET || "",
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(TOKEN_URL, { method: "POST", body });
  if (!res.ok) return null;
  const json = await res.json();
  const shortLived = json?.access_token;
  const userId = String(json?.user_id ?? json?.data?.[0]?.user_id ?? "");
  if (!shortLived || !userId) return null;

  const longParams = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET || "",
    access_token: shortLived,
  });
  const longRes = await fetch(`${GRAPH_BASE}/access_token?${longParams}`);
  if (!longRes.ok) {
    return { accessToken: shortLived, userId, expiresAt: null };
  }
  const longJson = await longRes.json();
  return {
    accessToken: longJson?.access_token || shortLived,
    userId,
    expiresAt: longJson?.expires_in
      ? new Date(Date.now() + Number(longJson.expires_in) * 1000)
      : null,
  };
};

// Long-lived tokens are renewable while still valid and at least 24h old.
// Letting one lapse means the user has to reconnect by hand, so the cron
// renews well before the 60-day mark.
export const refreshInstagramToken = async (
  accessToken: string
): Promise<{ accessToken: string; expiresAt: Date | null } | null> => {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: accessToken,
  });
  const res = await fetch(`${GRAPH_BASE}/refresh_access_token?${params}`);
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.access_token) return null;
  return {
    accessToken: json.access_token,
    expiresAt: json?.expires_in
      ? new Date(Date.now() + Number(json.expires_in) * 1000)
      : null,
  };
};

export const fetchInstagramProfile = async (
  accessToken: string
): Promise<InstagramProfileData | null> => {
  try {
    const profileParams = new URLSearchParams({
      fields:
        "id,username,account_type,followers_count,media_count,profile_picture_url",
      access_token: accessToken,
    });
    const profileRes = await fetch(`${GRAPH_BASE}/me?${profileParams}`);
    if (!profileRes.ok) return null;
    const profile = await profileRes.json();
    if (!profile?.id) return null;

    const mediaParams = new URLSearchParams({
      fields:
        "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp",
      limit: String(MAX_INSTAGRAM_POSTS),
      access_token: accessToken,
    });
    const mediaRes = await fetch(`${GRAPH_BASE}/me/media?${mediaParams}`);
    const mediaJson = mediaRes.ok ? await mediaRes.json() : { data: [] };

    const posts: InstagramPost[] = (mediaJson?.data ?? [])
      .map((item: any) => ({
        id: item.id,
        // Videos expose a still under thumbnail_url; media_url is the file
        // itself, which would try to render as an image and fail.
        thumbnail:
          item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
        permalink: item.permalink,
        caption: item.caption,
        isVideo: item.media_type === "VIDEO",
      }))
      .filter((p: InstagramPost) => p.id && p.thumbnail)
      .slice(0, MAX_INSTAGRAM_POSTS);

    return {
      userId: String(profile.id),
      username: profile.username ?? "",
      avatar: profile.profile_picture_url,
      followersCount: Number(profile.followers_count ?? 0),
      mediaCount: Number(profile.media_count ?? 0),
      profileUrl: `https://www.instagram.com/${profile.username ?? ""}`,
      posts,
    };
  } catch {
    return null;
  }
};
