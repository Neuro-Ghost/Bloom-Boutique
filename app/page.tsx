import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Sparkles, Truck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/shop/product-card";
import { SaleSlider } from "@/components/shop/sale-slider";

async function getHomeData() {
  const featuredProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const saleProducts = await prisma.product.findMany({
    where: { active: true, onSale: true },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    take: 4,
    orderBy: { name: "asc" },
  });

  const settings = await getSettings();

  return { featuredProducts, saleProducts, categories, settings };
}

export default async function HomePage() {
  const { featuredProducts, saleProducts, categories, settings } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/50">
        <div className="container mx-auto px-4 py-20 md:px-6 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                New Collection
              </span>
              <h1 className="font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                Dress Modestly,
                <br />
                <span className="italic text-primary">Bloom Beautifully</span>
              </h1>
              <p className="mx-auto max-w-md text-lg text-muted-foreground lg:mx-0">
                {settings.storeTagline}. Elegant, feminine pieces designed for
                the modern woman who values grace and modesty.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/shop"
                  className={buttonVariants({
                    size: "lg",
                    className: "rounded-full",
                  })}
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#about"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "rounded-full border-primary/30",
                  })}
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-full">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
              <div className="relative">
                <SaleSlider products={saleProducts} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-background">
        <div className="container mx-auto px-4 py-10 md:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/30 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Curated Styles</p>
                <p className="text-sm text-muted-foreground">
                  Modest & feminine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/30 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Local Delivery</p>
                <p className="text-sm text-muted-foreground">Across Lebanon</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/30 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Quality Fabrics</p>
                <p className="text-sm text-muted-foreground">
                  Comfort guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold">Shop by Category</h2>
          <p className="mt-2 font-heading italic text-muted-foreground">
            Find your perfect modest look
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-secondary/30 p-6 text-center transition-all hover:bg-secondary/50"
            >
              <div className="mb-4 flex h-20 items-center justify-center">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
              <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-secondary/20 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold">
                  Featured Pieces
                </h2>
                <p className="mt-2 font-heading italic text-muted-foreground">
                  Handpicked favorites this season
                </p>
              </div>
              <Link
                href="/shop"
                className={buttonVariants({
                  variant: "ghost",
                  className: "hidden sm:flex",
                })}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="about" className="container mx-auto px-4 py-16 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold">About {settings.storeName}</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {settings.storeName} is a Lebanon-based modest fashion destination
            created for women who want to feel feminine, confident, and true to
            themselves. Every piece is chosen with care — soft fabrics, graceful
            silhouettes, and details that make you feel beautiful inside and out.
          </p>
          {settings.instagramUrl && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Follow our journey on Instagram{" "}
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                @{settings.instagramUrl.replace(/\/$/, "").split("/").pop()}
              </a>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
