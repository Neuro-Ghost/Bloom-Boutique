"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Truck, Wallet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-provider";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    city: "",
    notes: "",
  });

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center md:px-6">
        <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some items before checking out.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.error)
          ? data.error.map((issue: { message?: string }) => issue.message).join(". ")
          : data.error || data.details || "Failed to place order";
        throw new Error(message);
      }

      clearCart();
      router.push(`/order-success?id=${data.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Link
        href="/cart"
        className={buttonVariants({
          variant: "ghost",
          className: "mb-6 -ml-4 text-muted-foreground",
        })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="font-heading text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Cash on delivery. Pay when your order arrives.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold">
                Contact Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    required
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    required
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm({ ...form, customerPhone: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email (optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm({ ...form, customerEmail: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold">Delivery Address</h2>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="rounded-xl min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Special delivery instructions..."
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold">Your Order</h2>
              <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-muted-foreground">
                        Qty: {item.quantity}
                        {item.size && ` / ${item.size}`}
                        {item.color && ` / ${item.color}`}
                      </p>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Pay when your order arrives
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                All sales are final. No cancellations, refunds, or exchanges.
                By ordering you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
