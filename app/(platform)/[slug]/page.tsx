import { currentUser } from "@/auth/current-user";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageParams } from "@/lib/types/next";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import React from "react";
import PublishedSections from "@/features/platform/published/PublishedSections";
import { signInAction } from "@/features/auth/auth.action";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signIn } from "@/auth/auth";
import { SignInButton } from "@/features/auth/SignInButton";
import { LoggedInButton } from "@/features/auth/LoggedInButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShinyButton from "@/components/magicui/shiny-button";
import { FlagLanguageSwitcher } from "@/components/FlagLanguageSwitcher";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
export async function generateMetadata(
  props: PageParams<{ slug: string }>
): Promise<Metadata> {
  const params = await props.params;
  const sidefolio = await prisma.sidefolio.findFirst({
    where: {
      slug: decodeURI(params.slug),
      publish: true,
    },
  });

  return {
    title: sidefolio?.name || sidefolio?.title,
    icons: {
      icon: [sidefolio?.image || "/favicon.ico"],
      apple: ["/apple-touch-icon.png?v=4"],
      shortcut: ["/apple-touch-icon.png"],
    },
  };
}
const page = async (props: PageParams<{ slug: string }>) => {
  const params = await props.params;
  const user = await currentUser();
  const t = await getTranslations("published");
  if (!params.slug) {
    redirect("/dashboard");
  }

  const sidefolio = await prisma.sidefolio.findFirst({
    where: {
      slug: decodeURI(params.slug),
      publish: true,
    },
  });
  const sections = await prisma.section.findMany({
    where: {
      sideId: sidefolio?.id,
    },
  });
  const sectionIds = sections?.map((section) => section.id);
  const desktop = await prisma.desktop.findMany({
    where: {
      sectionId: { in: sectionIds },
    },
    select: {
      x: true,
      y: true,
      i: true,
      w: true,
      h: true,
    },
  });
  const mobile = await prisma.mobile.findMany({
    where: {
      sectionId: { in: sectionIds },
    },
    select: {
      x: true,
      y: true,
      i: true,
      w: true,
      h: true,
    },
  });

  return (
    <>
      {sidefolio ? (
        <div className="flex justify-center h-full">
          <div className="fixed top-4 right-4 z-50">
            <FlagLanguageSwitcher />
          </div>
          <div className="fixed bottom-5 xl:right-5 bg-transparent p-2   z-50">
            {user ? (
              <Link
                href={"/dashboard"}
                className="relative bg-white cursor-pointer backdrop-blur-xl hover:bg-slate-200 transition-all rounded-md p-2 flex items-center gap-2 w-fit"
              >
                <Avatar className="size-6 border ">
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  {user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={`${user.name ?? "-"}'s profile picture`}
                    />
                  ) : null}
                </Avatar>
                <span className="text-sm font-medium">{t("myBoxedInk")}</span>
              </Link>
            ) : (
              <>
                <ShinyButton text={t("createMyBoxedInk")} />
              </>
            )}
          </div>
          <PublishedSections
            desktop={desktop}
            mobile={mobile}
            sections={sections}
            sidefolio={sidefolio}
          />
        </div>
      ) : (
        <div className="h-screen w-full flex justify-center items-center flex-col gap-4">
          <div>
            {t("notFoundPrefix")}{" "}
            <span className="font-bold text-primary">
              {decodeURI(params.slug)}
            </span>{" "}
            {t("notFoundSuffix")}
          </div>
          {user ? (
            <Link
              href={"/dashboard"}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              {t("goToDashboard")}
            </Link>
          ) : (
            <SignInButton />
          )}
        </div>
      )}
    </>
  );
};

export default page;
