"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Heart, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCart } from "./cart-provider";
import { ProductCard } from "./product-card";
import { Product, Category } from "@prisma/client";

interface ProductDetailProps {
  product: Product & { category: Category | null };
  relatedProducts: (Product & { category: Category | null })[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { addItem } = useCart();
  const images = JSON.parse(product.images || "[]") as string[];
  const sizes = JSON.parse(product.sizes || "[]") as string[];
  const colors = JSON.parse(product.colors || "[]") as string[];
  const colorImages = JSON.parse(product.colorImages || "{}") as Record<string, string>;

  const [selectedImage, setSelectedImage] = useState(images[0] || "/placeholder-product.svg");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addItem({
      productId: product.id,
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
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Link
        href="/shop"
        className={buttonVariants({
          variant: "ghost",
          className: "mb-6 -ml-4 text-muted-foreground",
        })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
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
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {product.category?.name || "Bloom Boutique"}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
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
              {product.stock <= 3 && product.stock > 0 && (
                <Badge variant="secondary">Only {product.stock} left</Badge>
              )}
            </div>
          </div>

          <p className="leading-relaxed text-muted-foreground">
            {product.description || "No description available."}
          </p>

          <Separator />

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <p className="mb-3 font-medium">
                Color {selectedColor && `- ${selectedColor}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (colorImages[color]) setSelectedImage(colorImages[color]);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white hover:border-primary/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
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
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white hover:border-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-full border border-border bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-l-full text-muted-foreground hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-11 w-12 items-center justify-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-r-full text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1 rounded-full"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="hidden h-12 w-12 rounded-full sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
