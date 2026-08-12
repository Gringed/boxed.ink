// TikTok, via Login Kit + the Display API.
//
// Scopes: user.info.basic is granted by default, user.info.stats carries the
// follower count and user.info.profile the display name/avatar. video.list
// returns the creator's own videos with their cover images.

const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const API_BASE = "https://open.tiktokapis.com/v2";

const SCOPES = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
  "video.list",
];

export const MAX_TIKTOK_VIDEOS = 3;

export interface TikTokVideo {
  id: string;
  cover: string;
  shareUrl: string;
  title?: string;
}

export interface TikTokProfileData {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  followersCount: number;
  likesCount: number;
  profileUrl: string;
  videos: TikTokVideo[];
}

export const getTikTokAuthUrl = (redirectUri: string, state: string) => {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    scope: SCOPES.join(","),
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTH_BASE}?${params}`;
};

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string | null;
  userId: string;
  expiresAt: Date | null;
  scope: string | null;
}

const parseTokenResponse = (json: any): TikTokTokens | null => {
  if (!json?.access_token) return null;
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    userId: String(json.open_id ?? ""),
    expiresAt: json?.expires_in
      ? new Date(Date.now() + Number(json.expires_in) * 1000)
      : null,
    scope: json.scope ?? null,
  };
};

export const exchangeTikTokCode = async (
  code: string,
  redirectUri: string
): Promise<TikTokTokens | null> => {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return null;
  return parseTokenResponse(await res.json());
};

// Access tokens last 24h, so unlike Instagram this one genuinely has to run
// on every refresh cycle rather than only near expiry.
export const refreshTikTokToken = async (
  refreshToken: string
): Promise<TikTokTokens | null> => {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return null;
  return parseTokenResponse(await res.json());
};

export const fetchTikTokProfile = async (
  accessToken: string
): Promise<TikTokProfileData | null> => {
  try {
    const userParams = new URLSearchParams({
      fields:
        "open_id,union_id,avatar_url,display_name,username,follower_count,likes_count",
    });
    const userRes = await fetch(`${API_BASE}/user/info/?${userParams}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) return null;
    const userJson = await userRes.json();
    const user = userJson?.data?.user;
    if (!user?.open_id) return null;

    // Video list is a POST — fields go in the query string, paging in the
    // body. Failing here shouldn't lose the profile, so it degrades to [].
    const videoParams = new URLSearchParams({
      fields: "id,title,cover_image_url,share_url,create_time",
    });
    const videoRes = await fetch(`${API_BASE}/video/list/?${videoParams}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ max_count: MAX_TIKTOK_VIDEOS }),
    });
    const videoJson = videoRes.ok ? await videoRes.json() : null;

    const videos: TikTokVideo[] = (videoJson?.data?.videos ?? [])
      .map((v: any) => ({
        id: String(v.id),
        cover: v.cover_image_url,
        shareUrl: v.share_url,
        title: v.title,
      }))
      .filter((v: TikTokVideo) => v.id && v.cover)
      .slice(0, MAX_TIKTOK_VIDEOS);

    const username = user.username || user.display_name || "";
    return {
      userId: String(user.open_id),
      username,
      displayName: user.display_name ?? "",
      avatar: user.avatar_url,
      followersCount: Number(user.follower_count ?? 0),
      likesCount: Number(user.likes_count ?? 0),
      profileUrl: `https://www.tiktok.com/@${username}`,
      videos,
    };
  } catch {
    return null;
  }
};
