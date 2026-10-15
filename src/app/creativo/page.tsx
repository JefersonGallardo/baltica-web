import type { Metadata } from "next";
import Studio from "./Studio";

export const metadata: Metadata = {
  title: "Creativo: diseña tu polo | Baltica T-Shirts",
  description:
    "Sube tu imagen, elige un diseño o escribe tu texto y mira cómo queda tu polo con transfer, DTF, serigrafía, vinilo o pedrería antes de pedirlo.",
};

export default function Creativo() {
  return (
    <>
      <section className="creative-hero">
        <div className="wrap">
          <h1>Diseña tu polo y míralo antes de pedirlo</h1>
          <p className="lead">
            Sube tu imagen, elige uno de nuestros diseños o escribe tu frase. Mira cómo queda en tu
            talla y con la técnica que elijas, y pídelo por WhatsApp.
          </p>
        </div>
      </section>
      <Studio />
    </>
  );
}
