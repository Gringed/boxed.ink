import { prisma } from "@/prisma";

// Lowercase, strip accents/diacritics, keep only letters and digits, no
// spaces or separators — "Alexandre Guillomé" -> "alexandreguillome".
export const slugify = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Appends 2, 3, 4... to the base slug until an unclaimed one is found.
// `excludeId` lets an existing sidefolio re-check its own current slug
// without colliding with itself.
export const generateUniqueSlug = async (
  name: string,
  excludeId?: string
): Promise<string> => {
  const base = slugify(name) || "user";
  let candidate = base;
  let suffix = 2;

  while (
    await prisma.sidefolio.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
};
