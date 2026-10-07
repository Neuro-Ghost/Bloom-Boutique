import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteSettings } from "@/lib/settings";

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer id="contact" className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
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
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link
                href="/shop"
                className="hover:text-primary transition-colors"
              >
                Shop All
              </Link>
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href="/admin"
                className="hover:text-primary transition-colors"
              >
                Admin Login
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
                  className="flex items-center gap-2 hover:text-primary transition-colors"
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
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {settings.contactEmail}
                </a>
              )}
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {settings.whatsappNumber}
                </a>
              )}
              {settings.address && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {settings.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings.storeName}. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
