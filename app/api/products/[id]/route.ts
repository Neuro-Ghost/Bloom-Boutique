import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugTaken } from "@/lib/unique-slug";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional().nullable(),
  images: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  colorImages: z.record(z.string(), z.string()).optional().nullable(),
  stock: z.number().int().min(0).optional(),
  variantStock: z.record(z.string(), z.number().int().min(0)).optional().nullable(),
  soldOut: z.boolean().optional(),
  fabric: z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  measurements: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  onSale: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = productSchema.parse(body);

    const {
      images,
      sizes,
      colors,
      colorImages,
      variantStock,
      measurements,
      ...rest
    } = parsed;

    const data: any = { ...rest };

    if (parsed.slug !== undefined) {
      const nextSlug = parsed.slug.trim();
      if (!nextSlug) {
        return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
      }
      if (nextSlug !== existing.slug && (await slugTaken(nextSlug, id))) {
        return NextResponse.json(
          { error: "That slug is already in use by another product" },
          { status: 409 }
        );
      }
      data.slug = nextSlug;
    }

    if (images !== undefined) data.images = JSON.stringify(images);
    if (sizes !== undefined) data.sizes = JSON.stringify(sizes);
    if (colors !== undefined) data.colors = JSON.stringify(colors);
    if (colorImages !== undefined) {
      data.colorImages = colorImages ? JSON.stringify(colorImages) : null;
    }
    if (variantStock !== undefined) {
      data.variantStock = variantStock ? JSON.stringify(variantStock) : null;
    }
    if (measurements !== undefined) data.measurements = JSON.stringify(measurements);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/product/[slug]", "page");

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    await prisma.product.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/product/[slug]", "page");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
