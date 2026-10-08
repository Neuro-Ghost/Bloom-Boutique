import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/shop/reveal";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Bloom Boutique. Message us on Instagram for orders, sizing, and delivery questions.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const username = settings.instagramUrl.replace(/\/$/, "").split("/").pop();

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">
            Get in <span className="italic text-primary">Touch</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Questions about sizing, orders, or delivery? Send us a message on
            Instagram. It&apos;s the fastest way to reach us.
          </p>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mx-auto mt-14 max-w-md rounded-2xl bg-secondary/30 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
              aria-hidden="true"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold overflow-wrap-anywhere">
            @{username}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            DM us anytime. We usually reply within a day.
          </p>
          <a
            href={`https://ig.me/m/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ className: "mt-6 rounded-full" })}
          >
            Message on Instagram
          </a>
        </div>
      </Reveal>

      <Reveal delay={250}>
        <div className="mx-auto mt-6 grid max-w-md gap-6 sm:grid-cols-2">
          {settings.contactEmail && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/30 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-1 font-medium">Email</p>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex min-h-11 items-center justify-center py-2 text-sm text-muted-foreground overflow-wrap-anywhere transition-colors hover:text-primary"
              >
                {settings.contactEmail}
              </a>
            </div>
          )}
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/30 p-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 font-medium">Based in {settings.address}</p>
            <p className="text-sm text-muted-foreground">
              Delivery across the country
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
