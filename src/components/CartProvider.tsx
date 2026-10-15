"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WHOLESALE_FROM } from "@/lib/config";
import { getProduct, soles } from "@/lib/products";

export type CartItem = {
  slug: string;
  color: string;
  size: string;
  qty: number;
};

export type PricedLine = CartItem & {
  name: string;
  unit: number;
  total: number;
  isWholesale: boolean;
};

type CartCtx = {
  items: CartItem[];
  lines: PricedLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItem) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  message: () => string;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "baltica-pedido";

// El precio por mayor se aplica por modelo: si suman 12 o más unidades
// del mismo modelo (mezclando tallas y colores), todas pasan a precio por mayor.
export function priceLines(items: CartItem[]): PricedLine[] {
  const perModel: Record<string, number> = {};
  for (const it of items) perModel[it.slug] = (perModel[it.slug] || 0) + it.qty;
  return items.flatMap((it) => {
    const p = getProduct(it.slug);
    if (!p) return [];
    const isWholesale = perModel[it.slug] >= WHOLESALE_FROM;
    const unit = isWholesale ? p.wholesale : p.price;
    return [{ ...it, name: p.name, unit, total: unit * it.qty, isWholesale }];
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const i = prev.findIndex(
        (p) => p.slug === item.slug && p.color === item.color && p.size === item.size,
      );
      if (i === -1) return [...prev, item];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + item.qty };
      return next;
    });
  }, []);

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, qty: Math.max(1, qty) } : p)),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const lines = useMemo(() => priceLines(items), [items]);
  const total = lines.reduce((s, l) => s + l.total, 0);
  const count = items.reduce((s, l) => s + l.qty, 0);

  const message = useCallback(() => {
    const rows = lines.map(
      (l) =>
        `• ${l.qty} x ${l.name}\n   Color ${l.color}, talla ${l.size}: ${soles(l.unit)} c/u = ${soles(l.total)}${l.isWholesale ? " (precio por mayor)" : ""}`,
    );
    return [
      "Hola Baltica, quiero hacer este pedido:",
      "",
      ...rows,
      "",
      `Total referencial: ${soles(total)}`,
      "",
      "¿Me confirman stock y el costo de envío?",
    ].join("\n");
  }, [lines, total]);

  return (
    <Ctx.Provider
      value={{ items, lines, count, total, open, setOpen, add, setQty, remove, clear, message }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart fuera de CartProvider");
  return c;
}
