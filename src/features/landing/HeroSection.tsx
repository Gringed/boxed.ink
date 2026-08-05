"use client";
import { Input } from "@/components/ui/input";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useState, useTransition } from "react";
import { AnimatePresence } from "framer-motion";
import { signInAction } from "../auth/auth.action";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { FlipWords } from "@/components/ui/flip-words";
import { PageLoader } from "@/components/PageLoader";

export const HeroSection = () => {
  const [name, setName] = useState<string>();
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Section className="lg:py-20 py-10 h-full relative">
        <div className="flex w-full justify-center overflow-hidden h-full items-center">
          <div className="flex flex-col z-10 gap-8 max-w-2xl w-full">
            <div className="flex flex-col gap-2 text-left">
              <h1 className="text-4xl font-black tracking-tight leading-tight md:text-5xl xl:text-6xl text-noir">
                Your portfolio.
              </h1>
              <h1 className="relative text-4xl font-black tracking-tight leading-tight md:text-5xl xl:text-6xl text-primary">
                In few{" "}
                <FlipWords
                  className="text-primary"
                  words={["Moves.", "Blocks."]}
                />
              </h1>
            </div>

            <p className="max-w-2xl text-left text-base font-medium text-noir/80 md:text-lg">
              Ditch the stack of Linktree, Gumroad and Mailchimp tabs.{" "}
              <span className="text-primary font-bold">
                One page, built your way.
              </span>
            </p>

            <div className="flex flex-col gap-3 text-left">
              <p className="font-semibold text-noir">
                Grab your handle to start:
              </p>
              <div className="flex h-12 w-full items-stretch overflow-hidden rounded-md border border-noir/10 bg-white shadow-sm">
                <span className="flex shrink-0 items-center bg-noir/5 pl-5 pr-3 font-medium text-noir/70">
                  bentoh.me/
                </span>
                <Input
                  type="text"
                  placeholder="yourname"
                  className="h-full min-w-[6rem] flex-1 rounded-none border-0 bg-white py-0 pl-3 text-base shadow-none focus-visible:ring-0"
                  required
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  className="h-full shrink-0 rounded-none px-6 text-base"
                  disabled={!name || isPending}
                  onClick={() => startTransition(() => signInAction())}
                >
                  Claim and start building{" "}
                  <ArrowRight className="ml-2" size={15} />
                </Button>
              </div>
              <p className="text-sm font-medium text-noir/60">
                💡 Make it short and memorable - you'll be sharing it a lot.
              </p>
            </div>

            <a
              href="https://www.producthunt.com/posts/sidepro?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-sidepro"
              target="_blank"
              className="w-fit"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=463493&theme=light"
                alt="bentoh.me - Create&#0032;and&#0032;publish&#0032;professional&#0032;Side&#0032;easily | Product Hunt"
                width="300"
                height="54"
              />
            </a>
          </div>
        </div>
        <AnimatedGridPattern
          numSquares={30}
          width={100}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]",
            "inset-x-0 w-full -top-20  h-[100%] opacity-50 skew-y-6"
          )}
        />
      </Section>
      <AnimatePresence>{isPending && <PageLoader />}</AnimatePresence>
      <div className="h-[400px] my-5 w-full  overflow-hidden ">
        {/* <div className=" h-full    bg-gradient-to-b to-90% from-primary to-white"></div>
        <div className=" h-full  w-[200%] -ml-8 bg-gradient-to-b to-90% from-primary to-white"></div> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 250"
        >
          <g mask='url("#SvgjsMask1872")' fill="none">
            <rect
              width="1440"
              height="250"
              x="0"
              y="0"
              fill='url("#SvgjsLinearGradient1873")'
            ></rect>
            <path
              d="M 0,-1 C 144,12.4 432,59 720,66 C 1008,73 1296,40.4 1440,34L1440 250L0 250z"
              fill="rgba(3, 152, 92, 1)"
            ></path>
            <path
              d="M 0,189 C 288,180 1152,153 1440,144L1440 250L0 250z"
              fill="rgba(255, 255, 255, 1)"
            ></path>
          </g>
          <defs>
            <mask id="SvgjsMask1872">
              <rect width="1440" height="250" fill="#ffffff"></rect>
            </mask>
            <linearGradient
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              gradientUnits="userSpaceOnUse"
              id="SvgjsLinearGradient1873"
            >
              <stop stopColor="rgba(255, 255, 255, 1)" offset="0"></stop>
              <stop stopColor="rgba(255, 255, 255, 1)" offset="1"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
};
