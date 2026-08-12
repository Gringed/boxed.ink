import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { refreshTwitchChannelData } from "@/lib/twitch";
import { refreshYouTubeChannelData } from "@/lib/youtube";
import {
  fetchProfileForConnection,
  syncProfileToSections,
} from "@/lib/socialConnection";

// Hobby plan caps cron jobs at once a day (see vercel.json) — this refreshes
// every Twitch/YouTube channel card's live status/category/subscriber count
// in the background, so pages never trigger a fetch on view (which is what
// was causing 429s from Twitch/YouTube during testing).
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sections = await prisma.section.findMany({
    where: { type: "LINK" },
    select: { id: true, link: true },
  });

  const results = await Promise.allSettled(
    sections.map(async (section) => {
      const link = section.link as any;
      if (!link) return "skipped";

      if (link.twitch?.channelUrl) {
        const fresh = await refreshTwitchChannelData(link.twitch.channelUrl);
        if (!fresh) return "failed";
        await prisma.section.update({
          where: { id: section.id },
          data: { link: { ...link, twitch: { ...link.twitch, ...fresh } } },
        });
        return "updated";
      }

      if (link.youtube?.channelId) {
        const fresh = await refreshYouTubeChannelData(link.youtube.channelId);
        if (!fresh) return "failed";
        await prisma.section.update({
          where: { id: section.id },
          data: { link: { ...link, youtube: { ...link.youtube, ...fresh } } },
        });
        return "updated";
      }

      return "skipped";
    })
  );

  // Instagram/TikTok are keyed off the user's OAuth connection rather than a
  // url on the block, so they're refreshed per connection and fanned out to
  // that user's blocks — and the token gets renewed in the same pass.
  const connections = await prisma.socialConnection.findMany();
  let socialUpdated = 0;
  let socialFailed = 0;
  for (const connection of connections) {
    try {
      const profile = await fetchProfileForConnection(connection);
      if (!profile) {
        socialFailed++;
        continue;
      }
      await syncProfileToSections(
        connection.userId,
        connection.provider,
        profile
      );
      socialUpdated++;
    } catch {
      socialFailed++;
    }
  }

  const summary = {
    checked: sections.length,
    updated: 0,
    failed: 0,
    skipped: 0,
    socialConnections: connections.length,
    socialUpdated,
    socialFailed,
  };
  for (const result of results) {
    if (result.status === "fulfilled") {
      summary[result.value as "updated" | "failed" | "skipped"]++;
    } else {
      summary.failed++;
    }
  }

  return NextResponse.json({ ok: true, ...summary });
}
