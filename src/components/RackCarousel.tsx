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

const START = Math.max(
  0,
  COLORS.findIndex((c) => c.color.name === "Rojo"),
);

export default function RackCarousel() {
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(START);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const raf = useRef(0);

  const centerOn = useCallback((i: number, smooth = true) => {
    const ul = listRef.current;
    const li = ul?.children[i] as HTMLElement | undefined;
    if (!ul || !li) return;
    ul.scrollTo({
      left: li.offsetLeft + li.offsetWidth / 2 - ul.clientWidth / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Cuál polo está sobre la flecha
  const measure = useCallback(() => {
    const ul = listRef.current;
    if (!ul) return;
    const mid = ul.scrollLeft + ul.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(ul.children).forEach((el, i) => {
      const li = el as HTMLElement;
      const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(measure);
  };

  useEffect(() => {
    centerOn(START, false);
    const onResize = () => centerOn(START, false);
    window.addEventListener("resize", onResize, { once: true });
    return () => window.removeEventListener("resize", onResize);
  }, [centerOn]);

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
    if (d.moved) listRef.current!.scrollLeft = d.startScroll - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved) {
      setDragging(false);
      measure();
      // Al soltar, el polo más cercano se acomoda sobre la flecha
      requestAnimationFrame(() => {
        const ul = listRef.current!;
        const mid = ul.scrollLeft + ul.clientWidth / 2;
        let best = 0;
        let dist = Infinity;
        Array.from(ul.children).forEach((el, i) => {
          const li = el as HTMLElement;
          const dd = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
          if (dd < dist) {
            dist = dd;
            best = i;
          }
        });
        centerOn(best);
      });
    }
  };

  const onItemClick = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    if (i !== active) centerOn(i);
    else router.push(`/tienda/?color=${encodeURIComponent(COLORS[i].color.name)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      centerOn(Math.min(COLORS.length - 1, active + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      centerOn(Math.max(0, active - 1));
    }
  };

  const cur = COLORS[active];

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
        {COLORS.map(({ color, from }, i) => (
          <li
            key={color.name}
            className={i === active ? "is-active" : ""}
            style={{ ["--i" as string]: i }}
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
