"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { STORE } from "@/lib/config";
import { STEPS, getOrder, getOrders, updateOrder, type Order } from "@/lib/orders";
import { soles } from "@/lib/products";
import { waLink } from "@/lib/whatsapp";

const SLOTS = ["10:00 a 12:00", "12:00 a 14:00", "14:00 a 16:00", "16:00 a 18:00"];

function nextDays(n: number) {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue; // domingo cerrado (referencial)
    out.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return out;
}

export default function Tracker() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("codigo") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [mine, setMine] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const days = nextDays(5);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMine(getOrders());
    const c = params.get("codigo");
    if (c) {
      const o = getOrder(c);
      if (o) setOrder(o);
      else setError("No encontramos ese código en este dispositivo.");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [params]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const o = getOrder(code);
    setError(o ? "" : "No encontramos ese código. Revisa que esté bien escrito, por ejemplo BAL-7KQ2MX.");
    setOrder(o ?? null);
  };

  const refresh = (o?: Order) => {
    if (o) setOrder(o);
    setMine(getOrders());
  };

  const confirmPickup = () => {
    if (!order || !date || !slot) return;
    const o = updateOrder(order.code, { pickup: { date, slot } });
    refresh(o);
    const label = days.find((d) => d.value === date)?.label ?? date;
    window.open(
      waLink(`Hola Baltica, paso a recoger mi pedido ${order.code} el ${label}, entre ${slot}.`),
      "_blank",
      "noopener",
    );
  };

  return (
    <div className="wrap tracker">
      <form className="track-form" onSubmit={search}>
        <label className="field">
          Código de pedido
          <input
            type="text"
            value={code}
            placeholder="BAL-7KQ2MX"
            autoCapitalize="characters"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </label>
        <button className="btn btn-dark" type="submit">
          Ver estado
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      {order && (
        <section className="track-card">
          <div className="track-head">
            <div>
              <p className="hint">Pedido</p>
              <h2 className="code">{order.code}</h2>
            </div>
            <strong>{soles(order.total)}</strong>
          </div>
          <ul className="track-detail">
            {order.detail.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <ol className="timeline">
            {STEPS.map((s, i) => (
              <li key={s.title} className={i < order.step ? "done" : i === order.step ? "current" : ""}>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
                {i === 3 && order.step === 3 && (
                  <div className="pickup">
                    {order.pickup ? (
                      <p className="ok-msg">
                        Agendado para el {days.find((d) => d.value === order.pickup!.date)?.label ?? order.pickup.date},
                        entre {order.pickup.slot}. Te esperamos en {STORE.address}, {STORE.stores}.
                      </p>
                    ) : (
                      <>
                        <p className="field-label">¿Qué día pasas?</p>
                        <div className="filter-row">
                          {days.map((d) => (
                            <button key={d.value} type="button" className={`chip ${date === d.value ? "is-on" : ""}`} aria-pressed={date === d.value} onClick={() => setDate(d.value)}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                        <p className="field-label">¿A qué hora?</p>
                        <div className="filter-row">
                          {SLOTS.map((s) => (
                            <button key={s} type="button" className={`chip ${slot === s ? "is-on" : ""}`} aria-pressed={slot === s} onClick={() => setSlot(s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                        <button className="btn btn-yellow" type="button" onClick={confirmPickup} disabled={!date || !slot}>
                          Agendar recojo
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>

          <div className="demo-box">
            <p>
              <strong>Solo para la demo.</strong> En la versión real, la tienda cambia el estado desde su panel y
              el cliente lo ve al instante desde cualquier dispositivo.
            </p>
            <button
              className="btn btn-outline"
              type="button"
              disabled={order.step >= STEPS.length - 1}
              onClick={() => refresh(updateOrder(order.code, { step: Math.min(STEPS.length - 1, order.step + 1) }))}
            >
              Simular siguiente estado
            </button>
          </div>
        </section>
      )}

      <section className="my-orders">
        <h2>Mis pedidos en este dispositivo</h2>
        {mine.length === 0 ? (
          <p className="hint">
            Todavía no tienes pedidos. <Link href="/creativo/">Diseña tu polo</Link> y aparecerá aquí.
          </p>
        ) : (
          <ul>
            {mine.map((o) => (
              <li key={o.code}>
                <button className="link-btn" onClick={() => { setCode(o.code); setOrder(o); setError(""); }}>
                  {o.code}
                </button>
                <span>{STEPS[o.step].title}</span>
                <span>{new Date(o.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
