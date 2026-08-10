"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { usePathname, useRouter } from "next/navigation";
import { SignInButton } from "../auth/SignInButton";
import { LoggedInButton } from "../auth/LoggedInButton";
import { PageLoader } from "@/components/PageLoader";
import { FlagLanguageSwitcher } from "@/components/FlagLanguageSwitcher";
import { Logo } from "@/components/Logo";

type LandingHeaderProps = {
  user?: any;
  sidefolio?: any;
};

export function LandingHeader({ user, sidefolio }: LandingHeaderProps) {
  const t = useTranslations("header");
  const [hiddenChangeLog, setHiddenChangelog] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const { scrollY } = useScroll();

  useEffect(() => {
    const timeout = setTimeout(() => setHasArrived(true), 700);
    return () => clearTimeout(timeout);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setHiddenChangelog(true);
    } else {
      setHiddenChangelog(false);
    }
  });
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      startNavigation(() => router.push("/"));
    }
  };

  const handleChangelogClick = (e: React.MouseEvent) => {
    if (pathname !== "/changelog") {
      e.preventDefault();
      startNavigation(() => router.push("/changelog"));
    }
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      // Next.js Link's built-in hash-scroll is unreliable on some mobile
      // browsers — scroll manually instead of relying on it.
      e.preventDefault();
      document
        .getElementById("pricing")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative h-[110px]">
      <header className="fixed z-20 inset-x-0 top-4 flex justify-center px-4">
        <div className="flex items-center gap-7 sm:gap-8 md:min-w-[560px] justify-between rounded-full bg-noir/95 backdrop-blur-md text-white pl-6 pr-5 py-2.5 sm:py-3 border-1.5 border-white shadow-[0px_0px_20px_10px_hsl(var(--noir)/0.35)] sm:pl-6 sm:pr-3">
          <div
            onClick={handleLogoClick}
            className="flex cursor-pointer items-center gap-1.5 shrink-0"
          >
            <Logo width={24} className="text-white shrink-0 sm:hidden" />
            <Logo width={28} className="text-white shrink-0 hidden sm:block" />
            <span className="hidden sm:block font-MontserratAlt font-extrabold text-lg">
              boxed.ink
            </span>
          </div>
          <nav className="flex items-center gap-6 text-[11px] sm:text-sm font-medium text-white/70">
            <Link
              href="/#pricing"
              onClick={handlePricingClick}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              {t("pricing")}
            </Link>
            <Link
              href="/changelog"
              onClick={handleChangelogClick}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              {t("changelog")}
            </Link>
          </nav>
          <div className="shrink-0">
            <FlagLanguageSwitcher bare />
          </div>
          <div className="flex items-center gap-5 shrink-0 [&_button]:h-8 [&_button]:px-3 [&_button]:text-xs sm:[&_button]:h-9 sm:[&_button]:px-4 sm:[&_button]:text-sm">
            {user ? (
              <LoggedInButton user={user} sidefolio={sidefolio} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </header>
      <motion.a
        href="/changelog"
        variants={{
          visible: { y: 0, opacity: 1, display: "flex" },
          hidden: { y: "-30px", opacity: 0, display: "none" },
        }}
        initial="hidden"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        animate={hasArrived && !hiddenChangeLog ? "visible" : "hidden"}
        className="absolute top-[80px] inset-x-0 flex justify-center"
      >
        <span className="rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm px-4 py-1.5">
          {t("newUpdates")}
        </span>
      </motion.a>
      <AnimatePresence>{isNavigating && <PageLoader />}</AnimatePresence>
    </div>
  );
}
