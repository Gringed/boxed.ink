"use server";

import { prisma } from "@/prisma";

import { z } from "zod";
import { UserSchema } from "./user.schema";
import { ActionError, userAction } from "@/lib/safe.actions";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";

const verifySlugUniqueness = async (userId?: string) => {
  const slugExists = await prisma.user.count({
    where: {
      id: userId
        ? {
            not: userId,
          }
        : undefined,
    },
  });

  if (slugExists) {
    throw new ActionError("Slug already exists");
  }
};

export const uplodadProfileImageAction = userAction(
  z.object({
    sidefolio: z.any(),
    file: z.any(),
    del: z.boolean().optional(),
  }),

  async (input, context) => {
    if (input.del) {
      await del(input.sidefolio?.image ?? "");
      const res = await prisma.sidefolio.update({
        where: {
          id: input.sidefolio.id,
        },
        data: {
          image: "",
        },
      });
      await prisma.user.update({
        where: { id: context.user.id },
        data: { image: "" },
      });

      revalidatePath("/dashboard");
      return res;
    } else if (input.sidefolio?.image !== "") {
      await del(input.sidefolio?.image ?? "");
      const file = input.file.get("file") as File;
      const fileName = file.name;

      const blob = await put(fileName, file, {
        access: "public",
      });

      let response;
      if (blob.url) {
        response = await prisma.sidefolio.update({
          where: {
            id: input.sidefolio.id,
          },
          data: {
            image: blob.url,
          },
        });
        await prisma.user.update({
          where: { id: context.user.id },
          data: { image: blob.url },
        });
      }
      revalidatePath("/dashboard");
      return response;
    } else {
      const file = input.file.get("file") as File;
      const fileName = file.name;

      const blob = await put(fileName, file, {
        access: "public",
      });

      let response;
      if (blob.url) {
        response = await prisma.sidefolio.update({
          where: {
            id: input.sidefolio.id,
          },
          data: {
            image: blob.url,
          },
        });
        await prisma.user.update({
          where: { id: context.user.id },
          data: { image: blob.url },
        });
      }
      revalidatePath("/dashboard");
      return response;
    }
  }
);
export const updateUserAction = userAction(
  z.object({
    id: z.string(),
    data: UserSchema,
  }),
  async (input, context) => {
    const updatedUser = await prisma.user.update({
      where: {
        id: input.id,
      },
      data: input.data,
    });
    revalidatePath("/dashboard");
    return updatedUser;
  }
);
