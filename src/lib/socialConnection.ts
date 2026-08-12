import { prisma } from "@/prisma";
import { decryptToken, encryptToken } from "@/lib/crypto";
import {
  fetchInstagramProfile,
  refreshInstagramToken,
  type InstagramProfileData,
} from "@/lib/instagram";
import {
  fetchTikTokProfile,
  refreshTikTokToken,
  type TikTokProfileData,
} from "@/lib/tiktok";
import type { SocialProvider } from "@prisma/client";

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const instagramRedirectUri = () =>
  `${appUrl()}/api/auth/instagram/callback`;
export const tiktokRedirectUri = () => `${appUrl()}/api/auth/tiktok/callback`;

export const saveConnection = async (params: {
  userId: string;
  provider: SocialProvider;
  providerUserId: string;
  username?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scope?: string | null;
}) => {
  const data = {
    providerUserId: params.providerUserId,
    username: params.username ?? null,
    accessToken: encryptToken(params.accessToken),
    refreshToken: params.refreshToken
      ? encryptToken(params.refreshToken)
      : null,
    expiresAt: params.expiresAt ?? null,
    scope: params.scope ?? null,
  };
  return prisma.socialConnection.upsert({
    where: {
      userId_provider: { userId: params.userId, provider: params.provider },
    },
    create: { userId: params.userId, provider: params.provider, ...data },
    update: data,
  });
};

// Returns a usable access token, renewing it first when it's close to
// expiry. Null means the connection is unusable and the user has to
// reconnect — callers surface that as a "reconnect" state rather than an
// error, since an expired token isn't a failure of the app.
const RENEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const getValidAccessToken = async (connection: {
  id: string;
  provider: SocialProvider;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}): Promise<string | null> => {
  const accessToken = decryptToken(connection.accessToken);
  if (!accessToken) return null;

  const expiresSoon =
    !connection.expiresAt ||
    connection.expiresAt.getTime() - Date.now() < RENEW_WINDOW_MS;

  if (!expiresSoon) return accessToken;

  if (connection.provider === "INSTAGRAM") {
    const renewed = await refreshInstagramToken(accessToken);
    if (!renewed) return accessToken;
    await prisma.socialConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: encryptToken(renewed.accessToken),
        expiresAt: renewed.expiresAt,
      },
    });
    return renewed.accessToken;
  }

  // TikTok access tokens only last 24h, so the refresh token is the real
  // credential — without it there's nothing to renew from.
  const refreshToken = connection.refreshToken
    ? decryptToken(connection.refreshToken)
    : null;
  if (!refreshToken) return accessToken;

  const renewed = await refreshTikTokToken(refreshToken);
  if (!renewed) return accessToken;
  await prisma.socialConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: encryptToken(renewed.accessToken),
      refreshToken: renewed.refreshToken
        ? encryptToken(renewed.refreshToken)
        : connection.refreshToken,
      expiresAt: renewed.expiresAt,
    },
  });
  return renewed.accessToken;
};

export const fetchProfileForConnection = async (connection: {
  id: string;
  provider: SocialProvider;
  providerUserId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}): Promise<InstagramProfileData | TikTokProfileData | null> => {
  const token = await getValidAccessToken(connection);
  if (!token) return null;
  return connection.provider === "INSTAGRAM"
    ? // Some tokens resolve the account by id but not via /me, so the stored
      // id is passed as a fallback node.
      fetchInstagramProfile(token, connection.providerUserId)
    : fetchTikTokProfile(token);
};

// Writes the freshly fetched profile onto every link block of that platform
// belonging to the user, so the cards render from stored data and never
// trigger an API call on view.
export const syncProfileToSections = async (
  userId: string,
  provider: SocialProvider,
  profile: InstagramProfileData | TikTokProfileData
) => {
  const platform = provider === "INSTAGRAM" ? "instagram" : "tiktok";
  const sidefolios = await prisma.sidefolio.findMany({
    where: { authorId: userId },
    select: { id: true },
  });
  if (sidefolios.length === 0) return;

  const sections = await prisma.section.findMany({
    where: {
      sideId: { in: sidefolios.map((s) => s.id) },
      type: "LINK",
    },
    select: { id: true, link: true },
  });

  for (const section of sections) {
    const link = section.link as any;
    if (link?.socialProfile?.platform !== platform) continue;
    await prisma.section.update({
      where: { id: section.id },
      data: { link: { ...link, [platform]: profile } },
    });
  }
};

export const disconnectProvider = async (
  userId: string,
  provider: SocialProvider
) => {
  await prisma.socialConnection.deleteMany({ where: { userId, provider } });

  const platform = provider === "INSTAGRAM" ? "instagram" : "tiktok";
  const sidefolios = await prisma.sidefolio.findMany({
    where: { authorId: userId },
    select: { id: true },
  });
  const sections = await prisma.section.findMany({
    where: { sideId: { in: sidefolios.map((s) => s.id) }, type: "LINK" },
    select: { id: true, link: true },
  });

  for (const section of sections) {
    const link = section.link as any;
    if (!link || !link[platform]) continue;
    // Drop the cached profile too — leaving it would keep showing content
    // the user just revoked access to.
    const { [platform]: _removed, ...rest } = link;
    await prisma.section.update({
      where: { id: section.id },
      data: { link: rest },
    });
  }
};
