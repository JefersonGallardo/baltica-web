import type { Metadata } from "next";
import { Suspense } from "react";
import Tracker from "./Tracker";

export const metadata: Metadata = {
  title: "Seguimiento de pedido | Baltica T-Shirts",
};

export default function Seguimiento() {
  return (
    <>
      <section className="creative-hero">
        <div className="wrap">
          <h1>Sigue tu pedido</h1>
          <p className="lead">
            Escribe tu código de pedido para ver en qué etapa está tu polo y agendar cuándo recogerlo.
          </p>
        </div>
      </section>
      <Suspense fallback={<div className="wrap tracker" />}>
        <Tracker />
      </Suspense>
    </>
  );
}
