import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { findUniqueSlug, slugTaken } from "@/lib/unique-slug";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional().nullable(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  colorImages: z.record(z.string(), z.string()).optional(),
  stock: z.number().int().min(0).default(0),
  variantStock: z.record(z.string(), z.number().int().min(0)).optional().nullable(),
  soldOut: z.boolean().default(false),
  fabric: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  measurements: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  onSale: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");
  const activeOnly = searchParams.get("activeOnly") !== "false";

  const where: any = {};
  if (activeOnly) where.active = true;
  if (category) where.category = { slug: category };
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = productSchema.parse(body);

    const requestedSlug = parsed.slug?.trim();
    if (requestedSlug && (await slugTaken(requestedSlug))) {
      return NextResponse.json(
        { error: "That slug is already in use by another product" },
        { status: 409 }
      );
    }
    const slug = requestedSlug || (await findUniqueSlug(parsed.name));

    const product = await prisma.product.create({
      data: {
        ...parsed,
        slug,
        images: JSON.stringify(parsed.images),
        sizes: JSON.stringify(parsed.sizes),
        colors: JSON.stringify(parsed.colors),
        colorImages: parsed.colorImages
          ? JSON.stringify(parsed.colorImages)
          : undefined,
        variantStock: parsed.variantStock
          ? JSON.stringify(parsed.variantStock)
          : undefined,
        measurements: JSON.stringify(parsed.measurements),
      },
      include: { category: true },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/product/[slug]", "page");

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
