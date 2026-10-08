import Link from "next/link";
import type { Metadata } from "next";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/shop/reveal";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "About",
  description:
    "Bloom Boutique is a Lebanon-based modest fashion destination with elegant, feminine pieces for the modern woman who values grace and modesty.",
};

const values = [
  { icon: Heart, title: "Curated Styles", text: "Modest & feminine" },
  { icon: Sparkles, title: "Quality Fabrics", text: "Comfort guaranteed" },
  { icon: MapPin, title: "Lebanon Based", text: "Local delivery" },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">
            About <span className="italic text-primary">{settings.storeName}</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {settings.storeName} is a Lebanon-based modest fashion destination
            created for women who want to feel feminine, confident, and true to
            themselves. Every piece is chosen with care: soft fabrics, graceful
            silhouettes, and details that make you feel beautiful inside and
            out.
          </p>
          {settings.instagramUrl && (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @{settings.instagramUrl.replace(/\/$/, "").split("/").pop()}
            </a>
          )}
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/30 p-6 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <value.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-1 font-medium">{value.title}</p>
              <p className="text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={250}>
        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className={buttonVariants({ size: "lg", className: "rounded-full" })}
          >
            Shop the Collection
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
