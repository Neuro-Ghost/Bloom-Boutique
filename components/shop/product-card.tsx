import Link from "next/link";
import Image from "next/image";
import { Product, Category } from "@prisma/client";

interface ProductCardProps {
  product: Product & { category: Category | null };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = JSON.parse(product.images || "[]") as string[];
  const imageUrl = images[0] || "/placeholder-product.svg";
  const secondUrl = images[1];

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={`object-cover transition-opacity duration-500 lg:group-hover:opacity-0 ${
                product.soldOut ? "opacity-60" : ""
              }`}
            />
            {secondUrl && !product.soldOut && (
              <Image
                src={secondUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="hidden object-cover opacity-0 transition-opacity duration-500 lg:block lg:group-hover:opacity-100"
              />
            )}
          </div>
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.onSale && (
              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                Sale
              </span>
            )}
            {product.soldOut && (
              <span className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground">
                Sold Out
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">
            {product.category?.name || "Bloom Boutique"}
          </p>
          <h3 className="mt-1 font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.onSale && product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
            {product.soldOut && (
              <span className="text-xs text-muted-foreground">Sold out</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
