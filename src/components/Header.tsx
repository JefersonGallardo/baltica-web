"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/tienda/", label: "Tienda" },
  { href: "/tienda/?cat=hombre", label: "Hombre" },
  { href: "/tienda/?cat=dama", label: "Dama" },
  { href: "/tienda/?cat=ninos", label: "Niños" },
  { href: "/mayoristas/", label: "Por mayor y empresas" },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <>
      <div className="demo-bar">
        Versión demo de la propuesta de rediseño. Precios y fotos referenciales.
      </div>
      <header className="header">
        <div className="wrap header-inner">
          <Link href="/" className="wordmark" aria-label="Baltica, inicio">
            BALTICA<span>T-Shirts · Gamarra</span>
          </Link>
          <nav className={`nav ${menu ? "nav-open" : ""}`} aria-label="Principal">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button className="cart-btn" onClick={() => setOpen(true)}>
              Mi pedido
              <span className="cart-count" aria-label={`${count} prendas`}>
                {count}
              </span>
            </button>
            <button
              className="menu-btn"
              aria-expanded={menu}
              aria-label="Abrir menú"
              onClick={() => setMenu((m) => !m)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
