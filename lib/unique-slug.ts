import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/** Generates a slug from the product name, suffixed with -2, -3... until it is free. */
export async function findUniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "product";

  const existing = await prisma.product.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const taken = new Set(existing.map((product) => product.slug));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export async function slugTaken(slug: string, excludeId?: string) {
  const found = await prisma.product.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return found !== null;
}
