import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { id } = await searchParams;

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center md:px-6">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold md:text-3xl">
            Order Placed!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for shopping with Bloom Boutique. We will contact you soon
            to confirm your order.
          </p>
          {id && (
            <p className="mt-4 text-sm text-muted-foreground">
              Order ID: <span className="font-medium overflow-wrap-anywhere text-foreground">{id}</span>
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className={buttonVariants({ className: "rounded-full" })}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
