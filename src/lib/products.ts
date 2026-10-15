// Catálogo de la demo.
// Los PRECIOS SON REFERENCIALES: confirmar con la tienda antes de publicar.
// Cada modelo agrupa sus colores (en la web actual cada color es un producto aparte).

export type Category = "hombre" | "dama" | "nino" | "nina";

export type Color = { name: string; hex: string; melange?: boolean };

export type Shape = "tee" | "fitted" | "hoodie";

export type Product = {
  slug: string;
  name: string;
  short: string;
  description: string;
  fabric: string;
  shape: Shape;
  categories: Category[];
  colors: Color[];
  sizes: string[];
  price: number; // por unidad
  wholesale: number; // por unidad desde WHOLESALE_FROM
  bestSeller?: boolean;
  isNew?: boolean;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  hombre: "Hombre",
  dama: "Dama",
  nino: "Niño",
  nina: "Niña",
};

export const C = {
  blanco: { name: "Blanco", hex: "#F7F7F5" },
  negro: { name: "Negro", hex: "#1C1D21" },
  rojo: { name: "Rojo", hex: "#C62F2F" },
  marino: { name: "Azul marino", hex: "#1F2C4D" },
  rey: { name: "Azul rey", hex: "#2350A8" },
  olivo: { name: "Verde olivo", hex: "#5B6236" },
  botella: { name: "Verde botella", hex: "#1D4A36" },
  arena: { name: "Arena", hex: "#D8C6A5" },
  melange: { name: "Melange", hex: "#A9ACB0", melange: true },
  vino: { name: "Vino", hex: "#6B1E2E" },
  palo: { name: "Palo rosa", hex: "#E3B5B0" },
  celeste: { name: "Celeste", hex: "#A9CBE6" },
  mostaza: { name: "Mostaza", hex: "#D19A2A" },
  lila: { name: "Lila", hex: "#B9A6D6" },
} satisfies Record<string, Color>;

const ADULT = ["S", "M", "L", "XL", "XXL"];
const KIDS = ["2", "4", "6", "8", "10", "12", "14", "16"];

export const PRODUCTS: Product[] = [
  {
    slug: "polo-basico",
    name: "Polo básico cuello redondo",
    short: "El de todos los días. 100% algodón.",
    description:
      "Polo de algodón peinado, cuello redondo con rib y costuras reforzadas en hombros. Es el modelo más pedido para uso diario, uniformes y estampado.",
    fabric: "Jersey 30/1, 100% algodón peinado",
    shape: "tee",
    categories: ["hombre", "dama"],
    colors: [C.blanco, C.negro, C.rojo, C.marino, C.olivo, C.botella, C.melange, C.arena],
    sizes: ADULT,
    price: 20,
    wholesale: 16,
    bestSeller: true,
  },
  {
    slug: "polo-clasico",
    name: "Polo clásico",
    short: "Corte regular, tela más gruesa.",
    description:
      "Un polo de corte recto con tela de mayor gramaje, que mantiene la forma lavada tras lavada. Ideal para quien busca un básico más duradero.",
    fabric: "Jersey 24/1, 100% algodón",
    shape: "tee",
    categories: ["hombre"],
    colors: [C.rojo, C.negro, C.blanco, C.rey, C.vino, C.mostaza],
    sizes: ADULT,
    price: 22,
    wholesale: 18,
    bestSeller: true,
  },
  {
    slug: "polo-pima",
    name: "Polo pima cuello redondo",
    short: "Algodón pima peruano, suave y fresco.",
    description:
      "Confeccionado en algodón pima, la fibra peruana más fina. Cae mejor, es más suave al tacto y conserva el color por más tiempo.",
    fabric: "Jersey 40/1, 100% algodón pima",
    shape: "fitted",
    categories: ["dama"],
    colors: [C.arena, C.blanco, C.negro, C.palo, C.celeste, C.lila],
    sizes: ["XS", "S", "M", "L", "XL"],
    price: 35,
    wholesale: 29,
    bestSeller: true,
    isNew: true,
  },
  {
    slug: "polo-melange",
    name: "Polo melange",
    short: "El gris jaspeado que combina con todo.",
    description:
      "Tela jaspeada con mezcla de algodón y poliéster que disimula el desgaste y casi no se arruga. Muy pedido para uniformes de trabajo.",
    fabric: "Jersey melange 85% algodón, 15% poliéster",
    shape: "tee",
    categories: ["hombre", "dama"],
    colors: [C.melange, { name: "Melange oscuro", hex: "#5E6166", melange: true }],
    sizes: ADULT,
    price: 22,
    wholesale: 18,
    bestSeller: true,
  },
  {
    slug: "polo-dama-entallado",
    name: "Polo dama entallado",
    short: "Silueta ajustada, manga corta.",
    description:
      "Polo de corte entallado con un toque de elastano para que acompañe el cuerpo sin apretar. Viene en colores básicos y de temporada.",
    fabric: "Jersey 95% algodón, 5% elastano",
    shape: "fitted",
    categories: ["dama"],
    colors: [C.negro, C.blanco, C.palo, C.vino, C.olivo, C.celeste],
    sizes: ["XS", "S", "M", "L", "XL"],
    price: 22,
    wholesale: 18,
    isNew: true,
  },
  {
    slug: "polera-capucha",
    name: "Polera con capucha",
    short: "Franela abrigadora para el invierno limeño.",
    description:
      "Polera de franela perchada por dentro, con capucha, bolsillo canguro y puños en rib. Lista para estampar el logo de tu empresa o promoción.",
    fabric: "Franela 80% algodón, 20% poliéster",
    shape: "hoodie",
    categories: ["hombre", "dama"],
    colors: [C.negro, C.melange, C.marino, C.botella, C.vino],
    sizes: ADULT,
    price: 55,
    wholesale: 45,
    isNew: true,
  },
  {
    slug: "polo-nino",
    name: "Polo niño básico",
    short: "Resistente para el colegio y el juego.",
    description:
      "El mismo algodón de nuestro polo básico, en tallas para niños. Perfecto para educación física, promociones escolares y uso diario.",
    fabric: "Jersey 30/1, 100% algodón peinado",
    shape: "tee",
    categories: ["nino"],
    colors: [C.blanco, C.rey, C.rojo, C.negro, C.mostaza, C.botella],
    sizes: KIDS,
    price: 15,
    wholesale: 12,
  },
  {
    slug: "polo-nina",
    name: "Polo niña",
    short: "Colores alegres, algodón suave.",
    description:
      "Polo de algodón suave en tallas para niñas, con cuello redondo y manga corta. Ideal para el día a día y para estampar.",
    fabric: "Jersey 30/1, 100% algodón peinado",
    shape: "fitted",
    categories: ["nina"],
    colors: [C.palo, C.lila, C.blanco, C.celeste, C.mostaza],
    sizes: KIDS,
    price: 15,
    wholesale: 12,
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const soles = (n: number) =>
  "S/ " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
