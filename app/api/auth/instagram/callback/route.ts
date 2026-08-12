import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/auth/current-user";
import {
  exchangeInstagramCode,
  fetchInstagramProfileResult,
} from "@/lib/instagram";
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

  const result = await fetchInstagramProfileResult(
    tokens.accessToken,
    tokens.userId
  );
  if (!result.ok) {
    // Only Instagram saying "PERSONAL" earns the account-type message —
    // anything else is a real failure and gets logged with its own reason,
    // rather than sending the user off to change a setting for nothing.
    if (result.reason === "personal_account") return back("personal_account");
    console.error("[instagram] profile fetch failed:", result.message);
    return back("error");
  }
  const profile = result.profile;

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
