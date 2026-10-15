"use client";

import Link from "next/link";
import { useEffect } from "react";
import { WHOLESALE_FROM } from "@/lib/config";
import { getProduct, soles } from "@/lib/products";
import { waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import Tee from "./Tee";

export default function CartDrawer() {
  const { open, setOpen, lines, total, setQty, remove, message } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`drawer-root ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Tu pedido" aria-modal="true">
        <div className="drawer-head">
          <h2>Tu pedido</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Todavía no agregaste prendas.</p>
            <Link href="/tienda/" className="btn btn-dark" onClick={() => setOpen(false)}>
              Ver la tienda
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer-list">
              {lines.map((l, i) => {
                const p = getProduct(l.slug)!;
                const color = p.colors.find((c) => c.name === l.color) ?? p.colors[0];
                return (
                  <li key={`${l.slug}-${l.color}-${l.size}`} className="line">
                    <Tee color={color} shape={p.shape} className="line-tee" />
                    <div className="line-info">
                      <strong>{l.name}</strong>
                      <span>
                        {l.color}, talla {l.size}
                      </span>
                      <span className="line-price">
                        {soles(l.unit)} c/u
                        {l.isWholesale && <em className="tag-mini">por mayor</em>}
                      </span>
                      <div className="qty">
                        <button onClick={() => setQty(i, l.qty - 1)} aria-label="Quitar uno">
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={l.qty}
                          onChange={(e) => setQty(i, Number(e.target.value) || 1)}
                          aria-label="Cantidad"
                        />
                        <button onClick={() => setQty(i, l.qty + 1)} aria-label="Agregar uno">
                          +
                        </button>
                        <button className="link-btn" onClick={() => remove(i)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                    <span className="line-total">{soles(l.total)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="drawer-foot">
              <p className="hint">
                Desde {WHOLESALE_FROM} unidades del mismo modelo (puedes mezclar tallas y colores)
                el precio por mayor se aplica solo.
              </p>
              <div className="drawer-total">
                <span>Total referencial</span>
                <strong>{soles(total)}</strong>
              </div>
              <a
                className="btn btn-wa btn-block"
                href={waLink(message())}
                target="_blank"
                rel="noopener noreferrer"
              >
                Enviar pedido por WhatsApp
              </a>
              <p className="hint center">
                Te confirmamos stock y envío por chat. Pagas con Yape, Plin, transferencia o
                tarjeta.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
