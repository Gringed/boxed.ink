"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useRouter } from "next/navigation";
import { SignInButton } from "../auth/SignInButton";
import { PageLoader } from "@/components/PageLoader";

export function LandingHeader() {
  const [hiddenChangeLog, setHiddenChangelog] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setHiddenChangelog(true);
    } else {
      setHiddenChangelog(false);
    }
  });
  const router = useRouter();
  return (
    <div className="relative h-[150px]">
      <header className="fixed z-20 inset-x-0 flex h-20 shadow bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-screen-2xl flex w-full items-center justify-between sm:px-16 px-6">
          <div
            onClick={() => startNavigation(() => router.push("/"))}
            className="flex cursor-pointer origin-left items-center gap-2 text-xl"
          >
            <Image
              src="/icon.svg"
              width={64}
              height={64}
              alt="bentoh.me logo"
              priority
            />{" "}
            <h1 className="md:block hidden font-MontserratAlt font-extrabold text-2xl md:text-3xl">
              bentoh.me
            </h1>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium  ">
            <Sheet>
              <SheetTrigger>
                <Menu className="text-noir sm:hidden" />
              </SheetTrigger>
              <SheetContent className="sm:w-72 overflow-y-scroll">
                <>
                  <ul className="flex flex-col gap-8">
                    <li className="border-b">
                      <SignInButton />
                    </li>
                  </ul>
                </>
              </SheetContent>
            </Sheet>
            <div className="hidden items-center gap-5 sm:flex">
              <SignInButton />
            </div>
          </nav>
        </div>
      </header>
      <motion.a
        href="/changelog"
        variants={{
          visible: { y: 0, display: "flex" },
          hidden: { y: "-100px", display: "none" },
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        animate={hiddenChangeLog ? "hidden" : "visible"}
        className="bg-primary shadow-lg font-bold border-black/40 border-t-2 top-20 absolute py-2  w-full    items-center justify-center sm:px-16 px-6 text-white flex"
      >
        New updates! See what is new
      </motion.a>
      <AnimatePresence>{isNavigating && <PageLoader />}</AnimatePresence>
    </div>
  );
}
