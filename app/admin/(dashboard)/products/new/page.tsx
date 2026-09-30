import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Add Product</h1>
        <p className="text-muted-foreground">Create a new product.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
