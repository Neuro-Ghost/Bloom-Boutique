"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Wallet, Tag, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-provider";
import { MobileActionBar } from "@/components/shop/mobile-action-bar";
import { DELIVERY_ZONES, DeliveryZone } from "@/lib/delivery";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    city: "",
    notes: "",
  });

  const deliveryFee = deliveryZone ? DELIVERY_ZONES[deliveryZone].fee : 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discountAmount + deliveryFee;

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

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await response.json();
      if (!data.valid) {
        throw new Error(data.error || "Invalid coupon code");
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discountPercent: data.coupon.discountPercent,
        discountAmount: data.coupon.discountAmount,
      });
      toast.success(`${data.coupon.discountPercent}% discount applied!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to apply coupon"
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryZone) {
      toast.error("Please select a delivery zone");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryZone,
          couponCode: appliedCoupon?.code,
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
    <div className="container mx-auto px-4 pt-8 pb-36 md:px-6 md:pt-12 lg:py-12">
      <Link
        href="/cart"
        className={buttonVariants({
          variant: "ghost",
          className: "mb-4 -ml-3 text-muted-foreground",
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
        id="checkout-form"
        onSubmit={handleSubmit}
        aria-busy={isSubmitting}
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
                    name="name"
                    type="text"
                    autoComplete="name"
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
                    name="tel"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
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
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
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
                <Label>Delivery Zone *</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(DELIVERY_ZONES) as DeliveryZone[]).map((zone) => {
                    const selected = deliveryZone === zone;
                    return (
                      <button
                        key={zone}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDeliveryZone(zone)}
                        className={`flex min-h-11 items-center justify-between rounded-xl border px-4 py-2 text-sm transition-all ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white hover:border-primary/50"
                        }`}
                      >
                        <span>{DELIVERY_ZONES[zone].label}</span>
                        <span className="font-medium">
                          ${DELIVERY_ZONES[zone].fee.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="address-level2"
                  autoComplete="address-level2"
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
                  name="street-address"
                  autoComplete="street-address"
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="min-h-[100px] rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  autoComplete="off"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Special delivery instructions..."
                  className="min-h-24 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="lg:sticky lg:top-24">
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
                        sizes="56px"
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

              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-muted-foreground">
                      (-{appliedCoupon.discountPercent}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                    aria-label="Remove coupon"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                      className="rounded-xl pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="rounded-full"
                  >
                    {isApplyingCoupon ? "..." : "Apply"}
                  </Button>
                </div>
              )}

              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">
                  {deliveryZone ? `$${deliveryFee.toFixed(2)}` : "Select zone"}
                </span>
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
                disabled={isSubmitting || !deliveryZone}
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

      <MobileActionBar
        summaryLabel="Total"
        summaryValue={`$${total.toFixed(2)}`}
        actionLabel="Place Order"
        pendingLabel="Placing Order..."
        pending={isSubmitting}
        disabled={isSubmitting || !deliveryZone}
        actionType="submit"
        form="checkout-form"
      />
    </div>
  );
}
