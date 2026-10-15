"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import ProductCard from "@/components/ProductCard";
import SizeGuide from "@/components/SizeGuide";
import Tee from "@/components/Tee";
import { WHOLESALE_FROM } from "@/lib/config";
import { CATEGORY_LABEL, PRODUCTS, getProduct, soles } from "@/lib/products";
import { b, i, msg, siteUrl, waLink } from "@/lib/whatsapp";

const LINK_TOKEN = "[enlace]";

export default function ProductClient({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const params = useSearchParams();
  const { add, setOpen } = useCart();

  const [color, setColor] = useState(
    p.colors.find((c) => c.name === params.get("color")) ?? p.colors[0],
  );
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);
  const [needSize, setNeedSize] = useState(false);

  const isWholesale = qty >= WHOLESALE_FROM;
  const unit = isWholesale ? p.wholesale : p.price;
  const missing = WHOLESALE_FROM - qty;

  const handleAdd = () => {
    if (!size) return setNeedSize(true);
    add({ slug: p.slug, color: color.name, size, qty });
    setOpen(true);
  };

  const directMsg = msg(
    ["Hola Baltica, quiero este polo:"],
    [
      `${b(p.name)}`,
      `Color: ${color.name}`,
      `Talla: ${size ?? "por definir"}`,
      `Cantidad: ${qty}`,
    ],
    [
      `${b("Total referencial: " + soles(unit * qty))}`,
      i(`${soles(unit)} c/u${isWholesale ?", precio por mayor" : ""}`),
    ],
    [`${LINK_TOKEN}`],
    ["¿Tienen stock?"],
  );

  const kidsSizes = p.categories.some((c) => c === "nino" || c === "nina");
  const related = PRODUCTS.filter(
    (o) => o.slug !== p.slug && o.categories.some((c) => p.categories.includes(c)),
  ).slice(0, 4);

  return (
    <div className="wrap pdp">
      <nav className="crumbs" aria-label="Ruta">
        <Link href="/tienda/">Tienda</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/tienda/?cat=${p.categories[0]}`}>{CATEGORY_LABEL[p.categories[0]]}</Link>
      </nav>

      <div className="pdp-grid">
        <div className="pdp-media">
          <Tee color={color} shape={p.shape} className="pdp-tee" />
          <span className="pdp-color-name">{color.name}</span>
        </div>

        <div className="pdp-info">
          <h1>{p.name}</h1>
          <p className="pdp-fabric">{p.fabric}</p>

          <div className="pdp-price">
            <strong>{soles(unit)}</strong>
            <span>
              {isWholesale
                ? "Precio por mayor aplicado"
                : `${soles(p.wholesale)} c/u llevando ${WHOLESALE_FROM} o más`}
            </span>
          </div>

          <fieldset className="opt">
            <legend>
              Color <b>{color.name}</b>
            </legend>
            <div className="swatches swatches-lg">
              {p.colors.map((c) => (
                <button
                  key={c.name}
                  className="swatch"
                  aria-pressed={c.name === color.name}
                  aria-label={c.name}
                  title={c.name}
                  style={{ background: c.hex }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className={`opt ${needSize && !size ? "opt-error" : ""}`}>
            <legend>
              Talla
              <button className="link-btn" onClick={() => setGuide(true)}>
                Guía de tallas
              </button>
            </legend>
            <div className="sizes">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  className={`size ${size === s ? "is-on" : ""}`}
                  aria-pressed={size === s}
                  onClick={() => {
                    setSize(s);
                    setNeedSize(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {needSize && !size && <p className="error">Elige una talla para agregar al pedido.</p>}
          </fieldset>

          <fieldset className="opt">
            <legend>Cantidad</legend>
            <div className="qty qty-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Quitar uno">
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                aria-label="Cantidad"
              />
              <button onClick={() => setQty((q) => q + 1)} aria-label="Agregar uno">
                +
              </button>
              <button className="chip" onClick={() => setQty(12)}>
                1 docena
              </button>
            </div>
            {!isWholesale && missing <= 6 && (
              <p className="nudge">
                Te faltan {missing} para el precio por mayor. Puedes mezclar tallas y colores.
              </p>
            )}
          </fieldset>

          <div className="pdp-total">
            Total <strong>{soles(unit * qty)}</strong>
          </div>

          <div className="pdp-actions">
            <button className="btn btn-dark btn-block" onClick={handleAdd}>
              Agregar al pedido
            </button>
            <a
              className="btn btn-wa btn-block"
              href={waLink(directMsg)}
              onClick={(e) => {
                // El enlace al producto se arma al tocar (necesita la dirección real de la página)
                e.currentTarget.href = waLink(
                  directMsg.replace(LINK_TOKEN, siteUrl(`/producto/${p.slug}/?color=${encodeURIComponent(color.name)}`)),
                );
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pedir solo este por WhatsApp
            </a>
          </div>

          <div className="pdp-details">
            <p>{p.description}</p>
            <ul>
              <li>Confeccionado en nuestro taller de Gamarra.</li>
              <li>Delivery en Lima y envío por agencia a provincias.</li>
              <li>
                ¿Lo quieres con tu logo? <Link href="/mayoristas/">Cotiza el estampado</Link>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>También te puede interesar</h2>
          </div>
          <div className="grid">
            {related.map((r) => (
              <ProductCard key={r.slug} product={r} />
            ))}
          </div>
        </section>
      )}

      <SizeGuide
        open={guide}
        onClose={() => setGuide(false)}
        kind={kidsSizes ? "kids" : p.shape === "fitted" ? "fitted" : "adult"}
      />
    </div>
  );
}
