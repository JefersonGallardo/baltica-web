"use client";

import Link from "next/link";
import { useState } from "react";
import { BASE } from "@/lib/config";
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
          <Link href="/" className="logo" aria-label="Baltica T-Shirts, inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE}/logo-baltica.png`} alt="Baltica T-Shirts" width={1040} height={376} />
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
