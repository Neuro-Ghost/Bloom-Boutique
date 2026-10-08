import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { SiteSettings } from "@/lib/settings";

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 pt-12 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-6 lg:pb-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex min-h-11 items-center gap-2">
              <Image
                src="/logo.png"
                alt={settings.storeName}
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-heading text-lg font-semibold">
                {settings.storeName}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.storeTagline}. Curated styles for the modern, elegant
              woman.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Quick Links</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="/"
                className="flex min-h-11 items-center py-2 hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="flex min-h-11 items-center py-2 hover:text-primary transition-colors"
              >
                Shop All
              </Link>
              <Link
                href="/about"
                className="flex min-h-11 items-center py-2 hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="flex min-h-11 items-center py-2 hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold">Connect</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 min-w-0 items-center gap-2 py-2 overflow-wrap-anywhere hover:text-primary transition-colors"
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
                    className="h-4 w-4 shrink-0"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  @{settings.instagramUrl.replace(/\/$/, "").split("/").pop()}
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex min-h-11 min-w-0 items-center gap-2 py-2 overflow-wrap-anywhere hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {settings.contactEmail}
                </a>
              )}
              {settings.address && (
                <span className="flex min-w-0 items-center gap-2 overflow-wrap-anywhere">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {settings.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings.storeName}. All rights
          reserved.
          <span className="mx-2">&middot;</span>
          <Link
            href="/terms"
            className="underline transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
