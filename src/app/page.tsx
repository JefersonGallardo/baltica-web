import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Tee from "@/components/Tee";
import { STORE, WHOLESALE_FROM } from "@/lib/config";
import { C, PRODUCTS, soles, type Color } from "@/lib/products";

const RACK: Color[] = [
  C.blanco, C.arena, C.mostaza, C.rojo, C.vino, C.palo, C.lila,
  C.celeste, C.rey, C.marino, C.botella, C.olivo, C.melange, C.negro,
];

const CATS = [
  { href: "/tienda/?cat=hombre", label: "Hombre", color: C.marino, shape: "tee" as const },
  { href: "/tienda/?cat=dama", label: "Dama", color: C.palo, shape: "fitted" as const },
  { href: "/tienda/?cat=nino", label: "Niño", color: C.rey, shape: "tee" as const },
  { href: "/tienda/?cat=nina", label: "Niña", color: C.lila, shape: "fitted" as const },
];

export default function Home() {
  const best = PRODUCTS.filter((p) => p.bestSeller);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-copy">
          <h1>Polos de algodón hechos en Gamarra</h1>
          <p className="lead">
            Por unidad desde S/ 20 o por mayor para tu negocio, tu equipo o tu promoción.
            Pides por WhatsApp y te lo enviamos a todo el Perú.
          </p>
          <div className="hero-ctas">
            <Link href="/tienda/" className="btn btn-dark">
              Ver la tienda
            </Link>
            <Link href="/mayoristas/" className="btn btn-outline">
              Cotizar por mayor
            </Link>
          </div>
        </div>

        <div className="rack" aria-label="Colores disponibles">
          <div className="rack-rail" />
          <ul className="rack-items">
            {RACK.map((c, i) => (
              <li key={c.name} style={{ ["--i" as string]: i }}>
                <Link href={`/tienda/?color=${encodeURIComponent(c.name)}`} className="rack-item">
                  <svg className="hanger" viewBox="0 0 60 30" aria-hidden="true">
                    <path d="M30 2 Q36 2 36 8 Q36 12 30 14 L4 27 L56 27 L30 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
                  </svg>
                  <Tee color={c} className="rack-tee" />
                  <span className="rack-name">{c.name}</span>
                </Link>
                {i === 1 && (
                  <span className="price-tag" aria-hidden="true">
                    desde<b>S/ 20</b>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="facts">
        <div className="wrap facts-grid">
          <p><strong>Envíos a todo el Perú</strong>Delivery en Lima y envío por agencia a provincias.</p>
          <p><strong>Paga como prefieras</strong>Yape, Plin, transferencia o tarjeta.</p>
          <p><strong>Precio por mayor</strong>Desde {WHOLESALE_FROM} prendas del mismo modelo.</p>
          <p><strong>Tienda en Gamarra</strong>{STORE.address}.</p>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Lo más pedido</h2>
          <Link href="/tienda/" className="more">Ver todos los modelos</Link>
        </div>
        <div className="grid">
          {best.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Compra por categoría</h2>
        </div>
        <div className="cats">
          {CATS.map((c) => (
            <Link key={c.label} href={c.href} className="cat">
              <Tee color={c.color} shape={c.shape} className="cat-tee" />
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wholesale-band">
        <div className="wrap wholesale-inner">
          <div>
            <h2>Uniformes, promociones y reventa</h2>
            <p>
              Te hacemos precio por cantidad y estampamos tu logo en serigrafía, DTF, transfer, vinilo o pedrería.
              Arma tu cotización en un minuto y te respondemos por WhatsApp.
            </p>
            <Link href="/mayoristas/" className="btn btn-yellow">
              Armar mi cotización
            </Link>
          </div>
          <table className="tiers">
            <caption>Polo básico, precio por unidad</caption>
            <tbody>
              <tr><th>1 a 11 prendas</th><td>{soles(20)}</td></tr>
              <tr><th>12 a 49 prendas</th><td>{soles(16)}</td></tr>
              <tr><th>50 a más</th><td>A cotizar</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>Cómo comprar</h2>
        </div>
        <ol className="steps">
          <li>
            <strong>Elige modelo, color y talla</strong>
            Agrega a tu pedido todas las prendas que quieras, puedes mezclar.
          </li>
          <li>
            <strong>Envía tu pedido por WhatsApp</strong>
            Llega a nuestro chat con el detalle y el total ya calculados.
          </li>
          <li>
            <strong>Paga y recibe</strong>
            Te confirmamos stock, pagas como prefieras y te lo despachamos.
          </li>
        </ol>
      </section>
    </>
  );
}
