// Todo el procesamiento de imágenes ocurre en el navegador del cliente.
// El archivo nunca se sube a ningún servidor: se valida, se redibuja en un canvas
// (lo que descarta metadatos y cualquier contenido que no sea la imagen) y se usa solo aquí.

export const MAX_FILE_MB = 10;
const MAX_SIDE = 2400; // px con los que trabajamos (suficiente para A3 a ~200 dpi)
const MIN_SIDE = 200;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

export type UploadResult =
  | {
      ok: true;
      canvas: HTMLCanvasElement; // versión de trabajo para la vista previa
      full: HTMLCanvasElement; // resolución completa, para enviar a la tienda
      photo: boolean; // true si era JPG (se exporta como JPG de alta calidad)
      name: string;
      transparent: boolean;
    }
  | { ok: false; error: string };

const FULL_SIDE = 6000; // límite de la copia en alta resolución

function sniff(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return "image/webp";
  return null;
}

export async function readUpload(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, error: `La imagen pesa más de ${MAX_FILE_MB} MB. Prueba con una más liviana.` };
  }
  // 1) La extensión y el tipo declarado pueden mentir: revisamos los primeros bytes reales
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const real = sniff(head);
  if (!real || !ALLOWED.includes(real)) {
    return { ok: false, error: "Solo aceptamos imágenes PNG, JPG o WEBP." };
  }
  // 2) Decodificamos la imagen; si está dañada o es otra cosa, falla aquí
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return { ok: false, error: "No pudimos abrir esa imagen. Puede estar dañada." };
  }
  if (bmp.width < MIN_SIDE || bmp.height < MIN_SIDE) {
    bmp.close();
    return { ok: false, error: `La imagen es muy pequeña. Usa una de al menos ${MIN_SIDE} px por lado.` };
  }
  // 3) La redibujamos en canvas nuevos: solo quedan los píxeles (sin metadatos
  //    como la ubicación GPS de la foto). Guardamos una copia a resolución completa.
  const fs = Math.min(1, FULL_SIDE / Math.max(bmp.width, bmp.height));
  const full = document.createElement("canvas");
  full.width = Math.round(bmp.width * fs);
  full.height = Math.round(bmp.height * fs);
  full.getContext("2d")!.drawImage(bmp, 0, 0, full.width, full.height);
  bmp.close();
  const work = clone(full, MAX_SIDE);
  const trimmed = trim(work);
  return {
    ok: true,
    canvas: trimmed,
    full,
    photo: real === "image/jpeg",
    name: shortName(file.name),
    transparent: hasTransparency(trimmed),
  };
}

export function hasTransparency(c: HTMLCanvasElement) {
  const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
  let t = 0;
  for (let i = 3; i < d.length; i += 4 * 7) if (d[i] < 200) t++;
  return t / (d.length / 28) > 0.01;
}

// Recorta los bordes transparentes
export function trim(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 12) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return c;
  if (x0 === 0 && y0 === 0 && x1 === width - 1 && y1 === height - 1) return c;
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(c, -x0, -y0);
  return out;
}

// Quita el fondo blanco o casi blanco que toca los bordes (típico de un JPG)
export function removeWhiteBg(src: HTMLCanvasElement) {
  const c = clone(src);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const w = c.width, h = c.height;
  const isBg = (i: number) => {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    return d[i + 3] > 0 && min > 215 && max - min < 30;
  };
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p]) continue;
    seen[p] = 1;
    if (!isBg(p * 4)) continue;
    d[p * 4 + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  ctx.putImageData(img, 0, 0);
  return trim(c);
}

export function clone(src: HTMLCanvasElement, maxSide?: number) {
  const s = maxSide ? Math.min(1, maxSide / Math.max(src.width, src.height)) : 1;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(src.width * s));
  c.height = Math.max(1, Math.round(src.height * s));
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

// Calidad de impresión según el tamaño real elegido
export function printQuality(pxWidth: number, cmWidth: number) {
  const dpi = pxWidth / (cmWidth / 2.54);
  if (dpi >= 150) return { level: "ok" as const, dpi };
  if (dpi >= 90) return { level: "fair" as const, dpi };
  return { level: "low" as const, dpi };
}

// ---------- Efectos por técnica (para la vista previa) ----------

const hex2rgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};

// Serigrafía: reduce la imagen a 1–4 tintas sólidas y bordes duros
export function quantize(src: HTMLCanvasElement, k: number) {
  const c = clone(src, 900);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const sample: number[][] = [];
  for (let i = 0; i < d.length; i += 4 * 5) if (d[i + 3] > 128) sample.push([d[i], d[i + 1], d[i + 2]]);
  if (!sample.length) return { canvas: c, palette: [] as string[] };
  // centros iniciales repartidos por brillo
  const sorted = [...sample].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centers = Array.from({ length: k }, (_, j) => sorted[Math.floor(((j + 0.5) / k) * (sorted.length - 1))].slice());
  for (let it = 0; it < 8; it++) {
    const sum = centers.map(() => [0, 0, 0, 0]);
    for (const p of sample) {
      let bi = 0, bd = Infinity;
      centers.forEach((cc, j) => {
        const dd = (p[0] - cc[0]) ** 2 + (p[1] - cc[1]) ** 2 + (p[2] - cc[2]) ** 2;
        if (dd < bd) { bd = dd; bi = j; }
      });
      sum[bi][0] += p[0]; sum[bi][1] += p[1]; sum[bi][2] += p[2]; sum[bi][3]++;
    }
    centers = centers.map((cc, j) => (sum[j][3] ? [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3]] : cc));
  }
  // Cada tinta toma un color que de verdad existe en el diseño (no una mezcla)
  centers = centers.map((cc) => {
    let best = sample[0], bd = Infinity;
    for (const p of sample) {
      const dd = (p[0] - cc[0]) ** 2 + (p[1] - cc[1]) ** 2 + (p[2] - cc[2]) ** 2;
      if (dd < bd) { bd = dd; best = p; }
    }
    return best.slice();
  });
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) { d[i + 3] = 0; continue; }
    let bi = 0, bd = Infinity;
    centers.forEach((cc, j) => {
      const dd = (d[i] - cc[0]) ** 2 + (d[i + 1] - cc[1]) ** 2 + (d[i + 2] - cc[2]) ** 2;
      if (dd < bd) { bd = dd; bi = j; }
    });
    d[i] = centers[bi][0]; d[i + 1] = centers[bi][1]; d[i + 2] = centers[bi][2]; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const palette = centers.map((cc) => "#" + cc.map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""));
  return { canvas: c, palette };
}

// Vinilo de corte: una sola silueta del color elegido
export function vinyl(src: HTMLCanvasElement, hex: string) {
  const c = clone(src, 900);
  const ctx = c.getContext("2d")!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const [r, g, b] = hex2rgb(hex);
  const useAlpha = hasTransparency(c);
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const on = useAlpha ? d[i + 3] > 128 : d[i + 3] > 128 && lum < 160;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = on ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Pedrería: la imagen se convierte en una grilla de piedritas con brillo
export function rhinestones(src: HTMLCanvasElement, stoneHex: string) {
  const base = clone(src, 900);
  const d = base.getContext("2d")!.getImageData(0, 0, base.width, base.height).data;
  const out = document.createElement("canvas");
  out.width = base.width;
  out.height = base.height;
  const ctx = out.getContext("2d")!;
  const cell = Math.max(8, Math.round(Math.max(base.width, base.height) / 38));
  const useAlpha = hasTransparency(base);
  for (let y = 0; y < base.height; y += cell) {
    const row = (y / cell) | 0;
    const off = row % 2 ? cell / 2 : 0;
    for (let x = off; x < base.width; x += cell) {
      let n = 0, on = 0, r = 0, g = 0, b = 0;
      for (let yy = y; yy < Math.min(base.height, y + cell); yy += 2)
        for (let xx = x | 0; xx < Math.min(base.width, x + cell); xx += 2) {
          const i = (yy * base.width + xx) * 4;
          n++;
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const visible = useAlpha ? d[i + 3] > 128 : d[i + 3] > 128 && lum < 200;
          if (visible) { on++; r += d[i]; g += d[i + 1]; b += d[i + 2]; }
        }
      if (!n || on / n < 0.35) continue;
      const [cr, cg, cb] = stoneHex ? hex2rgb(stoneHex) : [r / on, g / on, b / on];
      const cx = x + cell / 2, cy = y + cell / 2, rad = cell * 0.42;
      const grd = ctx.createRadialGradient(cx - rad * 0.3, cy - rad * 0.35, rad * 0.1, cx, cy, rad);
      grd.addColorStop(0, `rgb(${Math.min(255, cr + 110)},${Math.min(255, cg + 110)},${Math.min(255, cb + 110)})`);
      grd.addColorStop(0.55, `rgb(${cr},${cg},${cb})`);
      grd.addColorStop(1, `rgb(${cr * 0.55},${cg * 0.55},${cb * 0.55})`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.beginPath();
      ctx.arc(cx - rad * 0.35, cy - rad * 0.35, rad * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return out;
}

// ---------- Texto y diseños en stock ----------

export const FONTS = [
  { name: "Bloque", family: "Anton", weight: 400 },
  { name: "Urbana", family: "Permanent Marker", weight: 400 },
  { name: "Cursiva", family: "Pacifico", weight: 400 },
  { name: "Elegante", family: "Playfair Display", weight: 700 },
  { name: "Simple", family: "Archivo", weight: 800 },
];

export async function renderText(text: string, fontIdx: number, color: string, size = 160) {
  const f = FONTS[fontIdx] ?? FONTS[0];
  const font = `${f.weight} ${size}px "${f.family}"`;
  try {
    await document.fonts.load(font, text);
  } catch {}
  const lines = text.split("\n").slice(0, 3);
  const m = document.createElement("canvas").getContext("2d")!;
  m.font = font;
  const width = Math.max(...lines.map((l) => m.measureText(l || " ").width));
  const c = document.createElement("canvas");
  c.width = Math.ceil(width + size * 0.6);
  c.height = Math.ceil(lines.length * size * 1.25 + size * 0.5);
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, c.width / 2, size * 0.25 + size * 1.25 * (i + 0.5)));
  return trim(c);
}

export function svgToCanvas(svg: string, width = 1400): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.height / img.width || 1;
      const c = document.createElement("canvas");
      c.width = width;
      c.height = Math.round(width * ratio);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(trim(c));
    };
    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export function canvasBlob(c: HTMLCanvasElement, type: "image/png" | "image/jpeg", quality?: number) {
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), type, quality));
}

// Nombre corto y legible: "973692381954733633.jfif" pasa a "9736923…3633.jfif"
function shortName(n: string) {
  const clean = n.replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ]/g, "") || "imagen";
  const dot = clean.lastIndexOf(".");
  const base = dot > 0 ? clean.slice(0, dot) : clean;
  const ext = dot > 0 ? clean.slice(dot) : "";
  return base.length > 18 ? `${base.slice(0, 10)}…${base.slice(-4)}${ext}` : clean;
}
