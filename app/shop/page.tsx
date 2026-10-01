import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ShopContent } from "@/components/shop/shop-content";

export const revalidate = 30;

export const metadata = {
  title: "Shop | Bloom Boutique",
};

async function getShopData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { products, categories };
}

export default async function ShopPage() {
  const { products, categories } = await getShopData();

  return (
    <section className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          Shop All
        </h1>
        <p className="mt-2 font-heading italic text-muted-foreground">
          Discover our curated collection of modest fashion
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ShopContent products={products} categories={categories} />
      </Suspense>
    </section>
  );
}
