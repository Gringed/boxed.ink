"use client";

import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { Section } from "@/features/landing/Section";
import { SignInIllustration } from "@/features/auth/SignInIllustration";
import { CopyrightIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const SignInPageClient = () => {
  const t = useTranslations("signIn");
  const tFooter = useTranslations("footer");
  return (
    <div className="flex h-full flex-col">
      <LandingHeader />
      <Section className="mx-auto flex-wrap mt-auto py-20  max-w-7xl gap-16 sm:gap-y-24 grid lg:grid-cols-2 lg:items-center">
        <div className="w-full h-full min-h-[300px] flex items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 p-10">
          <SignInIllustration className="w-full max-w-md" />
        </div>
        <div className=" w-full flex flex-col gap-4 items-start">
          <div className="text-3xl font-bold tracking-tight text-gray-900  sm:text-4xl lg:text-5xl">
            <span className="text-primary">{t("titlePrefix")}</span>{" "}
            {t("or")}{" "}
            <span className="text-primary">{t("titleSuffix")}</span>{" "}
            {t("titleEnd")}
          </div>
          <Button
            variant={"outline"}
            onClick={() => {
              signIn("google", { redirect: true, callbackUrl: "/dashboard" });
            }}
            className="flex w-full gap-3 h-14 items-center justify-center text-base"
          >
            <img
              loading="lazy"
              height="24"
              width="24"
              id="provider-logo"
              src="https://authjs.dev/img/providers/google.svg"
            />
            {t("google")}
          </Button>
        </div>
      </Section>
      <footer className="mt-auto w-full bottom-0">
        <div className="w-full relative bg-primary text-white  border-t-4 border-black">
          <Section className="py-4">
            <div className="flex flex-col justify-center w-full">
              <div className="flex items-center lg:justify-between flex-col lg:flex-row gap-5 my-5 lg:my-1">
                <div className="flex items-center gap-3 font-medium">
                  <CopyrightIcon />
                  {tFooter("copyright", { year: new Date().getFullYear() })}
                </div>
                <div className="flex gap-5 font-medium flex-col lg:flex-row flex-wrap items-center">
                  <Link href={"/tos"}>{tFooter("terms")}</Link>
                  <Link href={"/policy"}>{tFooter("privacy")}</Link>
                  <Link
                    href={
                      "mailto:alexandre.guillome@yucatech.fr?subject=Help me with boxed.ink"
                    }
                  >
                    {tFooter("contact")}
                  </Link>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </footer>
    </div>
  );
};
