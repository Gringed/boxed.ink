import { NextResponse } from "next/server";
import { currentUser } from "@/auth/current-user";
import { getTikTokAuthUrl } from "@/lib/tiktok";
import { tiktokRedirectUri } from "@/lib/socialConnection";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/signIn", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  if (!process.env.TIKTOK_CLIENT_KEY) {
    return NextResponse.redirect(
      new URL("/dashboard?social=tiktok&error=not_configured",
        process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  return NextResponse.redirect(getTikTokAuthUrl(tiktokRedirectUri(), user.id));
}
