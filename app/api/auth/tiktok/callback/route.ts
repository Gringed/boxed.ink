import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/auth/current-user";
import { exchangeTikTokCode, fetchTikTokProfile } from "@/lib/tiktok";
import {
  appUrl,
  saveConnection,
  syncProfileToSections,
  tiktokRedirectUri,
} from "@/lib/socialConnection";

const back = (status: string) =>
  NextResponse.redirect(`${appUrl()}/dashboard?social=tiktok&status=${status}`);

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(`${appUrl()}/auth/signIn`);

  const { searchParams } = new URL(request.url);
  if (searchParams.get("error")) return back("cancelled");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || state !== user.id) return back("error");

  const tokens = await exchangeTikTokCode(code, tiktokRedirectUri());
  if (!tokens) return back("error");

  const profile = await fetchTikTokProfile(tokens.accessToken);
  if (!profile) return back("error");

  await saveConnection({
    userId: user.id,
    provider: "TIKTOK",
    providerUserId: tokens.userId || profile.userId,
    username: profile.username,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    scope: tokens.scope,
  });
  await syncProfileToSections(user.id, "TIKTOK", profile);

  return back("connected");
}
