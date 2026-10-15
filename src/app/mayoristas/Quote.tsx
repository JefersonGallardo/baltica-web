"use client";

import { useState } from "react";
import { WHOLESALE_FROM } from "@/lib/config";
import { PRODUCTS, soles } from "@/lib/products";
import { b, i, msg, waLink } from "@/lib/whatsapp";

// Costos referenciales de estampado por prenda (confirmar con el taller).
const PRINT = {
  ninguno: { label: "Sin estampado", perPlace: 0, note: "" },
  transfer: { label: "Transfer", perPlace: 4, note: "El más pedido por unidad. Diseños en stock." },
  serigrafia: { label: "Serigrafía", perPlace: 3, note: "Ideal desde una docena. Se cobra por color." }, // por color y ubicación
  dtf: { label: "DTF", perPlace: 6, note: "A todo color, ideal desde una docena." },
  vinilo: { label: "Vinilo de corte", perPlace: 5, note: "Nombres, números y logos de un color." },
  pedreria: { label: "Pedrería", perPlace: 8, note: "Brillos para diseños de dama." },
} as const;
type PrintKind = keyof typeof PRINT;

const PLACES = ["Pecho izquierdo", "Pecho completo", "Espalda", "Manga"];

export default function Quote() {
  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const [qty, setQty] = useState(24);
  const [print, setPrint] = useState<PrintKind>("serigrafia");
  const [places, setPlaces] = useState<string[]>(["Pecho izquierdo"]);
  const [inks, setInks] = useState(1);
  const [colors, setColors] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const p = PRODUCTS.find((x) => x.slug === slug)!;
  const garment = qty >= WHOLESALE_FROM ? p.wholesale : p.price;
  const printUnit =
    print === "ninguno"
      ? 0
      : PRINT[print].perPlace * places.length * (print === "serigrafia" ? inks : 1);
  const unit = garment + printUnit;
  const total = unit * qty;
  const big = qty >= 50;

  const togglePlace = (pl: string) =>
    setPlaces((cur) => (cur.includes(pl) ? cur.filter((x) => x !== pl) : [...cur, pl]));

  const dateLabel = date
    ? new Date(date + "T12:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const message = msg(
    ["Hola Baltica 👋", "Quiero una cotización por mayor:"],
    [
      `🏷️ ${b("Pedido")}`,
      `Modelo: ${p.name}`,
      `Cantidad: ${qty} prendas`,
      colors && `Colores: ${colors}`,
    ],
    [
      `🎨 ${b("Estampado: " + PRINT[print].label)}`,
      print !== "ninguno" && `Ubicación: ${places.join(", ").toLowerCase() || "por definir"}`,
      print === "serigrafia" && `Colores del diseño: ${inks}`,
    ],
    (date || name) && [
      `📋 ${b("Datos")}`,
      name && `Nombre o empresa: ${name}`,
      date && `Lo necesito para: ${dateLabel}`,
    ],
    [
      `💰 ${b("Estimado de la web: " + soles(total))}`,
      i(`${soles(unit)} por prenda`),
    ],
    big ? "Somos más de 50 prendas, ¿qué precio especial nos pueden dar? 🙌" : "¿Me confirman precio y tiempo de entrega? 🙌",
  );

  return (
    <div className="quote">
      <form className="quote-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Modelo
          <select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {PRODUCTS.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cantidad total
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>

        <label className="full">
          Colores que necesitas <span className="opt-label">opcional</span>
          <input
            type="text"
            placeholder="Ej. 12 negros y 12 blancos"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
          />
        </label>

        <fieldset className="full">
          <legend>Estampado</legend>
          <div className="filter-row">
            {(Object.keys(PRINT) as PrintKind[]).map((k) => (
              <button
                type="button"
                key={k}
                className={`chip ${print === k ? "is-on" : ""}`}
                aria-pressed={print === k}
                onClick={() => setPrint(k)}
              >
                {PRINT[k].label}
              </button>
            ))}
          </div>
          {PRINT[print].note && <p className="hint">{PRINT[print].note}</p>}
        </fieldset>

        {print !== "ninguno" && (
          <>
            <fieldset className="full">
              <legend>Dónde va el diseño</legend>
              <div className="filter-row">
                {PLACES.map((pl) => (
                  <button
                    type="button"
                    key={pl}
                    className={`chip ${places.includes(pl) ? "is-on" : ""}`}
                    aria-pressed={places.includes(pl)}
                    onClick={() => togglePlace(pl)}
                  >
                    {pl}
                  </button>
                ))}
              </div>
            </fieldset>
            {print === "serigrafia" && (
              <label>
                Colores del diseño
                <select value={inks} onChange={(e) => setInks(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "color" : "colores"}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        <label>
          ¿Para cuándo lo necesitas? <span className="opt-label">opcional</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label className="full">
          Nombre o empresa <span className="opt-label">opcional</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </form>

      <aside className="quote-summary" aria-live="polite">
        <h3>Tu estimado</h3>
        <dl>
          <div>
            <dt>Prenda {qty >= WHOLESALE_FROM ? "(por mayor)" : ""}</dt>
            <dd>{soles(garment)}</dd>
          </div>
          {printUnit > 0 && (
            <div>
              <dt>Estampado</dt>
              <dd>{soles(printUnit)}</dd>
            </div>
          )}
          <div className="sum-unit">
            <dt>Por prenda</dt>
            <dd>{soles(unit)}</dd>
          </div>
          <div className="sum-total">
            <dt>{qty} prendas</dt>
            <dd>{soles(total)}</dd>
          </div>
        </dl>
        {qty < WHOLESALE_FROM && (
          <p className="nudge">Con {WHOLESALE_FROM - qty} prendas más pagas precio por mayor.</p>
        )}
        {big && <p className="nudge">Desde 50 prendas te damos un precio especial por chat.</p>}
        <a className="btn btn-wa btn-block" href={waLink(message)} target="_blank" rel="noopener noreferrer">
          Enviar cotización por WhatsApp
        </a>
        <p className="hint">Estimado referencial. Te confirmamos el precio final y el tiempo de entrega por chat.</p>
      </aside>
    </div>
  );
}
