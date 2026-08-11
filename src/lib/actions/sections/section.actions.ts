"use server";

import { prisma } from "@/prisma";

import { User } from "@prisma/client";
import { z } from "zod";

import { ActionError, userAction } from "@/lib/safe.actions";
import { SectionSchema } from "./section.schema";
import { revalidatePath } from "next/cache";
import urlMetadata from "url-metadata";
import { del, put } from "@vercel/blob";
import { toast } from "sonner";
import { fetchYouTubeChannelData } from "@/lib/youtube";
import { fetchTwitchChannelData } from "@/lib/twitch";

const verifyUserPlan = async (user: User) => {
  if (user.plan === "PREMIUM_ONE") {
    return;
  }

  const userProductsCount = await prisma.user.count({
    where: {
      id: user.id,
    },
  });

  if (userProductsCount > 0) {
    throw new ActionError(
      "You need to upgrade to premium to create more products"
    );
  }
};

const DESKTOP_COLS = 8;
const MOBILE_COLS = 4;
// Large placeholder y — react-grid-layout's vertical compaction settles a
// new item just below the last existing one rather than at the top.
const NEW_ITEM_Y = 9999;

export const createSectionAction = userAction(
  SectionSchema,
  async (input, context) => {
    /*  await verifySlugUniqueness(context.user.id);
    await verifyUserPlan(context.user); */
    const desktopSize =
      input.type === "TITLE"
        ? { w: DESKTOP_COLS, h: 1 }
        : { w: 2, h: 2 };
    const mobileSize =
      input.type === "TITLE" ? { w: MOBILE_COLS, h: 1 } : { w: 2, h: 2 };
    let createSection;
    try {
      createSection = await prisma.section.create({
        data: {
          ...input,
          desktop: {
            create: { i: input.i, x: 0, y: NEW_ITEM_Y, ...desktopSize },
          },
          mobile: {
            create: { i: input.i, x: 0, y: NEW_ITEM_Y, ...mobileSize },
          },
        },
      });
    } catch (error) {
      return {
        error: "Failed to create.",
      };
    }
    revalidatePath("/dashboard");
    return createSection;
  }
);
export const getPreview = userAction(
  SectionSchema,
  async (input, context): Promise<{ error: string } | Record<string, any>> => {
  // mailto: links aren't real pages — there's nothing to scrape, and
  // trying just wastes a request and fails. Handle them directly.
  if (/^mailto:/i.test(input.title!)) {
    const email = input.title!.replace(/^mailto:/i, "").split("?")[0];
    const createLink = { title: email, url: input.title!, mailto: true };
    try {
      await prisma.section.create({
        data: {
          ...input,
          link: createLink,
          desktop: { create: { i: input.i, x: 0, y: NEW_ITEM_Y, h: 2, w: 2 } },
          mobile: { create: { i: input.i, x: 0, y: NEW_ITEM_Y, h: 2, w: 2 } },
        },
      });
    } catch (err) {
      return { error: "Failed to create." };
    }
    revalidatePath("/dashboard");
    return createLink;
  }

  // Some sites (LinkedIn profiles, Instagram, etc.) block scraping and make
  // urlMetadata throw — that's not the same thing as an invalid URL, so it
  // shouldn't block adding the link. Fall back to a minimal metadata object
  // built from the URL itself instead of failing the whole action.
  let createLink;
  try {
    createLink = await urlMetadata(input.title!);
  } catch {
    let hostname = input.title!;
    try {
      hostname = new URL(input.title!).hostname.replace(/^www\./, "");
    } catch {}
    createLink = { title: hostname, url: input.title! };
  }

  // urlMetadata follows redirects (e.g. twitch.com -> twitch.tv) and stores
  // the resolved URL on `createLink.url` — detect the channel from that
  // instead of the raw typed input, or a redirecting domain never matches.
  const resolvedUrl = createLink?.url || input.title!;

  try {
    const youtube = await fetchYouTubeChannelData(resolvedUrl);
    const twitch = youtube ? null : await fetchTwitchChannelData(resolvedUrl);
    await prisma.section.create({
      data: {
        ...input,
        link: youtube
          ? { ...createLink, youtube }
          : twitch
          ? { ...createLink, twitch }
          : createLink,
        desktop: { create: { i: input.i, x: 0, y: NEW_ITEM_Y, h: 2, w: 2 } },
        mobile: { create: { i: input.i, x: 0, y: NEW_ITEM_Y, h: 2, w: 2 } },
      },
    });
  } catch (err) {
    return {
      error: "Failed to create.",
    };
  }
  revalidatePath("/dashboard");
  return createLink;
});

const MAX_IMPORTED_LINKS = 15;

const extractLinktreeUsername = (raw: string) => {
  let value = raw.trim();
  value = value.replace(/^https?:\/\//i, "");
  value = value.replace(/^(www\.)?(linktr\.ee|linktree\.com)\//i, "");
  value = value.replace(/^@/, "");
  value = value.split(/[/?#]/)[0];
  return value;
};

const fetchLinktreeEntries = async (rawUrl: string) => {
  const username = extractLinktreeUsername(rawUrl);
  if (!username) {
    return { error: "Please enter a valid Linktree username or url." };
  }

  let res: Response;
  try {
    res = await fetch(`https://linktr.ee/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BoxedInkImporter/1.0)",
      },
    });
  } catch (err) {
    return { error: "Failed to reach Linktree." };
  }

  if (res.status === 404 || res.url.replace(/\/$/, "") === "https://linktr.ee") {
    return { error: `The Linktree profile "${username}" doesn't exist.` };
  }
  if (!res.ok) {
    return { error: "Failed to reach Linktree." };
  }

  const html = await res.text();
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) {
    return { error: "Couldn't read this Linktree profile." };
  }

  let account: any;
  try {
    account = JSON.parse(match[1])?.props?.pageProps?.account;
  } catch (err) {
    return { error: "Couldn't read this Linktree profile." };
  }

  if (!account) {
    return { error: `The Linktree profile "${username}" doesn't exist.` };
  }

  const rawLinks = [
    ...(Array.isArray(account.links) ? account.links : []),
    ...(Array.isArray(account.socialLinks) ? account.socialLinks : []),
  ];

  const seen = new Set<string>();
  const entries: { url: string; title: string }[] = [];
  for (const link of rawLinks) {
    const linkUrl = link?.url;
    if (!linkUrl || typeof linkUrl !== "string") continue;
    if (seen.has(linkUrl)) continue;
    seen.add(linkUrl);
    entries.push({ url: linkUrl, title: link?.title || username });
    if (entries.length >= MAX_IMPORTED_LINKS) break;
  }

  if (entries.length === 0) {
    return { error: `No links found on "${username}"'s Linktree profile.` };
  }

  return { username, entries };
};

export const previewLinktreeAction = userAction(
  z.object({
    url: z.string().min(1),
  }),
  async (input, context) => {
    return fetchLinktreeEntries(input.url);
  }
);

export const importLinktreeAction = userAction(
  z.object({
    sideId: z.string(),
    links: z
      .array(
        z.object({
          url: z.string(),
          title: z.string().optional(),
        })
      )
      .min(1),
  }),
  async (input, context) => {
    const entries = input.links.slice(0, MAX_IMPORTED_LINKS);

    const existingCount = await prisma.section.count({
      where: { sideId: input.sideId },
    });
    const itemSize = 2;
    const itemsPerRow = Math.floor(DESKTOP_COLS / itemSize);
    const mobileItemsPerRow = Math.floor(MOBILE_COLS / itemSize);

    const results = await Promise.allSettled(
      entries.map(async (entry: { url: string; title?: string }, index: number) => {
        const metadata = await urlMetadata(entry.url).catch(() => ({
          title: entry.title || entry.url,
          url: entry.url,
        }));
        const i = `n${Date.now().toString(36)}${index}${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const position = existingCount + index;
        const x = (position % itemsPerRow) * itemSize;
        const y = Math.floor(position / itemsPerRow) * itemSize;
        const mobileX = (position % mobileItemsPerRow) * itemSize;
        const mobileY = Math.floor(position / mobileItemsPerRow) * itemSize;

        return prisma.section.create({
          data: {
            title: entry.url,
            slug: "",
            type: "LINK",
            description: "Add a new description",
            sideId: input.sideId,
            i,
            link: metadata as any,
            desktop: { create: { i, x, y, h: itemSize, w: itemSize } },
            mobile: {
              create: { i, x: mobileX, y: mobileY, h: itemSize, w: itemSize },
            },
          },
        });
      })
    );

    const created = results.filter(
      (r: PromiseSettledResult<unknown>) => r.status === "fulfilled"
    ).length;

    revalidatePath("/dashboard");

    if (created === 0) {
      return { error: "Failed to import links from this profile." };
    }

    return { created, total: entries.length };
  }
);

export const updateOrderDesktopSection = userAction(
  z.object({
    id: z.string(),
    data: z.any(),
  }),
  async (input, context) => {
    let updateSections;
    try {
      const updatePromises = input.data.map((section: any) =>
        prisma.section.update({
          where: { sideId: input.id, desktop: { some: { i: section.i } } },
          data: {
            desktop: {
              update: {
                where: {
                  i: section.i,
                },
                data: {
                  w: section.w,
                  h: section.h,
                  x: section.x,
                  y: section.y,
                },
              },
            },
          },
        })
      );

      updateSections = await prisma.$transaction(updatePromises);
    } catch (error) {
      return { error: error };
    }
    revalidatePath("/dashboard");
    return updateSections;
  }
);
export const updateOrderMobileSection = userAction(
  z.object({
    id: z.string(),
    data: z.any(),
  }),
  async (input, context) => {
    let updateSections;
    try {
      const updatePromises = input.data.map((section: any) =>
        prisma.section.update({
          where: { sideId: input.id, mobile: { some: { i: section.i } } },
          data: {
            mobile: {
              update: {
                where: {
                  i: section.i,
                },
                data: {
                  w: section.w,
                  h: section.h,
                  x: section.x,
                  y: section.y,
                },
              },
            },
          },
        })
      );

      updateSections = await prisma.$transaction(updatePromises);
    } catch (error) {
      return { error: error };
    }
    revalidatePath("/dashboard");
    return updateSections;
  }
);

export const verifySlug = userAction(
  z.object({
    value: z.string(),
  }),
  async (input, context) => {
    const slugExists = await prisma.sidefolio.count({
      where: {
        slug: input.value,
      },
    });

    return slugExists === 0;
  }
);
export const updateSectionAction = userAction(
  z.object({
    id: z.string(),
    data: SectionSchema,
  }),
  async (input, context) => {
    let updateRequest;
    updateRequest = await prisma.section.update({
      where: {
        id: input.id,
      },
      data: input.data,
    });
    revalidatePath("/dashboard");

    return updateRequest;
  }
);

export const uploadImageSection = userAction(
  z.object({
    file: z.any(),
    data: SectionSchema,
  }),

  async (input, context) => {
    const file = input.file.get("file") as File;
    const fileName = file.name;

    const blob = await put(fileName, file, {
      access: "public",
    });

    let response;
    if (blob.url) {
      response = await prisma.section.create({
        data: {
          ...input.data,
          imageUrl: blob.url,
          imageX: 0,
          imageY: 0,
          imageCaption: undefined,
          desktop: { create: { i: input.data.i, x: 0, y: NEW_ITEM_Y, h: 2, w: 2 } },
          mobile: { create: { i: input.data.i, x: 0, y: NEW_ITEM_Y, h: 2, w: 2 } },
        },
      });
    }
    revalidatePath("/dashboard");
    return response;
  }
);
export const removeSectionAction = userAction(
  z.object({ id: z.string(), i: z.string(), image: z.any() }),
  async (input, context) => {
    const section = await prisma.section.findFirst({
      where: { sideId: input.id, i: input.i },
      select: { link: true },
    });

    await prisma.section.delete({
      where: {
        sideId: input.id,
        i: input.i,
      },
    });

    if (input.image) {
      await del(input.image);
    }

    const avatarUrls = [
      (section?.link as any)?.youtube?.avatar,
      (section?.link as any)?.twitch?.avatar,
    ].filter((url) => url?.includes("blob.vercel-storage.com"));

    for (const avatarUrl of avatarUrls) {
      try {
        await del(avatarUrl);
      } catch {
        // avatar blob already gone or unreachable — nothing to clean up
      }
    }
  }
);
