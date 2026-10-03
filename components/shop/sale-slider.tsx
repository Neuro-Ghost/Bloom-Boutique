"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, Category } from "@prisma/client";

interface SaleSliderProps {
  products: (Product & { category: Category | null })[];
}

export function SaleSlider({ products }: SaleSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1 || paused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [products.length, next, paused]);

  if (products.length === 0) {
    return (
      <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-2xl bg-white p-8 shadow-xl lg:max-w-lg">
        <p className="text-muted-foreground">No active sales right now.</p>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-md lg:max-w-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {products.map((product) => {
            const images = JSON.parse(product.images || "[]") as string[];
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="w-full flex-shrink-0"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                  <Image
                    src={images[0] || "/placeholder-product.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.onSale && (
                    <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Sale
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground">
                    {product.category?.name || "Bloom Boutique"}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-medium">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.comparePrice.toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {products.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur transition-transform hover:scale-110 active:scale-95"
            aria-label="Previous sale"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur transition-transform hover:scale-110 active:scale-95"
            aria-label="Next sale"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === current
                    ? "bg-primary w-4"
                    : "bg-primary/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
