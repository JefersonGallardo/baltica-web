import { BASE, STORE } from "./config";

export function waLink(message: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}

// Enlace absoluto a una página del sitio (para incluirlo en el mensaje)
export function siteUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${BASE}${path}`;
}

// WhatsApp entiende *negrita*, _cursiva_ y listas con guion.
export const b = (t: string) => `*${t}*`;
export const i = (t: string) => `_${t}_`;
export const RULE = "──────────────";

export function msg(...blocks: (string | false | null | undefined | (string | false | null | undefined)[])[]) {
  return blocks
    .filter(Boolean)
    .map((x) => (Array.isArray(x) ? x.filter(Boolean).join("\n") : x))
    .join("\n\n");
}
