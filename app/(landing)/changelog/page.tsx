import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { Section } from "@/features/landing/Section";
import Footer from "@/features/landing/Footer";
import React from "react";
import { currentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";

const page = async () => {
  const user = await currentUser();
  const sidefolio = user
    ? await prisma.sidefolio.findFirst({ where: { authorId: user.id } })
    : null;

  return (
    <>
      <LandingHeader user={user} sidefolio={sidefolio} />
      <div className="flex flex-col w-full">
        <Section className="flex flex-col items-start text-medium text-justify py-10 w-full gap-10">
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 8, 2026 - A smoother editor
              </h1>
              <Separator />
            </div>
            <div className="flex flex-col gap-3">
              <p>
                A pass on how the editor <i>feels</i> to use, not just what it
                does:
              </p>
              <ul className="list-disc pl-6 flex flex-col gap-2">
                <li>
                  <span className="font-semibold">Dragging a block</span> now
                  has some weight to it - it tilts and lifts in the direction
                  you're moving it, and the little edit icons get out of the
                  way while you drag instead of cluttering the view.
                </li>
                <li>
                  <span className="font-semibold">Saving</span> no longer
                  spams you with a toast every few seconds - the share button
                  just does a quick checkmark pulse when your change lands.
                </li>
                <li>
                  Every loading state in the app - dashboard, your page,
                  sign-in - now uses the same clean logo animation instead of
                  a mix of different spinners.
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 8, 2026 - Introducing boxed.ink Pro
              </h1>
              <Separator />
            </div>
            <div className="flex flex-col gap-3">
              <p>
                boxed.ink stays free forever, but there's now a Pro plan
                (€4.99/mo) for people who want to go further - starting with a{" "}
                <span className="font-semibold">custom domain</span> instead
                of boxed.ink/yourname. More Pro features are on the way. You
                can manage it anytime from your account menu.
              </p>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 8, 2026 - Speak your language
              </h1>
              <Separator />
            </div>
            <div className="flex flex-col gap-3">
              <p>
                boxed.ink is now available in{" "}
                <span className="font-semibold">English and French</span> -
                the landing page, the editor, your published page and this
                changelog all follow whichever you pick. Switch anytime with
                the flag in the top corner.
              </p>
            </div>
          </div>
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">
                August 8, 2026 - bentoh.me is now boxed.ink
              </h1>
              <Separator />
            </div>
            <div>
              <p>
                Another rename - this one's the last for a while. bentoh.me
                is now boxed.ink. Nothing about the product changes, your
                pages and data are untouched, just a new name and a domain
                that's easier to hold onto long-term.
              </p>
            </div>
          </div>
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
                <video
                  className="aspect-video w-full rounded-xl border border-neutral-300 bg-gray-100 object-contain"
                  src="https://res.cloudinary.com/dhgoagdvr/video/upload/v1786116355/Sidepro/bentoh.me_twitch_uwwac9.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <video
                  className="aspect-video w-full rounded-xl border border-neutral-300 bg-gray-100 object-contain"
                  src="https://res.cloudinary.com/dhgoagdvr/video/upload/v1786116355/Sidepro/bentoh.me_yt_e7tthq.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
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
      <Footer user={user} />
    </>
  );
};

export default page;
