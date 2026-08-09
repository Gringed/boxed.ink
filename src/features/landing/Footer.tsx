"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Section } from "./Section";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "./FadeInSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CopyrightIcon } from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signInAction } from "../auth/auth.action";
import { PageLoader } from "@/components/PageLoader";

type FooterProps = {
  user?: any;
};

const Footer = ({ user }: FooterProps) => {
  const t = useTranslations("footer");
  const tHero = useTranslations("hero");
  const router = useRouter();
  const [name, setName] = useState<String>();
  const [isPending, startTransition] = useTransition();
  return (
    <FadeInSection>
      <Section
        id="signup"
        className="py-2 !max-w-full  bg-gray-100 w-full col-start-1 row-start-1 h-full bg-opacity-20"
      >
        <section
          className=" col-start-1 row-start-1 grid place-items-center w-full h-full overflow-hidden min-h-screen"
          id="signup"
        >
          <div className="col-start-1 row-start-1 text-center ">
            <div className="max-w-4xl space-y-12 md:space-y-24 p-6">
              <h2 className="text-5xl relative font-black text-primary  md:text-6xl md:leading-tight lg:text-7xl lg:leading-tight">
                {t("buildNow")}
                <Image
                  unselectable="on"
                  className="absolute  pointer-events-none  left-0 sm:left-1/4 inset-x-0"
                  src={"lines.svg"}
                  width={200}
                  height={20}
                  alt="d"
                />
              </h2>
              <div className="max-w-2xl mx-auto">
                {user ? (
                  <Button
                    className="h-12 w-full px-6 text-base"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => router.push("/dashboard"))
                    }
                  >
                    {tHero("continueCta")}{" "}
                    <ArrowRight className="ml-2" size={15} />
                  </Button>
                ) : (
                  <div className="flex h-12 w-full items-stretch overflow-hidden rounded-md border border-noir/10 bg-white shadow-sm">
                    <span className="flex shrink-0 items-center bg-noir/5 pl-5 pr-3 font-medium text-noir/70">
                      boxed.ink/
                    </span>
                    <Input
                      type="text"
                      placeholder={t("handlePlaceholder")}
                      className="h-full min-w-[6rem] flex-1 rounded-none border-0 bg-white py-0 pl-3 text-base shadow-none focus-visible:ring-0"
                      required
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Button
                      className="h-full shrink-0 rounded-none px-6 text-base"
                      disabled={!name || isPending}
                      onClick={() => {
                        startTransition(() => signInAction());
                      }}
                    >
                      {t("cta")} <ArrowRight className="ml-2" size={15} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Section>
      <div className="w-full overflow-hidden">
        <div className="w-full bg-noir py-4 -rotate-1 scale-110">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="flex items-center text-white/80 font-black text-lg sm:text-xl tracking-tight uppercase shrink-0"
              >
                {Array.from({ length: 6 }).map((_, j) => (
                  <span key={j} className="flex items-center shrink-0">
                    <span className="text-primary mx-4">✦</span>
                    {t("marquee.bentoGrid")}
                    <span className="text-primary mx-4">✦</span>
                    {t("marquee.linkInBio")}
                    <span className="text-primary mx-4">✦</span>
                    {t("marquee.twitch")}
                    <span className="text-primary mx-4">✦</span>
                    {t("marquee.youtube")}
                    <span className="text-primary mx-4">✦</span>
                    {t("marquee.freeForever")}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full relative bg-primary text-white  border-t-4 border-black">
        <Section className="py-10">
          <div className="flex flex-col justify-center w-full">
            <div className="flex items-center lg:justify-between flex-col lg:flex-row gap-5 my-5 lg:my-1">
              <div className="flex items-center gap-3 font-medium">
                <CopyrightIcon />
                {t("copyright", { year: new Date().getFullYear() })}
              </div>
              <div className="flex gap-5 font-medium flex-col lg:flex-row flex-wrap items-center">
                <Link href={"/changelog"}>{t("changelog")}</Link>
                <Link href={"/tos"}>{t("terms")}</Link>
                <Link href={"/policy"}>{t("privacy")}</Link>
                <Link
                  href={
                    "mailto:alexandre.guillome@yucatech.fr?subject=Help me with boxed.ink"
                  }
                >
                  {t("contact")}
                </Link>
                <Link
                  href="https://calendly.com/alexandre-guillome/premiere-impression"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("madeBy")}
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </div>
      <AnimatePresence>{isPending && <PageLoader />}</AnimatePresence>
    </FadeInSection>
  );
};

export default Footer;
