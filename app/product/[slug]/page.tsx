import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/shop/product-detail";

export const revalidate = 30;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  const description =
    product.description?.slice(0, 160) ||
    `Discover ${product.name} at Bloom Boutique — modest, feminine fashion delivered across Lebanon.`;
  const images = JSON.parse(product.images || "[]") as string[];
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: images.length ? [{ url: images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId || undefined,
      id: { not: product.id },
    },
    include: { category: true },
    take: 4,
  });

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
