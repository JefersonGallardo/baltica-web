// Reglas del estudio creativo. Medidas y precios REFERENCIALES: confirmar con el taller.

export type Line = "varon" | "dama" | "nino";
export type Side = "front" | "back";
export type Technique = "transfer" | "dtf" | "serigrafia" | "vinilo" | "pedreria";

export const LINES: Record<
  Line,
  {
    label: string;
    models: string[]; // slugs de products.ts
    sizes: { size: string; chest: number; length: number }[]; // cm, prenda en plano
    sheet: { name: string; w: number; h: number }; // hoja estándar de transfer
  }
> = {
  varon: {
    label: "Varón",
    models: ["polo-basico", "polo-clasico", "polo-melange"],
    sizes: [
      { size: "S", chest: 48, length: 68 },
      { size: "M", chest: 51, length: 71 },
      { size: "L", chest: 54, length: 74 },
      { size: "XL", chest: 57, length: 76 },
      { size: "XXL", chest: 60, length: 78 },
    ],
    sheet: { name: "A3", w: 29.7, h: 42 },
  },
  dama: {
    label: "Dama",
    models: ["polo-dama-entallado", "polo-pima", "polo-basico"],
    sizes: [
      { size: "XS", chest: 41, length: 60 },
      { size: "S", chest: 43, length: 62 },
      { size: "M", chest: 46, length: 64 },
      { size: "L", chest: 49, length: 66 },
      { size: "XL", chest: 52, length: 68 },
    ],
    sheet: { name: "A3", w: 29.7, h: 42 },
  },
  nino: {
    label: "Niño y niña",
    models: ["polo-nino", "polo-nina"],
    sizes: [
      { size: "2", chest: 30, length: 40 },
      { size: "4", chest: 32, length: 44 },
      { size: "6", chest: 34, length: 47 },
      { size: "8", chest: 36, length: 50 },
      { size: "10", chest: 38, length: 53 },
      { size: "12", chest: 40, length: 56 },
      { size: "14", chest: 42, length: 59 },
      { size: "16", chest: 44, length: 62 },
    ],
    sheet: { name: "A4", w: 21, h: 29.7 },
  },
};

// Área máxima de impresión: la hoja estándar, sin pasarse del ancho real del polo.
export function printArea(line: Line, size: string) {
  const l = LINES[line];
  const s = l.sizes.find((x) => x.size === size) ?? l.sizes[0];
  return {
    w: Math.min(l.sheet.w, s.chest - 8),
    h: Math.min(l.sheet.h, s.length - 22),
    chest: s.chest,
    length: s.length,
  };
}

type Tier = { w: number; h: number; price: number; label: string };
const TIERS = (a: number, b: number, c: number): Tier[] => [
  { w: 10, h: 10, price: a, label: "tamaño logo, hasta 10 × 10 cm" },
  { w: 21, h: 29.7, price: b, label: "hasta A4" },
  { w: 29.7, h: 42, price: c, label: "hasta A3" },
];

export const TECHNIQUES: Record<
  Technique,
  { label: string; short: string; note: string; tiers?: Tier[] }
> = {
  transfer: {
    label: "Transfer",
    short: "A todo color, hoja estándar",
    note: "Nuestro estampado estrella por unidad. Se imprime en hoja A3 para adultos y A4 para niños: el precio es por hoja, no por tamaño.",
  },
  dtf: {
    label: "DTF",
    short: "A todo color, precio por tamaño",
    note: "Colores vivos y gran detalle. Ideal desde una docena. El precio depende del tamaño del diseño.",
    tiers: TIERS(5, 10, 15),
  },
  serigrafia: {
    label: "Serigrafía",
    short: "De 1 a 4 colores sólidos",
    note: "La más resistente y económica en cantidad. Se cobra por color; conviene desde una docena.",
  },
  vinilo: {
    label: "Vinilo de corte",
    short: "Un solo color, bordes nítidos",
    note: "Perfecto para nombres, números y logos simples de un color.",
    tiers: TIERS(6, 12, 18),
  },
  pedreria: {
    label: "Pedrería",
    short: "Piedritas con brillo",
    note: "Diseños con piedras termoadhesivas. Se ve mejor con formas simples y trazos gruesos.",
    tiers: TIERS(10, 20, 30),
  },
};

// Precios fijos del transfer (por hoja) y de serigrafía (por color, por lado)
export const TRANSFER_SHEET = { adult: 12, kids: 8 };
export const SERIGRAFIA_PER_COLOR = 3;

export function sidePrice(
  tech: Technique,
  line: Line,
  footprint: { w: number; h: number } | null,
  inks: number,
) {
  if (!footprint) return { price: 0, label: "" };
  if (tech === "transfer") {
    const kids = line === "nino";
    return {
      price: kids ? TRANSFER_SHEET.kids : TRANSFER_SHEET.adult,
      label: `hoja ${LINES[line].sheet.name}`,
    };
  }
  if (tech === "serigrafia") {
    return { price: SERIGRAFIA_PER_COLOR * inks, label: `${inks} ${inks === 1 ? "color" : "colores"}` };
  }
  const tiers = TECHNIQUES[tech].tiers!;
  const t =
    tiers.find((x) => footprint.w <= x.w + 0.05 && footprint.h <= x.h + 0.05) ??
    tiers[tiers.length - 1];
  return { price: t.price, label: t.label };
}

export const VINYL_COLORS = [
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#111111" },
  { name: "Rojo", hex: "#D7262F" },
  { name: "Dorado", hex: "#C9A23A" },
  { name: "Plateado", hex: "#B9BDC2" },
  { name: "Azul", hex: "#2350A8" },
  { name: "Amarillo", hex: "#F2C230" },
  { name: "Rosado", hex: "#E58BB0" },
];

export const STONES = [
  { name: "Colores del diseño", hex: "" },
  { name: "Cristal", hex: "#E9EEF3" },
  { name: "Dorado", hex: "#D4AF37" },
  { name: "Plateado", hex: "#C0C4C8" },
];
