import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/admin/logout-button";
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  ShoppingBag,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderKanban },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex min-h-screen">
          <div className="flex h-16 items-center gap-2 px-6">
            <Image
              src="/logo.png"
              alt="Bloom Boutique"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-heading font-semibold">Admin</span>
          </div>
          <Separator />
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={buttonVariants({
                    variant: "ghost",
                    className: "w-full justify-start gap-3",
                  })}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          <div className="p-4">
            <LogoutButton />
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Bloom Boutique"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="font-heading font-semibold">Admin</span>
            </Link>
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  })}
                >
                  <item.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
