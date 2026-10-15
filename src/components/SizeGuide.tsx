"use client";

import { useEffect, useRef } from "react";

// Medidas referenciales en centímetros (prenda en plano). Confirmar con el taller.
const ADULT = [
  ["S", 48, 68],
  ["M", 51, 71],
  ["L", 54, 74],
  ["XL", 57, 76],
  ["XXL", 60, 78],
];
const FITTED = [
  ["XS", 41, 60],
  ["S", 43, 62],
  ["M", 46, 64],
  ["L", 49, 66],
  ["XL", 52, 68],
];
const KIDS = [
  ["2", 30, 40],
  ["4", 32, 44],
  ["6", 34, 47],
  ["8", 36, 50],
  ["10", 38, 53],
  ["12", 40, 56],
  ["14", 42, 59],
  ["16", 44, 62],
];

export default function SizeGuide({
  open,
  onClose,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  kind: "adult" | "fitted" | "kids";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const rows = kind === "kids" ? KIDS : kind === "fitted" ? FITTED : ADULT;

  return (
    <dialog ref={ref} className="modal" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="modal-body">
        <div className="drawer-head">
          <h2>Guía de tallas</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="hint">
          Mide un polo que te quede bien, estirado sobre una mesa, y compara con la tabla.
        </p>
        <table className="size-table">
          <thead>
            <tr>
              <th>Talla</th>
              <th>Ancho de pecho</th>
              <th>Largo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([t, a, l]) => (
              <tr key={t}>
                <td>{t}</td>
                <td>{a} cm</td>
                <td>{l} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint">¿Entre dos tallas? Escríbenos y te ayudamos a elegir.</p>
      </div>
    </dialog>
  );
}
