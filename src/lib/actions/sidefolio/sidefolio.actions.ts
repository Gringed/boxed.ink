"use server";
import { ActionError, userAction } from "@/lib/safe.actions";
import { SidefolioSchema } from "./sidefolio.schema";
import { z } from "zod";
import { prisma } from "@/prisma";
import { stripe } from "@/stripe";
import { UserSchema } from "../users/user.schema";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { geocodeLocation, searchLocations } from "@/lib/geocode";
import { slugify } from "@/lib/slug";

export const claimSidefolioSlugAction = userAction(
  z.object({
    id: z.string(),
    slug: z.string().min(1),
  }),
  async (input, context) => {
    const slug = slugify(input.slug);
    if (!slug) {
      throw new ActionError("Please enter a valid url");
    }

    const existing = await prisma.sidefolio.findFirst({
      where: { slug, id: { not: input.id } },
      select: { id: true },
    });
    if (existing) {
      throw new ActionError("This url is already taken");
    }

    const updated = await prisma.sidefolio.update({
      where: { id: input.id },
      data: { slug, slugClaimed: true },
    });
    revalidatePath("/dashboard");
    return updated;
  }
);

export const updateSidefolioAction = userAction(
  z.object({
    id: z.string(),
    data: SidefolioSchema,
    image: z.string().optional(),
  }),
  async (input, context) => {
    if (input.data.customDomain && context.user.plan !== "PRO") {
      throw new ActionError("A Pro subscription is required for a custom domain");
    }
    if (input.image) {
      await del(input.image);
    }
    const updateSidefolio = await prisma.sidefolio.update({
      where: {
        id: input.id,
      },
      data: input.data,
    });
    revalidatePath("/dashboard");

    return updateSidefolio;
  }
);
export const geocodeSidefolioLocationAction = userAction(
  z.object({
    id: z.string(),
    location: z.string(),
  }),
  async (input, context) => {
    const coords = await geocodeLocation(input.location);
    await prisma.sidefolio.update({
      where: {
        id: input.id,
      },
      data: {
        locationLat: coords?.lat ?? null,
        locationLng: coords?.lng ?? null,
      },
    });
    revalidatePath("/dashboard");
    return coords;
  }
);
export const searchLocationsAction = userAction(
  z.object({
    query: z.string(),
  }),
  async (input, context) => {
    return await searchLocations(input.query);
  }
);

export const setSidefolioLocationAction = userAction(
  z.object({
    id: z.string(),
    location: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  async (input, context) => {
    await prisma.sidefolio.update({
      where: {
        id: input.id,
      },
      data: {
        location: input.location,
        locationLat: input.lat,
        locationLng: input.lng,
      },
    });
    revalidatePath("/dashboard");
    return { lat: input.lat, lng: input.lng };
  }
);

export const uploadImageSidefolio = userAction(
  z.object({
    id: z.string(),
    file: z.any(),
  }),

  async (input, context) => {
    const file = input.file.get("file") as File;
    const fileName = file.name;

    const blob = await put(fileName, file, {
      access: "public",
    });

    let response;
    if (blob.url) {
      response = await prisma.sidefolio.update({
        where: {
          id: input.id,
        },
        data: {
          background: blob.url,
        },
      });
    }
    revalidatePath("/dashboard");
    return response;
  }
);
export const publishSidefolioAction = userAction(
  z.object({
    id: z.string(),
    data: UserSchema,
  }),
  async (input, context) => {
    const pusblishedSidefolio = await prisma.sidefolio.update({
      where: {
        id: input.id,
      },
      data: {
        publish: true,
      },
    });
    revalidatePath("/dashboard");
    return pusblishedSidefolio;
  }
);

export const subscribeAction = userAction(
  z.object({}),
  async (_input, context) => {
    const user = await prisma.user.findUnique({
      where: {
        id: context.user.id,
      },
      select: {
        stripeCustomerId: true,
        email: true,
      },
    });
    const stripeCustomerId = user?.stripeCustomerId ?? undefined;
    const session = await stripe.checkout.sessions.create({
      success_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + "/upgrade",
      mode: "subscription",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : user?.email,
      line_items: [
        {
          price: process.env.PRICE_PRO,
          quantity: 1,
        },
      ],
    });
    if (!session.url) {
      throw new Error("Error");
    }
    return { url: session.url };
  }
);

export const manageBillingAction = userAction(z.object({}), async (_input, context) => {
  const user = await prisma.user.findUnique({
    where: {
      id: context.user.id,
    },
    select: {
      stripeCustomerId: true,
    },
  });
  if (!user?.stripeCustomerId) {
    throw new Error("No billing account found");
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
  });
  return { url: session.url };
});
