import type { Product } from "@prisma/client";

type VariantStocked = Pick<Product, "variantStock">;

export function variantKey(size?: string, color?: string) {
  return `${size ?? ""}|${color ?? ""}`;
}

/** False for products that have never been given a variant grid, which keeps them behaving exactly as before. */
export function tracksVariants(product: VariantStocked) {
  return product.variantStock !== null;
}

export function parseVariantStock(product: VariantStocked): Record<string, number> {
  if (!product.variantStock) return {};
  try {
    const parsed = JSON.parse(product.variantStock);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

export function variantAvailable(
  product: VariantStocked,
  size?: string,
  color?: string
) {
  if (!tracksVariants(product)) return true;
  return parseVariantStock(product)[variantKey(size, color)] !== 0;
}

/** A color stays pickable as long as some size still has it. */
export function colorAvailable(
  product: VariantStocked,
  color: string,
  sizes: string[]
) {
  if (!tracksVariants(product)) return true;
  const candidates: (string | undefined)[] = sizes.length > 0 ? sizes : [undefined];
  return candidates.some((size) => variantAvailable(product, size, color));
}

export function firstAvailableVariant(
  product: VariantStocked,
  sizes: string[],
  colors: string[]
) {
  const colorOptions: (string | undefined)[] = colors.length > 0 ? colors : [undefined];
  const sizeOptions: (string | undefined)[] = sizes.length > 0 ? sizes : [undefined];

  for (const color of colorOptions) {
    for (const size of sizeOptions) {
      if (variantAvailable(product, size, color)) {
        return { size: size ?? "", color: color ?? "" };
      }
    }
  }

  return { size: sizes[0] ?? "", color: colors[0] ?? "" };
}
