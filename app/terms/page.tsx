import type { Metadata } from "next";
import Link from "next/link";
import { Ban, PackageCheck, Truck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/shop/reveal";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Bloom Boutique terms of service. All sales are final, with no cancellations, refunds, or exchanges.",
};

const sections = [
  {
    icon: Ban,
    title: "All Sales Are Final",
    body: "Once an order is placed it cannot be cancelled, changed, returned, refunded, or exchanged, including for size or color. Please check the product details and your size carefully before ordering.",
  },
  {
    icon: PackageCheck,
    title: "Orders & Payment",
    body: "Payment is cash on delivery. Your order is confirmed once we reach out to you, and we may cancel it if an item turns out to be unavailable. You will never be charged for something we cannot supply.",
  },
  {
    icon: Truck,
    title: "Delivery",
    body: "We deliver across the country and hand orders to a courier. Delivery times are estimates, and we are not responsible for delays once a package has left us. Please be available to receive and pay for your order.",
  },
];

export default async function TermsPage() {
  const settings = await getSettings();
  const username = settings.instagramUrl.replace(/\/$/, "").split("/").pop();

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">
            Terms of <span className="italic text-primary">Service</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            By placing an order with {settings.storeName} you agree to the
            terms below.
          </p>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mx-auto mt-14 max-w-2xl rounded-2xl bg-secondary/30 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Ban className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold">
            No cancellations, refunds, or exchanges
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Every purchase is final. If you are unsure about a size or a style,
            message us on Instagram before ordering and we will happily help.
          </p>
        </div>
      </Reveal>

      <Reveal delay={250}>
        <div className="mx-auto mt-6 max-w-2xl space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl bg-secondary/30 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-heading font-semibold">{section.title}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={300}>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-secondary/30 p-6">
          <h2 className="font-heading font-semibold">Questions</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Message us on Instagram{" "}
            <a
              href={`https://ig.me/m/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary overflow-wrap-anywhere transition-colors hover:text-primary/80"
            >
              @{username}
            </a>
            {settings.contactEmail && (
              <>
                {" "}
                or email{" "}
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="font-medium text-primary overflow-wrap-anywhere transition-colors hover:text-primary/80"
                >
                  {settings.contactEmail}
                </a>
              </>
            )}
            . These terms may be updated from time to time. The version on this
            page applies to orders placed after it is posted.
          </p>
        </div>
      </Reveal>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
        Last updated October 2026
        {" · "}
        <Link href="/contact" className="underline transition-colors hover:text-primary">
          Contact us
        </Link>
      </p>
    </div>
  );
}
