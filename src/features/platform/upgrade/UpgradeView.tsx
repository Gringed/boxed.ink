"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Section } from "@/features/landing/Section";
import { PageLoader } from "@/components/PageLoader";
import {
  manageBillingAction,
  subscribeAction,
} from "@/lib/actions/sidefolio/sidefolio.actions";

type UpgradeViewProps = {
  user: any;
  sidefolio: any;
};

export const UpgradeView = ({ user, sidefolio }: UpgradeViewProps) => {
  const t = useTranslations("upgrade");
  const tFooter = useTranslations("footer");
  const isPremium = user?.plan === "PRO";
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBackToEditor = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => router.push("/dashboard"));
  };

  const handleSubscribe = () => {
    startTransition(async () => {
      const res = await subscribeAction({});
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    });
  };

  const handleManage = () => {
    startTransition(async () => {
      const res = await manageBillingAction({});
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    });
  };

  return (
    <>
      <Section className="flex-1 py-16 lg:py-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-start">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-noir/5 px-4 py-1.5 text-sm font-bold text-noir">
              <Sparkles size={15} className="text-amber-500" />
              {t("eyebrow")}
            </div>
            <h1 className="max-w-xl text-center text-4xl font-black tracking-tight text-noir md:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-md text-base font-medium text-noir/70">
              {t("subtitle")}
            </p>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border shadow-xl md:flex">
            <div className="flex flex-col items-center justify-center gap-2 bg-noir p-10 text-white md:w-2/5">
              <div className="text-6xl font-black leading-none md:text-7xl">
                {t("price")}
              </div>
              <p className="font-medium text-white/60 text-sm">
                {t("priceNote")}
              </p>
            </div>

            <div className="flex flex-col gap-6 bg-white p-8 text-left md:w-3/5 md:p-10">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-noir">
                    {t("featureTitle")}
                    <span className="rounded-full bg-noir/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-noir/60">
                      {t("comingSoonBadge")}
                    </span>
                  </div>
                  <div className="text-sm text-foreground/60">
                    {t("featureDescription")}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-noir/5 text-noir">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="font-bold text-noir">
                    {t("comingSoonTitle")}
                  </div>
                  <div className="text-sm text-foreground/60">
                    {t("comingSoonDescription")}
                  </div>
                </div>
              </div>

              {isPremium ? (
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-noir">
                    {t("alreadyTitle")}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {t("alreadyDescription")}
                  </p>
                  <Button
                    className="mt-2 h-12 w-full text-base font-bold"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleManage}
                  >
                    {t("manageCta")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm font-medium text-noir/80">
                    <Heart
                      size={15}
                      className="mt-0.5 shrink-0 fill-primary/20 text-primary"
                    />
                    {t("supportNote")}
                  </p>
                  <Button
                    className="h-12 w-full text-base font-bold"
                    disabled={isPending}
                    onClick={handleSubscribe}
                  >
                    {t("cta")}
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/dashboard"
            onClick={handleBackToEditor}
            className="text-sm font-semibold text-noir/50 hover:text-noir transition-colors"
          >
            {t("backToEditor")}
          </Link>
        </div>
      </Section>
      <AnimatePresence>{isPending && <PageLoader />}</AnimatePresence>
      <footer className="mt-auto w-full border-t py-6">
        <Section className="flex flex-col items-center justify-center gap-3 text-sm font-medium text-foreground/60 sm:flex-row sm:justify-between">
          <span>{tFooter("copyright", { year: new Date().getFullYear() })}</span>
          <div className="flex gap-5">
            <Link href="/tos" className="hover:text-noir transition-colors">
              {tFooter("terms")}
            </Link>
            <Link href="/policy" className="hover:text-noir transition-colors">
              {tFooter("privacy")}
            </Link>
            <Link
              href="mailto:alexandre.guillome@yucatech.fr?subject=Help me with boxed.ink"
              className="hover:text-noir transition-colors"
            >
              {tFooter("contact")}
            </Link>
          </div>
        </Section>
      </footer>
    </>
  );
};
