import type { Metadata } from "next";
import { WHOLESALE_FROM } from "@/lib/config";
import { PRODUCTS, soles } from "@/lib/products";
import Quote from "./Quote";

export const metadata: Metadata = {
  title: "Por mayor y empresas | Baltica T-Shirts",
  description:
    "Polos por mayor y con estampado para uniformes, promociones, eventos y reventa. Cotiza en línea y recibe respuesta por WhatsApp.",
};

const USES = [
  { t: "Uniformes de trabajo", d: "Polos y poleras con el logo de tu empresa, en las tallas de todo tu equipo." },
  { t: "Promociones y eventos", d: "Polos para promociones de colegio, campañas, maratones y activaciones." },
  { t: "Reventa", d: "Precio de taller para tu tienda o tu emprendimiento, sin estampado." },
];

export default function Mayoristas() {
  return (
    <>
      <section className="wb-hero">
        <div className="wrap">
          <h1>Por mayor y para empresas</h1>
          <p className="lead">
            Desde {WHOLESALE_FROM} prendas del mismo modelo pagas precio por mayor. Si necesitas tu
            logo, lo estampamos aquí mismo en Gamarra: transfer, serigrafía, DTF, vinilo de corte o pedrería.
          </p>
        </div>
      </section>

      <section className="wrap section">
        <div className="uses">
          {USES.map((u) => (
            <div key={u.t}>
              <h3>{u.t}</h3>
              <p>{u.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section quote-section" id="cotizar">
        <div className="section-head">
          <h2>Arma tu cotización</h2>
        </div>
        <Quote />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Precios por cantidad</h2>
        </div>
        <div className="table-scroll">
          <table className="price-table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>1 a {WHOLESALE_FROM - 1}</th>
                <th>
                  {WHOLESALE_FROM} a 49
                </th>
                <th>50 a más</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr key={p.slug}>
                  <th>{p.name}</th>
                  <td>{soles(p.price)}</td>
                  <td>{soles(p.wholesale)}</td>
                  <td>A cotizar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">Precios por unidad, sin estampado. Referenciales para esta demo.</p>
      </section>
    </>
  );
}
