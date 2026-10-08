import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your store products.</p>
        </div>
        <Link
          href="/admin/products/new"
          className={buttonVariants({})}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const images = JSON.parse(product.images || "[]") as string[];
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={images[0] || "/placeholder-product.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category?.name || "-"}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {product.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      <Badge variant={product.active ? "default" : "outline"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                      {product.soldOut && (
                        <Badge variant="destructive">Sold Out</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Link
                        href={`/admin/products/${product.id}`}
                        aria-label={`Edit ${product.name}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                          className: "size-10",
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <ProductDeleteButton productId={product.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
