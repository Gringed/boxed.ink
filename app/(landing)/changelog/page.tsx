import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { Section } from "@/features/landing/Section";
import Footer from "@/features/landing/Footer";
import React from "react";
import { currentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { getTranslations } from "next-intl/server";
import { ChangelogText } from "@/features/landing/ChangelogText";

interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  intro?: string;
  items?: string[];
}

const ENTRY_VIDEOS: Record<string, string[]> = {
  "channel-blocks": [
    "https://res.cloudinary.com/dhgoagdvr/video/upload/v1786116355/Sidepro/bentoh.me_twitch_uwwac9.mp4",
    "https://res.cloudinary.com/dhgoagdvr/video/upload/v1786116355/Sidepro/bentoh.me_yt_e7tthq.mp4",
  ],
};

const page = async () => {
  const user = await currentUser();
  const sidefolio = user
    ? await prisma.sidefolio.findFirst({ where: { authorId: user.id } })
    : null;

  const t = await getTranslations("changelog");
  const entries = t.raw("entries") as ChangelogEntry[];

  return (
    <>
      <LandingHeader user={user} sidefolio={sidefolio} />
      <div className="flex flex-col w-full">
        <Section className="flex flex-col items-start text-medium text-justify py-10 w-full gap-10">
          {entries.map((entry) => {
            const videos = ENTRY_VIDEOS[entry.id];
            return (
              <div className="w-full" key={entry.id}>
                <div className="mb-5 flex gap-3 flex-col">
                  <h1 className="text-2xl font-bold">
                    {entry.date} - {entry.title}
                  </h1>
                  <Separator />
                </div>
                <div className="flex flex-col gap-4">
                  {entry.intro && (
                    <p>
                      <ChangelogText>{entry.intro}</ChangelogText>
                    </p>
                  )}
                  {entry.items && (
                    <ul className="list-disc pl-6 flex flex-col gap-2">
                      {entry.items.map((item, index) => (
                        <li key={index}>
                          <ChangelogText>{item}</ChangelogText>
                        </li>
                      ))}
                    </ul>
                  )}
                  {videos && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {videos.map((src) => (
                        <video
                          key={src}
                          className="aspect-video w-full rounded-xl border border-neutral-300 bg-gray-100 object-contain"
                          src={src}
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Section>
      </div>
      <Footer user={user} />
    </>
  );
};

export default page;
