import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/auth/current-user";
import { exchangeInstagramCode, fetchInstagramProfile } from "@/lib/instagram";
import {
  appUrl,
  instagramRedirectUri,
  saveConnection,
  syncProfileToSections,
} from "@/lib/socialConnection";

const back = (status: string) =>
  NextResponse.redirect(`${appUrl()}/dashboard?social=instagram&status=${status}`);

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(`${appUrl()}/auth/signIn`);

  const { searchParams } = new URL(request.url);

  // The user pressed "Cancel" on Instagram's consent screen — not an error
  // worth alarming them about.
  if (searchParams.get("error")) return back("cancelled");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || state !== user.id) return back("error");

  const tokens = await exchangeInstagramCode(code, instagramRedirectUri());
  if (!tokens) return back("error");

  const profile = await fetchInstagramProfile(tokens.accessToken);
  // A personal account authenticates fine but can't expose media or a
  // follower count, so the profile call is what actually catches it. Told
  // apart from a generic failure so the UI can explain the fix.
  if (!profile) return back("personal_account");

  await saveConnection({
    userId: user.id,
    provider: "INSTAGRAM",
    providerUserId: tokens.userId,
    username: profile.username,
    accessToken: tokens.accessToken,
    expiresAt: tokens.expiresAt,
  });
  await syncProfileToSections(user.id, "INSTAGRAM", profile);

  return back("connected");
}
