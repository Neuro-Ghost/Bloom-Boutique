"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ProductDeleteButton({ productId }: { productId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      alert(data.error || "Failed to delete product");
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10"
      aria-label="Delete product"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
