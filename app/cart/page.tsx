"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-provider";
import { MobileActionBar } from "@/components/shop/mobile-action-bar";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  const deliveryFee: number = 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center md:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Discover beautiful modest pieces made for you.
        </p>
        <Link
          href="/shop"
          className={buttonVariants({ className: "mt-6 rounded-full" })}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-32 md:px-6 md:pt-12 lg:py-12">
      <h1 className="font-heading text-3xl font-bold">Shopping Cart</h1>
      <p className="mt-2 text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-semibold">
                        {item.slug ? (
                          <Link
                            href={`/product/${item.slug}`}
                            className="transition-colors hover:text-primary"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span>{item.name}</span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " / "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                      <div className="flex items-center rounded-full border border-border bg-white">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.size,
                              item.color
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-l-full text-muted-foreground hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex h-11 w-9 items-center justify-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.size,
                              item.color
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-r-full text-muted-foreground hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${item.name}`}
                          onClick={() =>
                            removeItem(item.productId, item.size, item.color)
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full rounded-full",
                })}
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/shop"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full rounded-full",
                })}
              >
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileActionBar
        summaryLabel="Total"
        summaryValue={`$${total.toFixed(2)}`}
        actionLabel="Checkout"
        href="/checkout"
      />
    </div>
  );
}
