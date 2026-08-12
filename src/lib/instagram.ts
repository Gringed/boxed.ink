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
  // Newer responses wrap everything in `data[0]`; older ones are flat.
  const payload = json?.data?.[0] ?? json;
  const shortLived = payload?.access_token;
  const userId = String(payload?.user_id ?? "");

  // An Instagram-Login token starts with "IGAA"; a Facebook one with "EAA".
  // Getting the latter here means the app's Facebook credentials were used
  // instead of the Instagram ones, which is exactly what makes /me answer
  // "Unsupported request" further down.
  console.log(
    "[instagram] token prefix:",
    String(shortLived ?? "").slice(0, 4),
    "| permissions:",
    payload?.permissions ?? "(none returned)"
  );

  if (!shortLived || !userId) {
    console.error(
      "[instagram] exchange returned no token/user id. Keys:",
      Object.keys(payload ?? {}).join(",")
    );
    return null;
  }

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

const FULL_PROFILE_FIELDS =
  "user_id,username,account_type,followers_count,media_count,profile_picture_url";

export const fetchInstagramProfileResult = async (
  accessToken: string,
  igUserId?: string
): Promise<InstagramFetchResult> => {
  try {
    // "Unsupported request" is Meta's catch-all: it covers a wrong API
    // version, an unroutable node, and a token that can't resolve /me alike.
    // Probe the plausible combinations with a minimal field set — a request
    // that fails on the node itself would also fail on the fields, so a
    // narrow probe isolates the variable — then re-query the winner for the
    // full profile.
    const versions = Array.from(
      new Set([GRAPH_VERSION, "v23.0", "v22.0", ""])
    );
    const nodes = igUserId ? ["me", igUserId] : ["me"];
    const attempts: { base: string; node: string }[] = [];
    for (const node of nodes) {
      for (const version of versions) {
        attempts.push({
          base: version ? `${GRAPH_ROOT}/${version}` : GRAPH_ROOT,
          node,
        });
      }
    }

    let profile: any = null;
    let workingBase = GRAPH_BASE;
    let workingNode = "me";
    let lastMessage = "No response";
    for (const attempt of attempts) {
      const probeParams = new URLSearchParams({
        fields: "username",
        access_token: accessToken,
      });
      const res = await fetch(
        `${attempt.base}/${attempt.node}?${probeParams}`
      );
      const json = await res.json().catch(() => null);
      if (res.ok && json && !json.error) {
        workingBase = attempt.base;
        workingNode = attempt.node;

        const fullParams = new URLSearchParams({
          fields: FULL_PROFILE_FIELDS,
          access_token: accessToken,
        });
        const fullRes = await fetch(
          `${workingBase}/${workingNode}?${fullParams}`
        );
        const fullJson = await fullRes.json().catch(() => null);
        // Falling back to the probe payload keeps the connection usable even
        // if one of the richer fields is rejected.
        profile = fullRes.ok && fullJson && !fullJson.error ? fullJson : json;
        console.log(
          "[instagram] profile ok via",
          `${attempt.base.replace(GRAPH_ROOT, "") || "/"}/${attempt.node === "me" ? "me" : "<id>"}`
        );
        break;
      }
      lastMessage = json?.error?.message || `HTTP ${res.status}`;
      console.error(
        `[instagram] probe failed (${attempt.base.replace(GRAPH_ROOT, "") || "/"}` +
          `/${attempt.node === "me" ? "me" : "<id>"}):`,
        JSON.stringify(json?.error ?? json)?.slice(0, 200)
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
    const mediaRes = await fetch(
      `${workingBase}/${workingNode}/media?${mediaParams}`
    );
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
  accessToken: string,
  igUserId?: string
): Promise<InstagramProfileData | null> => {
  const result = await fetchInstagramProfileResult(accessToken, igUserId);
  return result.ok ? result.profile : null;
};
