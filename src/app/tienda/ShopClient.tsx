"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABEL, PRODUCTS, type Category, type Color } from "@/lib/products";

type CatFilter = Category | "ninos" | "todos";
type Sort = "relevancia" | "menor" | "mayor";

const CAT_OPTIONS: { value: CatFilter; label: string }[] = [
  { value: "todos", label: "Todo" },
  { value: "hombre", label: "Hombre" },
  { value: "dama", label: "Dama" },
  { value: "ninos", label: "Niños y niñas" },
  { value: "nino", label: "Niño" },
  { value: "nina", label: "Niña" },
];

const ALL_COLORS: Color[] = Array.from(
  new Map(PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])).values(),
);
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2", "4", "6", "8", "10", "12", "14", "16"];

export default function ShopClient() {
  const params = useSearchParams();
  const router = useRouter();
  const rawCat = params.get("cat") as CatFilter | null;
  const cat: CatFilter = rawCat && CAT_OPTIONS.some((o) => o.value === rawCat) ? rawCat : "todos";
  const color = params.get("color");
  const [size, setSize] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("relevancia");

  // Los filtros de categoría y color viven en el enlace, así se pueden compartir.
  const setParam = (key: "cat" | "color", value: string | null) => {
    const q = new URLSearchParams(params.toString());
    if (value && value !== "todos") q.set(key, value);
    else q.delete(key);
    const qs = q.toString();
    router.replace(`/tienda/${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const setCat = (v: CatFilter) => setParam("cat", v);
  const setColor = (v: string | null) => setParam("color", v);

  const results = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (cat === "ninos" && !p.categories.some((c) => c === "nino" || c === "nina")) return false;
      if (cat !== "todos" && cat !== "ninos" && !p.categories.includes(cat)) return false;
      if (color && !p.colors.some((c) => c.name === color)) return false;
      if (size && !p.sizes.includes(size)) return false;
      return true;
    });
    if (sort === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "mayor") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [cat, color, size, sort]);

  const title =
    cat === "todos" ? "Todos los modelos" : cat === "ninos" ? "Niños y niñas" : CATEGORY_LABEL[cat];
  const hasFilters = cat !== "todos" || color || size;

  return (
    <div className="wrap shop">
      <div className="shop-head">
        <h1>{title}</h1>
        <p>
          {results.length} {results.length === 1 ? "modelo" : "modelos"}
          {color ? ` en ${color.toLowerCase()}` : ""}
        </p>
      </div>

      <div className="filters">
        <div className="filter-row" role="group" aria-label="Categoría">
          {CAT_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`chip ${cat === o.value ? "is-on" : ""}`}
              aria-pressed={cat === o.value}
              onClick={() => setCat(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <details className="filter-more" open>
          <summary>Color y talla</summary>
          <div className="filter-row" role="group" aria-label="Color">
            {ALL_COLORS.map((c) => (
              <button
                key={c.name}
                className={`chip chip-color ${color === c.name ? "is-on" : ""}`}
                aria-pressed={color === c.name}
                onClick={() => setColor(color === c.name ? null : c.name)}
              >
                <i style={{ background: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
          <div className="filter-row" role="group" aria-label="Talla">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                className={`chip chip-size ${size === s ? "is-on" : ""}`}
                aria-pressed={size === s}
                onClick={() => setSize(size === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </details>

        <div className="filter-bar">
          <label>
            Ordenar
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="relevancia">Más pedidos</option>
              <option value="menor">Precio: menor a mayor</option>
              <option value="mayor">Precio: mayor a menor</option>
            </select>
          </label>
          {hasFilters && (
            <button
              className="link-btn"
              onClick={() => {
                router.replace("/tienda/", { scroll: false });
                setSize(null);
              }}
            >
              Quitar filtros
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty">
          <p>Ningún modelo tiene esa combinación. Prueba con otro color o talla.</p>
          <button
            className="btn btn-dark"
            onClick={() => {
              setColor(null);
              setSize(null);
            }}
          >
            Quitar color y talla
          </button>
        </div>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <ProductCard key={`${p.slug}-${color}`} product={p} initialColor={color ?? undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
