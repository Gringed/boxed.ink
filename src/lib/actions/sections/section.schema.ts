import { z } from "zod";

export const SectionSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  imageUrl: z.string().optional(),
  imageX: z.number().optional(),
  imageY: z.number().optional(),
  imageScale: z.number().optional(),
  imageMobileX: z.number().optional(),
  imageMobileY: z.number().optional(),
  imageMobileScale: z.number().optional(),
  imageCaption: z.string().optional(),
  description: z.string().max(1000, "1000 characters max").optional(),
  sideId: z.string(),
  type: z.enum(["TITLE", "TEXT", "LINK", "IMAGE", "ME"]).optional(),
  color: z.string().optional(),
  background: z.string().optional(),
  link: z.any().optional(),
  mobile: z.any().optional(),
  desktop: z.any().optional(),
  i: z.string().optional(),
});
