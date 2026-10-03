"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload, resizeImage } from "./image-upload";
import { TagInput } from "./tag-input";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface ProductFormProps {
  product?: Product & { category: Category | null };
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    comparePrice: product?.comparePrice || null as number | null,
    images: JSON.parse(product?.images || "[]") as string[],
    sizes: JSON.parse(product?.sizes || "[]") as string[],
    colors: JSON.parse(product?.colors || "[]") as string[],
    colorImages: JSON.parse(product?.colorImages || "{}") as Record<string, string>,
    stock: product?.stock ?? 0,
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    onSale: product?.onSale ?? false,
    categoryId: product?.categoryId || "",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.name),
      categoryId: form.categoryId || null,
      colorImages: Object.fromEntries(
        Object.entries(form.colorImages).filter(([c]) => form.colors.includes(c))
      ),
    };

    try {
      const url = isEditing
        ? `/api/products/${product.id}`
        : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.error)
          ? data.error.map((issue: { message?: string }) => issue.message).join(". ")
          : data.error || "Failed to save product";
        throw new Error(message);
      }

      toast.success(isEditing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder={generateSlug(form.name)}
            required
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-xl min-h-[120px]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: parseFloat(e.target.value) || 0 })
            }
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comparePrice">Compare Price</Label>
          <Input
            id="comparePrice"
            type="number"
            step="0.01"
            min="0"
            value={form.comparePrice ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                comparePrice: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              })
            }
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: parseInt(e.target.value) || 0 })
            }
            required
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={form.categoryId}
          onValueChange={(v) => setForm({ ...form, categoryId: v || "" })}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Sizes</Label>
          <TagInput
            tags={form.sizes}
            onChange={(sizes) => setForm({ ...form, sizes })}
            placeholder="e.g. S, M, L"
          />
        </div>
        <div className="space-y-2">
          <Label>Colors</Label>
          <TagInput
            tags={form.colors}
            onChange={(colors) => setForm({ ...form, colors })}
            placeholder="e.g. Blush, Beige"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUpload
          images={form.images}
          onChange={(images) => setForm({ ...form, images })}
        />
      </div>

      {form.colors.length > 0 && (
        <div className="space-y-3">
          <div>
            <Label>Color Photos (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Customers who pick a color see its photo here; colors without one fall back to the first gallery image.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {form.colors.map((color) => (
              <ColorImageSlot
                key={color}
                color={color}
                imageUrl={form.colorImages[color]}
                onUpload={(url) =>
                  setForm({
                    ...form,
                    colorImages: { ...form.colorImages, [color]: url },
                  })
                }
                onRemove={() => {
                  const next = { ...form.colorImages };
                  delete next[color];
                  setForm({ ...form, colorImages: next });
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={form.featured}
            onCheckedChange={(checked) =>
              setForm({ ...form, featured: checked === true })
            }
          />
          <span className="text-sm">Featured product</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={form.active}
            onCheckedChange={(checked) =>
              setForm({ ...form, active: checked === true })
            }
          />
          <span className="text-sm">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={form.onSale}
            onCheckedChange={(checked) =>
              setForm({ ...form, onSale: checked === true })
            }
          />
          <span className="text-sm">On Sale</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="rounded-full" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ColorImageSlot({
  color,
  imageUrl,
  onUpload,
  onRemove,
}: {
  color: string;
  imageUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const processed = await resizeImage(file);
      const formData = new FormData();
      formData.append("file", processed, "image.jpg");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      onUpload(data.url);
      toast.success(`Photo set for ${color}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`${color} variant`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {color.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{color}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 rounded-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-1.5 h-3 w-3" />
          {uploading ? "Uploading..." : imageUrl ? "Replace" : "Upload"}
        </Button>
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}
