import { z } from "zod";

export const SidefolioSchema = z.object({
  slug: z.string().optional(),
  background: z.string().optional(),
  color: z.string().optional(),
  compactType: z.enum(["horizontal", "vertical", "null"]).optional().nullable(),
  sidebar: z.enum(["left", "right"]).optional(),
  name: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});
