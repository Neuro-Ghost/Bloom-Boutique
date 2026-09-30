import { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/shop/cart-provider";
import { Navbar } from "@/components/shop/navbar";
import { Footer } from "@/components/shop/footer";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.storeName} | ${settings.storeTagline}`,
    description: `Discover elegant, modest fashion at ${settings.storeName}. Curated dresses, tops, bottoms, and sets for the modern woman.`,
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
