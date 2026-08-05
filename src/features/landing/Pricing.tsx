import React from "react";
import { Section } from "./Section";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowRight,
  LayoutGrid,
  Link2,
  Paintbrush,
  MessageCircleHeart,
  Share2,
  Infinity as InfinityIcon,
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Drag-and-drop blocks",
    description: "Build your page like a bento grid, not a list of links.",
  },
  {
    icon: Link2,
    title: "Everything in one place",
    description: "Links, images, text - all your data lives on one page.",
  },
  {
    icon: Paintbrush,
    title: "Fully customizable",
    description: "Colors, layout, sizing - make it look like you.",
  },
  {
    icon: MessageCircleHeart,
    title: "Real support",
    description: "A human reviews and helps, not a bot.",
  },
  {
    icon: Share2,
    title: "Share with one link",
    description: "Publish and send your bentoh.me to anyone.",
  },
];

const Pricing = () => {
  return (
    <Section className="lg:py-16 py-8">
      <div className="flex w-full flex-col items-center gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="max-w-2xl text-4xl text-center font-black tracking-tight leading-none md:text-5xl  text-noir">
            Build your bentoh.me for{" "}
            <span className="text-primary">free</span>
          </h1>
        </div>
        <p className="max-w-lg  text-center font-medium text-foreground/70 text-base">
          No trial. No credit card. No catch.
        </p>

        <div className="mt-5 w-full max-w-4xl overflow-hidden rounded-2xl border shadow-xl md:flex">
          <div className="flex flex-col items-center justify-center gap-3 bg-primary p-10 text-center text-primary-foreground md:w-2/5 md:p-12">
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
              <InfinityIcon size={16} />
              Free forever
            </div>
            <div className="font-black leading-none text-7xl md:text-8xl">
              €0
            </div>
            <p className="font-medium text-primary-foreground/80">
              No credit card required. Live in minutes.
            </p>
          </div>

          <div className="flex flex-col gap-6 bg-white p-8 md:w-3/5 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-noir">{title}</div>
                    <div className="text-sm text-foreground/60">
                      {description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="auth/signIn"
              className={cn(
                buttonVariants({ variant: "default" }),
                "group flex h-14 w-full items-center justify-center text-lg font-bold"
              )}
            >
              Start for free
              <ArrowRight
                className="ml-2 transition-transform group-hover:translate-x-1"
                size={20}
              />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Pricing;
