"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { Product, Category } from "@prisma/client";

interface ShopContentProps {
  products: (Product & { category: Category | null })[];
  categories: Category[];
}

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price ↑" },
  { value: "price-high", label: "Price ↓" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

export function ShopContent({ products, categories }: ShopContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");

  const stockedCategories = useMemo(
    () =>
      categories.filter((c) => products.some((p) => p.category?.id === c.id)),
    [categories, products]
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.category) {
        map.set(p.category.slug, (map.get(p.category.slug) ?? 0) + 1);
      }
    }
    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
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

  const selectCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const barRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const measure = () => {
      const active = bar.querySelector<HTMLButtonElement>(
        '[data-active="true"]'
      );
      if (active) {
        setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [category, stockedCategories]);

  const activeCategory = categories.find((c) => c.slug === category);

  const pillClass = (active: boolean) =>
    `relative z-10 flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${
      active ? "text-primary-foreground" : "text-foreground hover:text-primary"
    }`;

  return (
    <>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full pl-10"
          />
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={sort === s.value}
              onClick={() => setSort(s.value)}
              className={`min-h-11 rounded-full px-3 text-sm transition-colors ${
                sort === s.value
                  ? "font-medium text-foreground underline decoration-primary decoration-2 underline-offset-8"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={barRef}
        aria-label="Filter by category"
        className="no-scrollbar relative -mx-4 mb-8 flex items-center gap-1 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        {indicator && (
          <span
            aria-hidden="true"
            className="absolute top-0 h-full rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
        <button
          type="button"
          data-active={category === "all"}
          aria-pressed={category === "all"}
          onClick={() => selectCategory("all")}
          className={pillClass(category === "all")}
        >
          All
          <span className="text-xs opacity-60">{products.length}</span>
        </button>
        {stockedCategories.map((c) => {
          const active = category === c.slug;
          return (
            <button
              key={c.id}
              type="button"
              data-active={active}
              aria-pressed={active}
              onClick={() => selectCategory(c.slug)}
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

      {activeCategory && (
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            {activeCategory.name}
          </h2>
          {activeCategory.description && (
            <p className="mt-1 font-heading italic text-muted-foreground">
              {activeCategory.description}
            </p>
          )}
        </div>
      )}

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
              selectCategory("all");
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
