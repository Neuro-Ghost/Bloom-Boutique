"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload, resizeImage } from "./image-upload";
import { TagInput } from "./tag-input";
import { slugify } from "@/lib/slug";
import { variantKey } from "@/lib/stock";
import { resolveSwatch, parseDualHexes } from "@/lib/colors";
import { toast } from "sonner";
import { Plus, Upload, X, Droplets } from "lucide-react";

interface ProductFormProps {
  product?: Product & { category: Category | null };
  categories: Category[];
}

type MeasurementRow = { label: string; value: string };

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [pickingFor, setPickingFor] = useState<string | null>(null);
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
    colorHexes: JSON.parse(product?.colorHexes || "{}") as Record<string, string>,
    showColorDots: product?.showColorDots ?? true,
    stock: product?.stock ?? 0,
    variantStock: JSON.parse(product?.variantStock || "{}") as Record<string, number>,
    soldOut: product?.soldOut ?? false,
    fabric: product?.fabric || "",
    careInstructions: product?.careInstructions || "",
    measurements: JSON.parse(product?.measurements || "[]") as MeasurementRow[],
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    onSale: product?.onSale ?? false,
    categoryId: product?.categoryId || "",
  });

  const hasVariants = form.sizes.length > 0 || form.colors.length > 0;
  const sizeOptions = form.sizes.length > 0 ? form.sizes : [""];
  const colorOptions = form.colors.length > 0 ? form.colors : [""];
  const variantRows = colorOptions.flatMap((color) =>
    sizeOptions.map((size) => ({
      size,
      color,
      key: variantKey(size, color),
      label: [size, color].filter(Boolean).join(" / "),
    }))
  );

  const setVariantAvailable = (key: string, available: boolean) =>
    setForm((prev) => ({
      ...prev,
      variantStock: { ...prev.variantStock, [key]: available ? 1 : 0 },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && !form.slug.trim()) {
      toast.error("Slug cannot be empty");
      return;
    }

    setLoading(true);

    const liveVariantKeys = new Set(variantRows.map((row) => row.key));

    const payload = {
      ...form,
      slug: form.slug.trim() || undefined,
      categoryId: form.categoryId || null,
      colorImages: Object.fromEntries(
        Object.entries(form.colorImages).filter(([c]) => form.colors.includes(c))
      ),
      colorHexes: Object.fromEntries(
        Object.entries(form.colorHexes).filter(([c]) => form.colors.includes(c))
      ),
      variantStock: hasVariants
        ? Object.fromEntries(
            Object.entries(form.variantStock).filter(([key]) =>
              liveVariantKeys.has(key)
            )
          )
        : null,
      measurements: form.measurements.filter(
        (row) => row.label.trim() !== "" || row.value.trim() !== ""
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
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({
                ...prev,
                name,
                slug: slugTouched ? prev.slug : slugify(name),
              }));
            }}
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((prev) => ({ ...prev, slug: e.target.value }));
            }}
            placeholder={slugify(form.name) || "generated-from-name"}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "This is the product URL. Changing it breaks any link already shared."
              : "Filled in from the name automatically."}
          </p>
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

      {form.colors.length > 0 && form.images.length > 0 && (
        <div className="space-y-2">
          {pickingFor && (
            <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-primary/5 px-3 py-2">
              <Droplets className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Click any image to pick a color for <span className="text-primary">{pickingFor}</span>
              </span>
              <button
                type="button"
                onClick={() => setPickingFor(null)}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {form.images.map((src, idx) => (
              <PickerCanvas
                key={idx}
                src={src}
                pickingFor={pickingFor}
                onPick={(hex) => {
                  if (!pickingFor) return;
                  setForm((prev) => ({
                    ...prev,
                    colorHexes: { ...prev.colorHexes, [pickingFor]: hex },
                  }));
                  toast.success(`Picked ${hex} for ${pickingFor}`);
                  setPickingFor(null);
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click the eyedropper next to a color below, then click any image to sample its color.
          </p>
        </div>
      )}

      {form.colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Color swatches</Label>
              <p className="text-xs text-muted-foreground">
                Pick the dot color shoppers see on each product card. The default is
                a best guess from the color name.
              </p>
            </div>
            <label className="flex items-center gap-2 shrink-0">
              <Checkbox
                checked={form.showColorDots}
                onCheckedChange={(checked) =>
                  setForm({ ...form, showColorDots: checked === true })
                }
              />
              <span className="text-sm">Show dots</span>
            </label>
          </div>
          {form.showColorDots && (
            <div className="grid gap-2 sm:grid-cols-2">
              {form.colors.map((color) => {
                const isDual = /\s*[&]\s*|\s+and\s+/i.test(color);
                if (isDual) {
                  const [hex1, hex2] = parseDualHexes(color, form.colorHexes);
                  return (
                    <div
                      key={color}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                        pickingFor === color ? "border-primary ring-1 ring-primary/30" : ""
                      }`}
                    >
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={hex1}
                          onChange={(e) => {
                            const [, h2] = parseDualHexes(color, form.colorHexes);
                            setForm({
                              ...form,
                              colorHexes: {
                                ...form.colorHexes,
                                [color]: `${e.target.value},${h2}`,
                              },
                            });
                          }}
                          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-black/10 p-0.5 pointer-events-none"
                          aria-label={`First half color for ${color}`}
                          tabIndex={-1}
                        />
                        <input
                          type="color"
                          value={hex2}
                          onChange={(e) => {
                            const [h1] = parseDualHexes(color, form.colorHexes);
                            setForm({
                              ...form,
                              colorHexes: {
                                ...form.colorHexes,
                                [color]: `${h1},${e.target.value}`,
                              },
                            });
                          }}
                          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-black/10 p-0.5 pointer-events-none"
                          aria-label={`Second half color for ${color}`}
                          tabIndex={-1}
                        />
                      </div>
                      <span className="text-sm flex-1 truncate">{color}</span>
                      <button
                        type="button"
                        onClick={() => setPickingFor(pickingFor === color ? null : color)}
                        className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          pickingFor === color
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                        }`}
                        aria-label={`Pick color from image for ${color}`}
                      >
                        <Droplets className="h-3.5 w-3.5" />
                        <span>Pick</span>
                      </button>
                    </div>
                  );
                }
                return (
                  <div
                    key={color}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                      pickingFor === color ? "border-primary ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <input
                      type="color"
                      value={resolveSwatch(color, form.colorHexes)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          colorHexes: {
                            ...form.colorHexes,
                            [color]: e.target.value,
                          },
                        })
                      }
                      className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-black/10 p-0.5 pointer-events-none"
                      aria-label={`Swatch color for ${color}`}
                      tabIndex={-1}
                    />
                    <span className="text-sm flex-1 truncate">{color}</span>
                    <button
                      type="button"
                      onClick={() => setPickingFor(pickingFor === color ? null : color)}
                      className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        pickingFor === color
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                      }`}
                      aria-label={`Pick color from image for ${color}`}
                    >
                      <Droplets className="h-3.5 w-3.5" />
                      <span>Pick</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {hasVariants && (
        <div className="space-y-3">
          <div>
            <Label>What is still available</Label>
            <p className="text-xs text-muted-foreground">
              Turn off any combination you have run out of. Shoppers see it crossed
              out and cannot pick it.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {variantRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
              >
                <span className="truncate text-sm">{row.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {form.variantStock[row.key] === 0 ? "Sold out" : "Available"}
                  </span>
                  <Switch
                    checked={form.variantStock[row.key] !== 0}
                    onCheckedChange={(checked) =>
                      setVariantAvailable(row.key, checked)
                    }
                    aria-label={`${row.label} available`}
                    // 44px touch minimum: the switch is 18.4px tall, so the hit area needs a wider inset than the default.
                    className="after:-inset-y-[13px]"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="space-y-4 rounded-2xl border p-4">
        <div>
          <Label>Product details</Label>
          <p className="text-xs text-muted-foreground">
            Shown on the product page. Anything you leave blank is simply not shown.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fabric">Fabric</Label>
          <Input
            id="fabric"
            value={form.fabric}
            onChange={(e) => setForm({ ...form, fabric: e.target.value })}
            placeholder="e.g. 95% polyester, 5% elastane"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careInstructions">Care instructions</Label>
          <Textarea
            id="careInstructions"
            value={form.careInstructions}
            onChange={(e) =>
              setForm({ ...form, careInstructions: e.target.value })
            }
            placeholder="e.g. Hand wash cold, do not bleach, iron on low"
            className="rounded-xl min-h-[90px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Measurements</Label>
          <MeasurementRows
            rows={form.measurements}
            onChange={(measurements) => setForm({ ...form, measurements })}
          />
        </div>
      </div>

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
        <label className="flex items-center gap-2">
          <Checkbox
            checked={form.soldOut}
            onCheckedChange={(checked) =>
              setForm({ ...form, soldOut: checked === true })
            }
          />
          <span className="text-sm">Sold out</span>
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

function MeasurementRows({
  rows,
  onChange,
}: {
  rows: MeasurementRow[];
  onChange: (rows: MeasurementRow[]) => void;
}) {
  const update = (index: number, patch: Partial<MeasurementRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={row.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="e.g. Length"
            className="rounded-xl"
          />
          <Input
            value={row.value}
            onChange={(e) => update(index, { value: e.target.value })}
            placeholder="e.g. 120 cm"
            className="rounded-xl"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${row.label || "measurement"}`}
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
            className="shrink-0 rounded-full text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 rounded-full"
        onClick={() => onChange([...rows, { label: "", value: "" }])}
      >
        <Plus className="mr-1.5 h-3 w-3" />
        Add measurement
      </Button>
    </div>
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
      <div className="relative h-14 w-14 shrink-0 rounded-lg bg-muted">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`${color} variant`}
              fill
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${color} photo`}
              className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg text-xs text-muted-foreground">
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

function PickerCanvas({
  src,
  pickingFor,
  onPick,
}: {
  src: string;
  pickingFor: string | null;
  onPick: (hex: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = src;
  }, [src]);

  const samplePixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setHoverColor(hex);
      setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } catch {
      // CORS error - ignore
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pickingFor) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      onPick(hex);
    } catch {
      toast.error("Cannot sample color - image may be from external source");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={pickingFor ? samplePixel : undefined}
        onMouseLeave={() => { setHoverColor(null); setHoverPos(null); }}
        className={`block w-full ${pickingFor ? "cursor-crosshair ring-2 ring-primary ring-offset-2" : "cursor-default"}`}
        style={{ aspectRatio: "3/4" }}
      />
      {hoverColor && hoverPos && pickingFor && (
        <div
          className="absolute pointer-events-none flex items-center gap-2 rounded-lg bg-black/80 px-2 py-1 text-xs text-white"
          style={{ left: hoverPos.x + 10, top: hoverPos.y - 30 }}
        >
          <div className="h-4 w-4 rounded border border-white/30" style={{ backgroundColor: hoverColor }} />
          <span className="font-mono">{hoverColor}</span>
        </div>
      )}
    </div>
  );
}
