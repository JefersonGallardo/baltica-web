// DEMO: los pedidos se guardan solo en este dispositivo (localStorage).
// En la versión real se guardan en una base de datos y la tienda actualiza
// los estados desde un panel; el cliente los ve con su código o su cuenta.

export const STEPS = [
  { title: "Pedido recibido", text: "Recibimos tu diseño y los datos de tu polo." },
  { title: "Diseño revisado", text: "Revisamos que tu imagen tenga buena calidad para estampar." },
  { title: "En estampado", text: "Tu polo está en el taller." },
  { title: "Listo para recoger", text: "Agenda el día y la hora en que pasarás por la tienda." },
  { title: "Entregado", text: "¡Gracias por tu compra!" },
];

export type Order = {
  code: string;
  createdAt: number;
  step: number;
  detail: string[]; // líneas legibles del pedido
  total: number;
  pickup?: { date: string; slot: string };
};

const KEY = "baltica-ordenes";

export function newCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const rnd = crypto.getRandomValues(new Uint32Array(6));
  for (const n of rnd) s += chars[n % chars.length];
  return `BAL-${s}`;
}

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function save(list: Order[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
  } catch {}
}

export function saveOrder(o: Order) {
  save([o, ...getOrders().filter((x) => x.code !== o.code)]);
}

export function getOrder(code: string) {
  return getOrders().find((o) => o.code === code.trim().toUpperCase());
}

export function updateOrder(code: string, patch: Partial<Order>) {
  const list = getOrders().map((o) => (o.code === code ? { ...o, ...patch } : o));
  save(list);
  return list.find((o) => o.code === code);
}
