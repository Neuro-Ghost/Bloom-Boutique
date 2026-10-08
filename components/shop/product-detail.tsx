"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCart } from "./cart-provider";
import { ProductCard } from "./product-card";
import { MobileActionBar } from "./mobile-action-bar";
import {
  colorAvailable,
  firstAvailableVariant,
  variantAvailable,
} from "@/lib/stock";
import { Product, Category } from "@prisma/client";

interface ProductDetailProps {
  product: Product & { category: Category | null };
  relatedProducts: (Product & { category: Category | null })[];
}

type MeasurementRow = { label: string; value: string };

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addItem } = useCart();
  const images = JSON.parse(product.images || "[]") as string[];
  const sizes = JSON.parse(product.sizes || "[]") as string[];
  const colors = JSON.parse(product.colors || "[]") as string[];
  const colorImages = JSON.parse(product.colorImages || "{}") as Record<string, string>;
  const measurements = JSON.parse(product.measurements || "[]") as MeasurementRow[];

  const initialVariant = firstAvailableVariant(product, sizes, colors);

  const [selectedImage, setSelectedImage] = useState(images[0] || "/placeholder-product.svg");
  const [selectedSize, setSelectedSize] = useState(initialVariant.size);
  const [selectedColor, setSelectedColor] = useState(initialVariant.color);
  const [quantity, setQuantity] = useState(1);

  const soldOut = product.soldOut;
  const selectionSoldOut = !variantAvailable(
    product,
    selectedSize || undefined,
    selectedColor || undefined
  );
  const cannotBuy = soldOut || selectionSoldOut;
  const selectionLabel = [selectedColor, selectedSize].filter(Boolean).join(" / ");

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (colorImages[color]) setSelectedImage(colorImages[color]);

    if (!variantAvailable(product, selectedSize || undefined, color)) {
      const nextSize = sizes.find((size) => variantAvailable(product, size, color));
      if (nextSize) setSelectedSize(nextSize);
    }
  };

  const handleAddToCart = () => {
    if (soldOut) {
      toast.error("This product is sold out");
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (selectionSoldOut) {
      toast.error(`${selectionLabel} is sold out`);
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: selectedImage,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });

    toast.success("Added to cart", {
      description: `${product.name} (${quantity})`,
    });
  };

  return (
    <div className="container mx-auto px-4 pt-6 pb-32 md:px-6 md:pt-12 lg:py-12">
      <Link
        href="/shop"
        className={buttonVariants({
          variant: "ghost",
          className: "mb-4 -ml-3 text-muted-foreground",
        })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Link>

      {/* Mobile header so name and price land above the fold */}
      <div className="mb-5 lg:hidden">
        <p className="text-sm text-muted-foreground">
          {product.category?.name || "Bloom Boutique"}
        </p>
        <h1 className="mt-1 font-heading text-2xl leading-tight font-bold">
          {product.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-xl font-semibold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.onSale && product.comparePrice && product.comparePrice > product.price && (
            <span className="text-base text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
          {product.onSale && (
            <Badge className="bg-primary text-primary-foreground">Sale</Badge>
          )}
          {soldOut && <Badge variant="outline">Sold Out</Badge>}
          {!soldOut && product.stock <= 3 && product.stock > 0 && (
            <Badge variant="secondary">Only {product.stock} left</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative mx-auto aspect-[4/5] max-h-[56vh] w-full overflow-hidden rounded-2xl bg-muted lg:aspect-[3/4] lg:max-h-none">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === image
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6 lg:block lg:space-y-6">
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              {product.category?.name || "Bloom Boutique"}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-2xl font-semibold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.onSale && product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
              {product.onSale && (
                <Badge className="bg-primary text-primary-foreground">Sale</Badge>
              )}
              {soldOut && <Badge variant="outline">Sold Out</Badge>}
              {!soldOut && product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary">Only {product.stock} left</Badge>
              )}
            </div>
          </div>

          <p className="order-3 leading-relaxed text-muted-foreground">
            {product.description || "No description available."}
          </p>

          <Separator className="order-4" />

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <p className="mb-3 font-medium">
                Color {selectedColor && `- ${selectedColor}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const available = colorAvailable(product, color, sizes);
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={!available}
                      aria-pressed={selectedColor === color}
                      onClick={() => handleColorChange(color)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm transition-all ${
                        !available
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50 line-through"
                          : selectedColor === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white hover:border-primary/50"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <p className="mb-3 font-medium">
                Size {selectedSize && `- ${selectedSize}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = variantAvailable(
                    product,
                    size,
                    selectedColor || undefined
                  );
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!available}
                      aria-pressed={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm transition-all ${
                        !available
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50 line-through"
                          : selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(soldOut || selectionSoldOut) && (
            <p className="text-sm text-muted-foreground">
              {soldOut
                ? "This product is currently sold out."
                : `${selectionLabel} is sold out.`}
            </p>
          )}

          {/* Quantity & Add to Cart */}
          <div className="order-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-full border border-border bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-l-full text-muted-foreground hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-11 w-12 items-center justify-center font-medium">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-r-full text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="hidden flex-1 rounded-full lg:flex"
              disabled={cannotBuy}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {cannotBuy ? "Sold Out" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>

      {/* Fabric, care and measurements */}
      {(product.fabric || product.careInstructions || measurements.length > 0) && (
        <div className="mt-12 rounded-2xl border border-border bg-white p-5 md:p-6">
          <h2 className="font-heading text-lg font-bold">Product Details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            {product.fabric && (
              <div>
                <dt className="font-medium text-foreground">Fabric</dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">
                  {product.fabric}
                </dd>
              </div>
            )}
            {product.careInstructions && (
              <div>
                <dt className="font-medium text-foreground">Care Instructions</dt>
                <dd className="mt-1 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {product.careInstructions}
                </dd>
              </div>
            )}
            {measurements.length > 0 && (
              <div>
                <dt className="font-medium text-foreground">Measurements</dt>
                <dd className="mt-2">
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {measurements.map((row, index) => (
                      <li
                        key={`${row.label}-${index}`}
                        className="flex items-baseline justify-between gap-4 px-3 py-2"
                      >
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium text-foreground">
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 font-heading text-2xl font-bold">
            You May Also Like
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <MobileActionBar
        summaryLabel="Price"
        summaryValue={`$${product.price.toFixed(2)}`}
        actionLabel={cannotBuy ? "Sold Out" : "Add to Cart"}
        disabled={cannotBuy}
        onAction={handleAddToCart}
      />
    </div>
  );
}
