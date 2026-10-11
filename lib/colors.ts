const SWATCH_FALLBACKS: Record<string, string> = {
  Brown: "#6b4a2f",
  "Navy Blue": "#1e3a5f",
  "Light Blue": "#add8e6",
  "Baby Blue": "#89cff0",
  White: "#ffffff",
  Black: "#1a1a1a",
  Cream: "#fffdd0",
  Beige: "#d4c5a9",
  Burgundy: "#800020",
  Indigo: "#3f0071",
  Emerald: "#50c878",
  "Red & White": "#cc3333",
  Khaki: "#c3b091",
  "Dusty Rose": "#dcae9c",
  "Latte Brown": "#9c6b30",
  Pink: "#ffc0cb",
  Red: "#e63946",
  Green: "#2d6a4f",
  Grey: "#9e9e9e",
  Olive: "#6b8e23",
};

const NEUTRAL_FALLBACK = "#9ca3af";

export function parseColorHexes(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function resolveSwatch(
  color: string,
  colorHexes: Record<string, string> | null | undefined,
): string {
  if (colorHexes?.[color]) return colorHexes[color];
  if (SWATCH_FALLBACKS[color]) return SWATCH_FALLBACKS[color];
  return NEUTRAL_FALLBACK;
}

export function resolveSwatchStyle(
  color: string,
  colorHexes: Record<string, string> | null | undefined,
): { background?: string; backgroundColor?: string } {
  const parts = color.split(/\s*[&]\s*|\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 2) {
    const stored = colorHexes?.[color];
    let c1: string, c2: string;
    if (stored && stored.includes(",")) {
      const [h1, h2] = stored.split(",").map((h) => h.trim());
      c1 = h1 || resolveSwatch(parts[0], colorHexes);
      c2 = h2 || resolveSwatch(parts[1], colorHexes);
    } else {
      c1 = resolveSwatch(parts[0], colorHexes);
      c2 = resolveSwatch(parts[1], colorHexes);
    }
    return { background: `conic-gradient(from 0deg, ${c1} 0deg 180deg, ${c2} 180deg 360deg)` };
  }
  return { backgroundColor: resolveSwatch(color, colorHexes) };
}

export function parseDualHexes(
  color: string,
  colorHexes: Record<string, string> | null | undefined,
): [string, string] {
  const parts = color.split(/\s*[&]\s*|\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
  const stored = colorHexes?.[color];
  if (stored && stored.includes(",")) {
    const [h1, h2] = stored.split(",").map((h) => h.trim());
    return [h1 || resolveSwatch(parts[0] ?? color, colorHexes), h2 || resolveSwatch(parts[1] ?? color, colorHexes)];
  }
  return [resolveSwatch(parts[0] ?? color, colorHexes), resolveSwatch(parts[1] ?? color, colorHexes)];
}
