// Instagram, via the "Instagram API with Instagram Login" flow.
//
// Note on account types: the Basic Display API — the one that covered
// personal accounts — was shut down in December 2024. Only Professional
// (Business or Creator) accounts can be connected now, which is why the
// callback surfaces a specific error for personal accounts instead of a
// generic failure.

const AUTH_BASE = "https://www.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
// Token exchange/refresh live at the unversioned root; the data endpoints
// need an explicit version. Calling /me unversioned falls back to a version
// that predates Instagram Login and answers "Unsupported request".
const GRAPH_ROOT = "https://graph.instagram.com";
const GRAPH_VERSION = process.env.INSTAGRAM_API_VERSION || "v21.0";
const GRAPH_BASE = `${GRAPH_ROOT}/${GRAPH_VERSION}`;

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
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.error_message || json?.error) {
    console.error(
      "[instagram] code exchange failed:",
      json?.error_message || json?.error?.message || res.status
    );
    return null;
  }
  const shortLived = json?.access_token;
  const userId = String(json?.user_id ?? json?.data?.[0]?.user_id ?? "");
  if (!shortLived || !userId) return null;

  const longParams = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET || "",
    access_token: shortLived,
  });
  const longRes = await fetch(`${GRAPH_ROOT}/access_token?${longParams}`);
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
  const res = await fetch(`${GRAPH_ROOT}/refresh_access_token?${params}`);
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

export type InstagramFetchResult =
  | { ok: true; profile: InstagramProfileData }
  // "personal_account" is only reported when Instagram actually says so —
  // every other failure keeps its own message, so a bad field or an expired
  // token isn't mislabelled as an account-type problem.
  | { ok: false; reason: "personal_account" | "error"; message?: string };

export const fetchInstagramProfileResult = async (
  accessToken: string
): Promise<InstagramFetchResult> => {
  try {
    // Field sets and hosts have shifted between the old Basic Display API
    // and Instagram Login, and an unsupported field or path answers with the
    // same opaque "Unsupported request" either way. Try the documented
    // combinations in order and keep the first that answers, logging each
    // rejection so a future break says which variant died.
    const attempts = [
      {
        base: GRAPH_BASE,
        fields:
          "user_id,username,account_type,followers_count,media_count,profile_picture_url",
      },
      { base: GRAPH_BASE, fields: "user_id,username" },
      {
        base: GRAPH_ROOT,
        fields:
          "id,username,account_type,followers_count,media_count,profile_picture_url",
      },
      { base: GRAPH_ROOT, fields: "id,username" },
    ];

    let profile: any = null;
    let workingBase = GRAPH_BASE;
    let lastMessage = "No response";
    for (const attempt of attempts) {
      const profileParams = new URLSearchParams({
        fields: attempt.fields,
        access_token: accessToken,
      });
      const res = await fetch(`${attempt.base}/me?${profileParams}`);
      const json = await res.json().catch(() => null);
      if (res.ok && json && !json.error) {
        profile = json;
        workingBase = attempt.base;
        break;
      }
      lastMessage =
        json?.error?.message || `HTTP ${res.status}`;
      console.error(
        `[instagram] /me failed (${attempt.base.replace(GRAPH_ROOT, "")}` +
          ` fields=${attempt.fields.split(",")[0]}…):`,
        JSON.stringify(json?.error ?? json)?.slice(0, 300)
      );
    }

    if (!profile) {
      return { ok: false, reason: "error", message: lastMessage };
    }

    const userId = profile?.user_id ?? profile?.id;
    if (!userId) {
      return { ok: false, reason: "error", message: "No user id returned" };
    }
    if (
      typeof profile.account_type === "string" &&
      profile.account_type.toUpperCase() === "PERSONAL"
    ) {
      return { ok: false, reason: "personal_account" };
    }

    const mediaParams = new URLSearchParams({
      fields:
        "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp",
      limit: String(MAX_INSTAGRAM_POSTS),
      access_token: accessToken,
    });
    // Same base that answered for the profile — mixing versioned and
    // unversioned hosts with one token is what broke the profile call.
    const mediaRes = await fetch(`${workingBase}/me/media?${mediaParams}`);
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
      ok: true,
      profile: {
        userId: String(userId),
        username: profile.username ?? "",
        avatar: profile.profile_picture_url,
        followersCount: Number(profile.followers_count ?? 0),
        mediaCount: Number(profile.media_count ?? 0),
        profileUrl: `https://www.instagram.com/${profile.username ?? ""}`,
        posts,
      },
    };
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

// Thin wrapper for callers that only care whether it worked (the refresh
// cron), keeping the richer result for the OAuth callback.
export const fetchInstagramProfile = async (
  accessToken: string
): Promise<InstagramProfileData | null> => {
  const result = await fetchInstagramProfileResult(accessToken);
  return result.ok ? result.profile : null;
};
