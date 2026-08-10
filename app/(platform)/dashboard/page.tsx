import { currentUser } from "@/auth/current-user";

import { redirect } from "next/navigation";

import React from "react";

import { PageParams } from "@/lib/types/next";

import { prisma } from "@/prisma";
import Sections from "@/features/platform/dashboard/components/Sections";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const user = await currentUser();
  const sidefolio = await prisma.sidefolio.findFirst({
    where: {
      authorId: user?.id,
    },
  });

  return {
    title: sidefolio?.name || sidefolio?.title,
    icons: {
      icon: [sidefolio?.image || "/favicon.ico"],
      apple: [sidefolio?.image || "/apple-touch-icon.png?v=4"],
      shortcut: [sidefolio?.image || "/apple-touch-icon.png"],
    },
  };
}
const Home = async (props: PageParams<{}>) => {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const date = new Date();
  const expire = new Date(user?.expiresAt!!);

  const sidefolio = await prisma.sidefolio.findFirst({
    where: {
      authorId: user.id,
    },
  });
  const sections = await prisma.section.findMany({
    where: {
      sideId: sidefolio?.id,
    },
  });
  if (user?.expiresAt) {
    if (expire < date) {
      await prisma.sidefolio.update({
        where: {
          id: sidefolio?.id,
        },
        data: {
          publish: false,
        },
      });
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          plan: "FREEMIUM",
          expiresAt: null,
        },
      });
    }
  }
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
    <div className="flex justify-center h-full">
      <Sections
        sidefolio={sidefolio}
        desktop={desktop}
        mobile={mobile}
        sections={sections}
        user={user}
      />
    </div>
  );
};

export default Home;
