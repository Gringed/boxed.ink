import { NextResponse } from "next/server";
import { currentUser } from "@/auth/current-user";
import { getInstagramAuthUrl } from "@/lib/instagram";
import { instagramRedirectUri } from "@/lib/socialConnection";

// Kicks off the Instagram consent flow. The user id travels in `state` and
// is checked again on the way back, so a stray callback can't attach someone
// else's account.
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/signIn", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  if (!process.env.INSTAGRAM_APP_ID) {
    return NextResponse.redirect(
      new URL("/dashboard?social=instagram&error=not_configured",
        process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  return NextResponse.redirect(
    getInstagramAuthUrl(instagramRedirectUri(), user.id)
  );
}
