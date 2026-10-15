"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRODUCTS, type Color } from "@/lib/products";
import { BASE } from "@/lib/config";
import Tee from "./Tee";

// Todos los colores del catálogo, con cuántos modelos lo tienen y su precio más bajo.
const COLORS: { color: Color; models: number; from: number }[] = (() => {
  const map = new Map<string, { color: Color; models: number; from: number }>();
  for (const p of PRODUCTS) {
    for (const c of p.colors) {
      const cur = map.get(c.name);
      if (cur) {
        cur.models += 1;
        cur.from = Math.min(cur.from, p.price);
      } else map.set(c.name, { color: c, models: 1, from: p.price });
    }
  }
  // Orden de claro a oscuro, como en un colgador de tienda
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  };
  return [...map.values()].sort((a, b) => lum(b.color.hex) - lum(a.color.hex));
})();

const N = COLORS.length;
// La lista se repite varias veces y siempre volvemos a la copia del medio,
// así nunca se llega a un extremo vacío.
const COPIES = 5;
const MIDDLE = Math.floor(COPIES / 2);
const ITEMS = Array.from({ length: COPIES * N }, (_, i) => COLORS[i % N]);
const RED = Math.max(0, COLORS.findIndex((c) => c.color.name === "Rojo"));
const START = MIDDLE * N + RED;

export default function RackCarousel() {
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(START);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const touching = useRef(false);
  const raf = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copyWidth = () => {
    const ul = listRef.current!;
    const a = ul.children[0] as HTMLElement;
    const b = ul.children[N] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  };

  const centerOn = useCallback((i: number, smooth = true) => {
    const ul = listRef.current;
    const li = ul?.children[i] as HTMLElement | undefined;
    if (!ul || !li) return;
    ul.scrollTo({
      left: li.offsetLeft + li.offsetWidth / 2 - ul.clientWidth / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Índice del polo que está sobre la flecha
  const nearest = useCallback(() => {
    const ul = listRef.current!;
    const first = ul.children[0] as HTMLElement;
    const w = first.offsetWidth;
    const mid = ul.scrollLeft + ul.clientWidth / 2;
    const i = Math.round((mid - first.offsetLeft - w / 2) / w);
    return Math.min(ITEMS.length - 1, Math.max(0, i));
  }, []);

  // Salto invisible a la copia del medio (mismo color, misma posición en pantalla)
  const recenter = useCallback(() => {
    const ul = listRef.current;
    if (!ul) return 0;
    const i = nearest();
    const copy = Math.floor(i / N);
    if (copy === MIDDLE) return 0;
    const shift = (MIDDLE - copy) * copyWidth();
    ul.style.scrollSnapType = "none";
    ul.scrollLeft += shift;
    void ul.offsetWidth;
    ul.style.scrollSnapType = "";
    setActive(i + (MIDDLE - copy) * N);
    return shift;
  }, [nearest]);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setActive(nearest()));
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (!drag.current.down && !touching.current) recenter();
    }, 160);
  }, [nearest, recenter]);

  useEffect(() => {
    centerOn(START, false);
    const ul = listRef.current!;
    const onTouchStart = () => (touching.current = true);
    const onTouchEnd = () => {
      touching.current = false;
      onScroll();
    };
    const onResize = () => centerOn(MIDDLE * N + (nearest() % N), false);
    ul.addEventListener("touchstart", onTouchStart, { passive: true });
    ul.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      ul.removeEventListener("touchstart", onTouchStart);
      ul.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, [centerOn, nearest, onScroll]);

  // Arrastrar con el mouse (en celular el deslizamiento es nativo)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const ul = listRef.current!;
    drag.current = { down: true, startX: e.clientX, startScroll: ul.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
      listRef.current!.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const ul = listRef.current!;
    ul.scrollLeft = d.startScroll - dx;
    // Si el arrastre se acerca a un borde, saltamos a la copia del medio sin soltar
    const copy = Math.floor(nearest() / N);
    if (copy === 0 || copy === COPIES - 1) d.startScroll += recenter();
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved) {
      setDragging(false);
      // Al soltar, el polo más cercano se acomoda sobre la flecha
      requestAnimationFrame(() => centerOn(nearest()));
    }
  };

  const onItemClick = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    if (i !== active) centerOn(i);
    else router.push(`/tienda/?color=${encodeURIComponent(ITEMS[i].color.name)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      centerOn(active + (e.key === "ArrowRight" ? 1 : -1));
    }
  };

  const cur = ITEMS[active];

  return (
    <div className="rack">
      <div className="rack-rail" />
      <ul
        ref={listRef}
        className={`rack-items ${dragging ? "is-dragging" : ""}`}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Colores disponibles. Desliza o usa las flechas del teclado."
      >
        {ITEMS.map(({ color, from }, i) => (
          <li
            key={`${color.name}-${Math.floor(i / N)}`}
            className={i === active ? "is-active" : ""}
            style={{ ["--i" as string]: Math.abs(i - START) }}
            aria-hidden={Math.floor(i / N) !== MIDDLE}
          >
            <a
              href={`${BASE}/tienda/?color=${encodeURIComponent(color.name)}`}
              className="rack-item"
              onClick={(e) => onItemClick(e, i)}
              draggable={false}
              tabIndex={-1}
              aria-label={color.name}
            >
              <svg className="hanger" viewBox="0 0 60 30" aria-hidden="true">
                <path d="M30 2 Q36 2 36 8 Q36 12 30 14 L4 27 L56 27 L30 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
              <span className={`rack-sway ${i === active ? "sway" : ""}`} key={i === active ? `a${i}` : i}>
                <Tee color={color} className="rack-tee" />
              </span>
            </a>
            {i === active && (
              <span className="price-tag" aria-hidden="true">
                desde<b>S/ {from}</b>
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="rack-pointer" aria-live="polite">
        <span className="rack-arrow" aria-hidden="true" />
        <strong className="rack-current">{cur.color.name}</strong>
        <Link href={`/tienda/?color=${encodeURIComponent(cur.color.name)}`} className="rack-link">
          Ver {cur.models} {cur.models === 1 ? "modelo" : "modelos"} en este color
        </Link>
      </div>
    </div>
  );
}
