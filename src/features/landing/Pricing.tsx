"use client";
import React from "react";
import { Section } from "./Section";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Check,
  Sparkles,
  Infinity as InfinityIcon,
} from "lucide-react";

const featureKeys = [
  "dragDrop",
  "everything",
  "customizable",
  "support",
  "share",
] as const;

const Pricing = () => {
  const t = useTranslations("pricing");
  return (
    <Section id="pricing" className="lg:py-16 py-8 scroll-mt-28">
      <div className="flex w-full flex-col items-center gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="max-w-2xl text-4xl text-center font-black tracking-tight leading-none md:text-5xl  text-noir">
            {t("titlePrefix")}{" "}
            <span className="text-primary">{t("titleHighlight")}</span>
          </h1>
        </div>
        <p className="max-w-lg  text-center font-medium text-foreground/70 text-base">
          {t("subtitle")}
        </p>

        <div className="mt-5 grid w-full max-w-4xl gap-6 md:grid-cols-2">
          {/* Free plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border shadow-xl">
            <div className="flex flex-col items-center gap-2 bg-primary p-8 text-center text-primary-foreground">
              <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
                <InfinityIcon size={16} />
                {t("freeForever")}
              </div>
              <div className="font-black leading-none text-6xl">
                {t("price")}
              </div>
              <p className="font-medium text-primary-foreground/80 text-sm">
                {t("priceNote")}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-5 bg-white p-8">
              <ul className="flex flex-1 flex-col gap-3">
                {featureKeys.map((key) => (
                  <li key={key} className="flex items-center gap-2.5">
                    <Check size={18} className="shrink-0 text-primary" />
                    <span className="font-medium text-noir">
                      {t(`features.${key}.title`)}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="auth/signIn"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "group flex h-14 w-full items-center justify-center text-lg font-bold"
                )}
              >
                {t("cta")}
                <ArrowRight
                  className="ml-2 transition-transform group-hover:translate-x-1"
                  size={20}
                />
              </Link>
            </div>
          </div>

          {/* Pro plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border shadow-xl">
            <div className="flex flex-col items-center gap-2 bg-noir p-8 text-center text-white">
              <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
                <Sparkles size={16} />
                {t("premium.title")}
              </div>
              <div className="font-black leading-none text-6xl">
                {t("premium.price")}
              </div>
              <p className="font-medium text-white/70 text-sm">
                {t("premium.priceNote")}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-5 bg-white p-8">
              <ul className="flex flex-1 flex-col gap-3">
                {featureKeys.map((key) => (
                  <li key={key} className="flex items-center gap-2.5">
                    <Check size={18} className="shrink-0 text-primary" />
                    <span className="font-medium text-noir">
                      {t(`features.${key}.title`)}
                    </span>
                  </li>
                ))}
                <li className="flex items-center gap-2.5">
                  <Check size={18} className="shrink-0 text-noir" />
                  <span className="font-bold text-noir">
                    {t("premium.featureTitle")}
                  </span>
                </li>
                <li className="flex items-center gap-2.5 opacity-50">
                  <Sparkles size={16} className="shrink-0 text-noir" />
                  <span className="font-medium text-noir">
                    {t("premium.comingSoon")}
                  </span>
                </li>
              </ul>

              <Link
                href="/upgrade"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group flex h-14 w-full items-center justify-center text-lg font-bold border-noir text-noir hover:bg-noir hover:text-white"
                )}
              >
                {t("premium.cta")}
                <ArrowRight
                  className="ml-2 transition-transform group-hover:translate-x-1"
                  size={20}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Pricing;
