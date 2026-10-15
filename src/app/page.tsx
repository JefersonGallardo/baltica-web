import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import RackCarousel from "@/components/RackCarousel";
import Tee from "@/components/Tee";
import { STORE, WHOLESALE_FROM } from "@/lib/config";
import { C, PRODUCTS, soles } from "@/lib/products";

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

        <RackCarousel />
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
