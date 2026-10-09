"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { Product, Category } from "@prisma/client";

interface ShopContentProps {
  products: (Product & { category: Category | null })[];
  categories: Category[];
}

const pillClass = (active: boolean) =>
  `flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "bg-secondary/60 text-foreground hover:bg-secondary"
  }`;

export function ShopContent({ products, categories }: ShopContentProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category && category !== "all") {
      result = result.filter((p) => p.category?.slug === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [products, category, search, sort]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.category) {
        map.set(p.category.slug, (map.get(p.category.slug) ?? 0) + 1);
      }
    }
    return map;
  }, [products]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full pl-10"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div
            aria-label="Filter by category"
            className="no-scrollbar -mx-4 flex flex-1 items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0"
          >
            <button
              type="button"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
              className={pillClass(category === "all")}
            >
              All
              <span className="text-xs opacity-60">{products.length}</span>
            </button>
            {categories.map((c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c.slug)}
                  className={pillClass(active)}
                >
                  {c.name}
                  <span className="text-xs opacity-60">
                    {categoryCounts.get(c.slug) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v || "newest")}>
            <SelectTrigger className="w-[150px] shrink-0 rounded-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            No products found. Try a different search or category.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 7) * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
