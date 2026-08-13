"use client";
import { Input } from "@/components/ui/input";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Image as ImageIcon, Link2, Type } from "lucide-react";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signInAction } from "../auth/auth.action";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { FlipWords } from "@/components/ui/flip-words";
import { PageLoader } from "@/components/PageLoader";

type HeroSectionProps = {
  user?: any;
};

export const HeroSection = ({ user }: HeroSectionProps) => {
  const t = useTranslations("hero");
  const router = useRouter();
  const pills = [
    { label: t("pillLink"), icon: Link2 },
    { label: t("pillImage"), icon: ImageIcon },
    { label: t("pillText"), icon: Type },
    {
      label: t("pillYoutube"),
      img: "https://www.google.com/s2/favicons?sz=64&domain=youtube.com",
    },
    {
      label: t("pillTwitch"),
      img: "https://www.google.com/s2/favicons?sz=64&domain=twitch.tv",
    },
  ];
  const [name, setName] = useState<string>();
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Section className="mt-16 lg:mt-20 py-10 lg:py-20 h-full relative">
        <div className="flex w-full justify-center overflow-hidden h-full items-center">
          {/* floating mockups of real app blocks */}
          <motion.div
            aria-hidden
            initial={{ rotate: -12 }}
            animate={{ y: [0, -10, 0], rotate: -12 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -left-6 top-4 hidden md:flex w-40 rounded-2xl bg-white shadow-xl border border-noir/5 items-center gap-3 p-3.5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2FBF71]/15">
              <Link2 size={18} className="text-[#2FBF71]" />
            </span>
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="block h-2 w-full rounded-full bg-noir/15" />
              <span className="block h-2 w-3/5 rounded-full bg-noir/10" />
            </span>
          </motion.div>

          <motion.div
            aria-hidden
            initial={{ rotate: 14 }}
            animate={{ y: [0, -8, 0], rotate: 14 }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="pointer-events-none absolute right-0 top-20 hidden md:flex w-32 rounded-2xl bg-[#8E86F0] shadow-xl flex-col justify-center gap-2 p-4"
          >
            <span className="block h-2 w-full rounded-full bg-white/70" />
            <span className="block h-2 w-4/5 rounded-full bg-white/50" />
            <span className="block h-2 w-2/3 rounded-full bg-white/40" />
          </motion.div>

          <motion.div
            aria-hidden
            initial={{ rotate: 8 }}
            animate={{ y: [0, -9, 0], rotate: 8 }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="pointer-events-none absolute left-6 bottom-6 hidden lg:flex w-36 rounded-2xl bg-white shadow-xl border border-noir/5 items-center gap-3 p-3"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-noir/5">
              <img
                src="https://www.google.com/s2/favicons?sz=64&domain=youtube.com"
                alt=""
                className="size-6 object-contain"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </span>
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="block h-2 w-full rounded-full bg-noir/15" />
              <span className="block h-2 w-2/5 rounded-full bg-red-400/60" />
            </span>
          </motion.div>

          <motion.div
            aria-hidden
            initial={{ rotate: -10 }}
            animate={{ y: [0, -11, 0], rotate: -10 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="pointer-events-none absolute right-10 bottom-0 hidden lg:flex w-36 rounded-2xl bg-white shadow-xl border border-noir/5 items-center gap-3 p-3"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-noir/5">
              <img
                src="https://www.google.com/s2/favicons?sz=64&domain=twitch.tv"
                alt=""
                className="size-6 object-contain"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </span>
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="block h-2 w-full rounded-full bg-noir/15" />
              <span className="block h-2 w-2/5 rounded-full bg-[#9146FF]/50" />
            </span>
          </motion.div>

          <div className="flex flex-col z-10 gap-8 max-w-2xl w-full">
            <div className="flex flex-col gap-2 text-left">
              <h1 className="text-4xl font-black tracking-tight leading-tight md:text-5xl xl:text-6xl text-noir">
                {t("titleLine1")}
              </h1>
              <h1 className="relative text-4xl font-black tracking-tight leading-tight md:text-5xl xl:text-6xl text-primary whitespace-nowrap">
                {t("titleLine2Prefix")}{" "}
                <FlipWords
                  className="text-primary"
                  words={t.raw("flipWords") as string[]}
                />
              </h1>
            </div>

            <p className="max-w-2xl text-left text-base font-medium text-noir/80 md:text-lg">
              {t("subtitle")}{" "}
              <span className="text-primary font-bold">
                {t("subtitleHighlight")}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2.5 text-base font-medium text-noir/70">
              <span>{t("pillsPrefix")}</span>
              {pills.map(({ label, icon: Icon, img }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-noir/10 bg-white px-4 py-1.5 shadow-sm"
                >
                  {img ? (
                    <img src={img} alt="" className="size-4 shrink-0" />
                  ) : (
                    Icon && <Icon size={17} className="text-primary shrink-0" />
                  )}
                  {label}
                </span>
              ))}
              <span>{t("pillsSuffix")}</span>
            </div>

            {user ? (
              <div className="flex flex-col gap-3 text-left">
                <Button
                  className="h-12 w-full px-6 text-base"
                  disabled={isPending}
                  onClick={() => startTransition(() => router.push("/dashboard"))}
                >
                  {t("continueCta")} <ArrowRight className="ml-2" size={15} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-left">
                <p className="font-semibold text-noir">{t("handlePrompt")}</p>
                <div className="flex flex-col sm:h-12 w-full items-stretch overflow-hidden rounded-md border border-noir/10 bg-white shadow-sm sm:flex-row">
                  <div className="flex h-12 min-w-0 sm:flex-1">
                    <span className="flex shrink-0 items-center bg-noir/5 pl-5 pr-3 font-medium text-noir/70">
                      boxed.ink/
                    </span>
                    <Input
                      type="text"
                      placeholder={t("handlePlaceholder")}
                      className="h-full min-w-0 flex-1 rounded-none border-0 bg-white py-0 pl-3 text-base shadow-none focus-visible:ring-0"
                      required
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <Button
                    className="h-12 w-full shrink-0 rounded-none px-6 text-base sm:h-full sm:w-auto"
                    disabled={!name || isPending}
                    onClick={() => startTransition(() => signInAction())}
                  >
                    {t("cta")} <ArrowRight className="ml-2" size={15} />
                  </Button>
                </div>
                <p className="text-sm font-medium text-noir/60">{t("tip")}</p>
              </div>
            )}
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
        </div>
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
