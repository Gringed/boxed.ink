import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

