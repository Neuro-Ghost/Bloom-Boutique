"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "./cart-provider";

export function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-background"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center gap-6 px-4 md:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent
              side="left"
              className="w-72 [&>button]:transition-transform [&>button]:duration-300 [&>button]:hover:rotate-90 [&>button]:hover:scale-110 [&>button]:hover:text-primary"
            >
              <div className="flex h-full flex-col pt-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                  onClick={() => setMobileOpen(false)}
                >
                  <Image
                    src="/logo.png"
                    alt="Bloom Boutique"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                  <span className="font-heading text-lg font-semibold tracking-tight">
                    Bloom Boutique
                  </span>
                </Link>
                <nav className="mt-10 flex flex-col">
                  {navLinks.map((link, i) => {
                    const active = link.href === pathname;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        style={{ animationDelay: `${150 + i * 80}ms` }}
                        className={`drawer-item group flex items-baseline gap-3 border-b border-border/60 py-3.5 transition-colors ${
                          active
                            ? "text-primary"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        <span className="font-sans text-[10px] font-semibold tracking-widest text-primary/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-heading text-2xl">
                          {link.label}
                        </span>
                        <span className="ml-auto h-px w-0 self-center bg-primary transition-all duration-300 group-hover:w-8" />
                      </Link>
                    );
                  })}
                </nav>
                <p
                  className="drawer-item mt-auto pb-6 font-heading text-sm italic text-muted-foreground"
                  style={{ animationDelay: "500ms" }}
                >
                  Modest fashion, made to bloom.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Bloom Boutique"
            width={40}
            height={40}
            className="rounded-full transition-transform duration-300 hover:scale-110"
          />
          <span className="hidden font-heading text-xl font-semibold tracking-tight sm:inline-block">
            Bloom Boutique
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  active
                    ? "text-primary after:scale-x-100"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/shop"
            aria-label="Search products"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "transition-transform duration-300 hover:scale-110",
            })}
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className:
                "relative transition-transform duration-300 hover:scale-110",
            })}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="badge-pop absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
