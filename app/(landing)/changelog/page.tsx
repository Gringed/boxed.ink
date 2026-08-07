import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { Section } from "@/features/landing/Section";
import Footer from "@/features/landing/Footer";
import React from "react";

const page = () => {
  return (
    <>
      <LandingHeader />
      <div className="flex flex-col w-full">
        <Section className="flex flex-col items-start text-medium text-justify py-10 w-full gap-10">
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 7, 2026 - Block polish, all around
              </h1>
              <Separator />
            </div>
            <div className="flex flex-col gap-3">
              <p>
                A round of quality-of-life improvements across most block
                types:
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>
                  <span className="font-semibold">Link blocks</span> got a
                  redesign - edit the title directly on the block instead of
                  being stuck with whatever the page's metadata gave you, the
                  full URL now shows below it, the whole block is clickable
                  and opens in a new tab, and colors auto-adjust for
                  readability whatever background you pick.
                </li>
                <li>
                  <span className="font-semibold">Image blocks</span> are
                  centered and auto-fitted to the block by default now,
                  instead of needing a manual crop every time - you can still
                  drag to crop manually if you want a specific framing.
                </li>
                <li>
                  <span className="font-semibold">Text blocks</span> no
                  longer jump into edit mode on a single click while you're
                  rearranging your page - double-click (or double-tap on
                  mobile) to edit, click away to go back to normal.
                </li>
                <li>
                  Your{" "}
                  <span className="font-semibold">location</span> is now
                  shown on a real interactive map (search-as-you-type,
                  zoomable) instead of just as text.
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 6, 2026 - Twitch and YouTube channel blocks
              </h1>
              <Separator />
            </div>
            <div className="flex flex-col gap-4">
              <p>
                You can now drop a Twitch or YouTube channel link straight
                into your page. We automatically fetch the channel's avatar,
                name and live status (or category for Twitch), and turn it
                into a proper card with a Watch button - no manual setup
                needed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="aspect-video w-full rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center text-sm text-muted-foreground">
                  Video coming soon
                </div>
                <div className="aspect-video w-full rounded-xl border border-dashed border-muted-foreground/30 flex items-center justify-center text-sm text-muted-foreground">
                  Video coming soon
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 5, 2026 - A new name, a fresh start
              </h1>
              <Separator />
            </div>
            <div>
              <p>
                Before today, bentoh was known as SidePro. This whole rebuild
                started because bento.me shut down and got bought out by
                Linktree - we didn't want that idea to just die, so we
                decided to take it back into our own hands. Same mission -
                help you show off your work - but rethought completely, from
                the name to the design.
              </p>
            </div>
          </div>
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default page;
