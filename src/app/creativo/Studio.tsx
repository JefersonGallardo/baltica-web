"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Tee, { bodyPath, neckPath } from "@/components/Tee";
import { WHOLESALE_FROM } from "@/lib/config";
import {
  LINES,
  STONES,
  TECHNIQUES,
  VINYL_COLORS,
  printArea,
  sidePrice,
  type Line,
  type Side,
  type Technique,
} from "@/lib/creative";
import { DESIGNS } from "@/lib/designs";
import {
  FONTS,
  MAX_FILE_MB,
  canvasBlob,
  clone,
  printQuality,
  quantize,
  readUpload,
  removeWhiteBg,
  renderText,
  rhinestones,
  svgToCanvas,
  vinyl,
} from "@/lib/imaging";
import { newCode, saveOrder } from "@/lib/orders";
import { getProduct, soles, type Color, type Shape } from "@/lib/products";
import { b, i, msg, siteUrl, waLink } from "@/lib/whatsapp";

type Layer = {
  id: string;
  side: Side;
  kind: "image" | "design" | "text";
  name: string;
  cx: number; // cm desde el centro del área
  cy: number;
  w: number; // ancho en cm
  aspect: number; // alto / ancho
  ver: number;
  px: number; // ancho real de la imagen, para medir la calidad de impresión
  transparent: boolean;
  bgRemoved?: boolean;
  design?: number;
  text?: { value: string; font: number; color: string };
};

const SIDE_LABEL: Record<Side, string> = { front: "Frente", back: "Espalda" };
const CHEST_UNITS: Record<Shape, number> = { tee: 112, fitted: 100, hoodie: 112 };
const AREA_TOP: Record<Side, number> = { front: 50, back: 40 };

let seq = 0;
const uid = () => `l${Date.now().toString(36)}${(seq++).toString(36)}`;

function geometry(shape: Shape, side: Side, area: { w: number; h: number; chest: number }) {
  const scale = CHEST_UNITS[shape] / area.chest; // unidades del dibujo por cm
  const top = AREA_TOP[side];
  const wU = Math.min(area.w * scale, CHEST_UNITS[shape] - 8);
  const hU = Math.min(area.h * scale, 200 - top);
  return { scale, top, wU, hU, wCm: wU / scale, hCm: hU / scale };
}

function clampLayer(l: Layer, g: { wCm: number; hCm: number }): Layer {
  const w = Math.max(2, Math.min(l.w, g.wCm, g.hCm / l.aspect));
  const h = w * l.aspect;
  const mx = (g.wCm - w) / 2;
  const my = (g.hCm - h) / 2;
  return { ...l, w, cx: Math.max(-mx, Math.min(mx, l.cx)), cy: Math.max(-my, Math.min(my, l.cy)) };
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

export default function Studio() {
  // Prenda
  const [line, setLine] = useState<Line>("varon");
  const [model, setModel] = useState(LINES.varon.models[0]);
  const product = getProduct(model)!;
  const [colorName, setColorName] = useState(product.colors[1]?.name ?? product.colors[0].name);
  const color: Color = product.colors.find((c) => c.name === colorName) ?? product.colors[0];
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);

  // Diseño
  const [side, setSide] = useState<Side>("front");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const sources = useRef(new Map<string, HTMLCanvasElement>());
  // Imagen original a resolución completa (solo las que sube el cliente)
  const originals = useRef(new Map<string, { canvas: HTMLCanvasElement; photo: boolean }>());
  const [tab, setTab] = useState<"subir" | "stock" | "texto">("subir");
  const [uploadMsg, setUploadMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("Tu texto");
  const [font, setFont] = useState(0);
  const [textColor, setTextColor] = useState("#FFFFFF");

  // Técnica
  const [tech, setTech] = useState<Technique>("transfer");
  const [inks, setInks] = useState(2);
  const [vinylHex, setVinylHex] = useState("#FFFFFF");
  const [stoneHex, setStoneHex] = useState("");
  const [views, setViews] = useState<Record<string, string>>({});
  const [palette, setPalette] = useState<string[]>([]);
  const viewCache = useRef(new Map<string, string>());

  // Final
  const [result, setResult] = useState<null | {
    code: string;
    image: string;
    msg: string;
    preview: File;
    designs: { file: File; url: string; label: string; px: string }[];
  }>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});

  const shape = product.shape;
  const area = printArea(line, LINES[line].sizes.some((s) => s.size === size) ? size : LINES[line].sizes[0].size);
  const geo = useMemo(
    () => ({ front: geometry(shape, "front", area), back: geometry(shape, "back", area) }),
    [shape, area.w, area.h, area.chest], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const g = geo[side];

  // Cargar las fuentes del texto solo en esta página
  useEffect(() => {
    const id = "studio-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Anton&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:wght@700&display=swap";
    document.head.appendChild(l);
  }, []);

  // Al cambiar de línea, modelo o talla, todo vuelve a caber dentro del área
  const changeLine = (l: Line) => {
    setLine(l);
    const m = LINES[l].models[0];
    setModel(m);
    const p = getProduct(m)!;
    setColorName(p.colors[1]?.name ?? p.colors[0].name);
    setSize(LINES[l].sizes[Math.min(1, LINES[l].sizes.length - 1)].size);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayers((ls) => ls.map((l) => clampLayer(l, geo[l.side])));
  }, [geo]);

  // ---------- Capas ----------
  const addLayer = (canvas: HTMLCanvasElement, kind: Layer["kind"], name: string, transparent: boolean, extra?: Partial<Layer>) => {
    const id = extra?.id ?? uid();
    sources.current.set(id, canvas);
    const aspect = canvas.height / canvas.width;
    const w = Math.min(g.wCm * 0.75, (g.hCm * 0.6) / aspect);
    const h = w * aspect;
    const layer = clampLayer(
      { id, side, kind, name, cx: 0, cy: -(g.hCm - h) / 2 + Math.min(4, (g.hCm - h) / 2), w, aspect, ver: 0, px: canvas.width, transparent, ...extra },
      g,
    );
    setLayers((ls) => [...ls, layer]);
    setSelected(id);
  };

  const patch = (id: string, p: Partial<Layer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? clampLayer({ ...l, ...p }, geo[l.side]) : l)));

  const removeLayer = (id: string) => {
    setLayers((ls) => ls.filter((l) => l.id !== id));
    sources.current.delete(id);
    originals.current.delete(id);
    if (selected === id) setSelected(null);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setUploadMsg(null);
    const r = await readUpload(file);
    setBusy(false);
    if (!r.ok) return setUploadMsg({ type: "error", text: r.error });
    const id = uid();
    originals.current.set(id, { canvas: r.full, photo: r.photo });
    addLayer(r.canvas, "image", r.name, r.transparent, { id });
    setUploadMsg({
      type: "ok",
      text: r.transparent
        ? "Imagen lista. Muévela y ajusta su tamaño sobre el polo."
        : "Imagen lista. Si tiene fondo blanco, puedes quitarlo abajo.",
    });
  };

  const addDesign = async (i: number) => {
    setBusy(true);
    const c = await svgToCanvas(DESIGNS[i].svg);
    setBusy(false);
    addLayer(c, "design", DESIGNS[i].name, true, { design: i });
  };

  const sel = layers.find((l) => l.id === selected) ?? null;

  const applyText = async () => {
    const value = text.trim();
    if (!value) return;
    const c = await renderText(value, font, textColor);
    if (sel && sel.kind === "text") {
      sources.current.set(sel.id, c);
      patch(sel.id, { aspect: c.height / c.width, px: c.width, ver: sel.ver + 1, name: value.slice(0, 24), text: { value, font, color: textColor } });
    } else {
      addLayer(c, "text", value.slice(0, 24), true, { text: { value, font, color: textColor } });
    }
  };

  const doRemoveBg = (l: Layer) => {
    const src = sources.current.get(l.id);
    if (!src) return;
    const out = removeWhiteBg(src);
    sources.current.set(l.id, out);
    patch(l.id, { aspect: out.height / out.width, px: out.width, ver: l.ver + 1, transparent: true, bgRemoved: true });
  };

  // ---------- Vista previa según la técnica ----------
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      const next: Record<string, string> = {};
      let pal: string[] = [];
      for (const l of layers) {
        const src = sources.current.get(l.id);
        if (!src) continue;
        const param = tech === "serigrafia" ? inks : tech === "vinilo" ? vinylHex : tech === "pedreria" ? stoneHex : "";
        const key = `${l.id}:${l.ver}:${tech}:${param}`;
        let url = viewCache.current.get(key);
        if (!url) {
          let out: HTMLCanvasElement;
          if (tech === "serigrafia") {
            const q = quantize(src, inks);
            out = q.canvas;
            viewCache.current.set(key + ":pal", q.palette.join(","));
          } else if (tech === "vinilo") out = vinyl(src, vinylHex);
          else if (tech === "pedreria") out = rhinestones(src, stoneHex);
          else out = clone(src, 1200);
          url = out.toDataURL("image/png");
          viewCache.current.set(key, url);
        }
        if (tech === "serigrafia" && !pal.length) pal = (viewCache.current.get(key + ":pal") || "").split(",").filter(Boolean);
        next[l.id] = url;
      }
      if (!cancelled) {
        setViews(next);
        setPalette(pal);
      }
    };
    const t = setTimeout(run, 30);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [layers, tech, inks, vinylHex, stoneHex]);

  // ---------- Arrastrar y escalar ----------
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<null | { id: string; mode: "move" | "size"; x: number; y: number; cx: number; cy: number; w: number; pxPerCm: number }>(null);

  const startDrag = (e: React.PointerEvent, l: Layer, mode: "move" | "size") => {
    e.stopPropagation();
    e.preventDefault();
    setSelected(l.id);
    const rect = overlayRef.current!.getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id: l.id, mode, x: e.clientX, y: e.clientY, cx: l.cx, cy: l.cy, w: l.w, pxPerCm: rect.width / g.wCm };
  };
  const onDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.x) / d.pxPerCm;
    const dy = (e.clientY - d.y) / d.pxPerCm;
    if (d.mode === "move") patch(d.id, { cx: d.cx + dx, cy: d.cy + dy });
    else patch(d.id, { w: Math.max(2, d.w + dx * 2) });
  };
  const endDrag = () => (dragRef.current = null);

  // ---------- Precios ----------
  const footprint = (s: Side) => {
    const ls = layers.filter((l) => l.side === s);
    if (!ls.length) return null;
    const x0 = Math.min(...ls.map((l) => l.cx - l.w / 2));
    const x1 = Math.max(...ls.map((l) => l.cx + l.w / 2));
    const y0 = Math.min(...ls.map((l) => l.cy - (l.w * l.aspect) / 2));
    const y1 = Math.max(...ls.map((l) => l.cy + (l.w * l.aspect) / 2));
    return { w: x1 - x0, h: y1 - y0 };
  };
  const fpFront = footprint("front");
  const fpBack = footprint("back");
  const prFront = sidePrice(tech, line, fpFront, inks);
  const prBack = sidePrice(tech, line, fpBack, inks);
  const wholesale = qty >= WHOLESALE_FROM;
  const garment = wholesale ? product.wholesale : product.price;
  const unit = garment + prFront.price + prBack.price;
  const total = unit * qty;
  const cm = (n: number) => n.toFixed(1).replace(".0", "");

  // ---------- Terminar ----------
  const finish = async () => {
    if (!layers.length) {
      setUploadMsg({ type: "error", text: "Agrega al menos una imagen, diseño o texto a tu polo." });
      return;
    }
    setBusy(true);
    const code = newCode();
    const W = 1600, H = 1060, TW = 640, k = TW / 200;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#F4F4F5";
    ctx.fillRect(0, 0, W, H);
    for (const [i, s] of (["front", "back"] as Side[]).entries()) {
      const ox = 120 + i * 720, oy = 70;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TW * 1.1}" viewBox="0 0 200 220"><path d="${bodyPath(shape, s === "back")}" fill="${color.hex}"/><path d="${neckPath(shape, s === "back")}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="5"/><path d="${bodyPath(shape, s === "back")}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.5"/></svg>`;
      const tee = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
      ctx.drawImage(tee, ox, oy, TW, TW * 1.1);
      const gg = geo[s];
      for (const l of layers.filter((x) => x.side === s)) {
        const url = views[l.id];
        if (!url) continue;
        const img = await loadImg(url);
        const wPx = l.w * gg.scale * k;
        const hPx = wPx * l.aspect;
        const cxPx = ox + (100 + l.cx * gg.scale) * k;
        const cyPx = oy + (gg.top + gg.hU / 2 + l.cy * gg.scale) * k;
        ctx.drawImage(img, cxPx - wPx / 2, cyPx - hPx / 2, wPx, hPx);
      }
      ctx.fillStyle = "#242424";
      ctx.font = "700 30px Archivo, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(SIDE_LABEL[s], ox + TW / 2, oy + TW * 1.1 + 40);
    }
    ctx.textAlign = "left";
    ctx.font = "800 36px Archivo, Arial, sans-serif";
    ctx.fillStyle = "#D7262F";
    ctx.fillText(`Pedido ${code}`, 60, H - 92);
    ctx.font = "500 26px Archivo, Arial, sans-serif";
    ctx.fillStyle = "#242424";
    ctx.fillText(
      `${product.name}, ${color.name}, talla ${size}, ${qty} ${qty === 1 ? "unidad" : "unidades"}. Estampado ${TECHNIQUES[tech].label}.`,
      60,
      H - 50,
    );
    const image = c.toDataURL("image/png");
    const blob = await canvasBlob(c, "image/png");

    const preview = new File([blob], `${code}-vista-previa.png`, { type: "image/png" });

    // ----- Datos del pedido -----
    const n = (s: Side) => layers.filter((l) => l.side === s).length;
    const techLabel = `${TECHNIQUES[tech].label}${tech === "serigrafia" ? ` a ${inks} colores` : tech === "vinilo" ? `, color ${VINYL_COLORS.find((v) => v.hex === vinylHex)?.name}` : tech === "pedreria" ? `, ${STONES.find((x) => x.hex === stoneHex)?.name.toLowerCase()}` : ""}`;
    const sideText = (s: Side, fp: ReturnType<typeof footprint>, pr: { price: number; label: string }) =>
      fp
        ? `${SIDE_LABEL[s]}: ${cm(fp.w)} × ${cm(fp.h)} cm (${pr.label}), ${n(s)} ${n(s) === 1 ? "elemento" : "elementos"}, ${soles(pr.price)}`
        : `${SIDE_LABEL[s]}: sin diseño`;
    const garmentLine = `${product.name} (${LINES[line].label}), ${color.name}, talla ${size}, ${qty} ${qty === 1 ? "unidad" : "unidades"}`;
    const detail = [garmentLine, `Estampado: ${techLabel}`, sideText("front", fpFront, prFront), sideText("back", fpBack, prBack)];
    const notes = layers
      .filter((l) => l.kind === "text" || l.bgRemoved)
      .map((l) =>
        l.kind === "text"
          ? `Texto en ${SIDE_LABEL[l.side].toLowerCase()}: "${l.text?.value}" (letra ${FONTS[l.text?.font ?? 0].name.toLowerCase()})`
          : `Quitar fondo blanco a "${l.name}" (${SIDE_LABEL[l.side].toLowerCase()})`,
      );

    // ----- Diseños del cliente, solos y en calidad original -----
    const designs = await buildDesignFiles(code);

    // ----- Mensaje de WhatsApp (sin emojis: WhatsApp Web los rompe en los enlaces) -----
    const msgText = msg(
      ["Hola Baltica, quiero este polo personalizado."],
      [b(`PEDIDO ${code}`)],
      [
        b("Prenda"),
        `${product.name} (${LINES[line].label})`,
        `Color: ${color.name}`,
        `Talla: ${size}`,
        `Cantidad: ${qty}`,
      ],
      [
        b(`Estampado: ${techLabel}`),
        `- ${sideText("front", fpFront, prFront)}`,
        `- ${sideText("back", fpBack, prBack)}`,
        ...notes.map((x) => `- ${x}`),
      ],
      [
        b(`Total referencial: ${soles(total)}`),
        i(`${qty > 1 ? `${qty} x ` : ""}polo ${soles(garment)} + estampado ${soles(prFront.price + prBack.price)}`),
      ],
      [
        b("Archivos"),
        "- Vista previa del polo",
        ...designs.map((d) => `- ${d.file.name} (diseño en calidad original, va como documento)`),
      ],
      [`Seguimiento: ${siteUrl(`/seguimiento/?codigo=${code}`)}`],
    );
    // eslint-disable-next-line react-hooks/purity
    saveOrder({ code, createdAt: Date.now(), step: 0, detail: [...detail, ...notes], total });
    setBusy(false);
    setSent({});
    setResult({ code, image, msg: msgText, preview, designs });
  };

  // Cada diseño del frente y la espalda, solo, en PNG (sin pérdida) a su resolución completa.
  const buildDesignFiles = async (code: string) => {
    const out: { file: File; url: string; label: string; px: string }[] = [];
    for (const s of ["front", "back"] as Side[]) {
      const ls = layers.filter((x) => x.side === s);
      for (const [k, l] of ls.entries()) {
        let src: HTMLCanvasElement | undefined;
        if (l.kind === "image") src = originals.current.get(l.id)?.canvas;
        else if (l.kind === "design" && l.design !== undefined) src = await svgToCanvas(DESIGNS[l.design].svg, 3000);
        else if (l.kind === "text" && l.text) src = await renderText(l.text.value, l.text.font, l.text.color, 480);
        src ??= sources.current.get(l.id);
        if (!src) continue;
        const blob = await canvasBlob(src, "image/png");
        const side = s === "front" ? "frente" : "espalda";
        const file = new File([blob], `${code}-${side}-${k + 1}.png`, { type: "image/png" });
        out.push({
          file,
          url: URL.createObjectURL(blob),
          label: `${SIDE_LABEL[s]}: ${l.kind === "text" ? `texto "${l.text?.value}"` : l.name}`,
          px: `${src.width} × ${src.height} px, ${blob.size > 1024 * 1024 ? `${(blob.size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(blob.size / 1024)} KB`}`,
        });
      }
    }
    return out;
  };

  // Paso 1: el mensaje y la vista previa (como foto: aquí la compresión no importa)
  const sharePreview = async () => {
    if (!result) return;
    const data = { files: [result.preview], text: result.msg };
    if (navigator.canShare?.(data)) {
      try {
        await navigator.share(data);
        setSent((x) => ({ ...x, preview: true }));
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    save(result.preview);
    window.open(waLink(result.msg), "_blank", "noopener");
    setSent((x) => ({ ...x, preview: true }));
  };
  const save = (f: File) => {
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };
  // Paso 2: cada diseño se guarda en el equipo para adjuntarlo como Documento
  const saveDesign = (k: number) => {
    if (!result) return;
    save(result.designs[k].file);
    setSent((x) => ({ ...x, [k]: true }));
  };

  const onSide = layers.filter((l) => l.side === side);
  const selQuality = sel && sel.kind === "image" ? printQuality(sel.px, sel.w) : null;

  return (
    <div className="studio wrap">
      {/* ---------- Vista previa ---------- */}
      <div className="studio-stage">
        <div className="stage-tabs" role="tablist" aria-label="Lado del polo">
          {(["front", "back"] as Side[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={side === s}
              className={`chip ${side === s ? "is-on" : ""}`}
              onClick={() => {
                setSide(s);
                setSelected(null);
              }}
            >
              {SIDE_LABEL[s]}
              {layers.some((l) => l.side === s) && <span className="dot" aria-label="con diseño" />}
            </button>
          ))}
        </div>

        <div className="stage" onPointerDown={() => setSelected(null)}>
          <div className="stage-inner">
          <Tee color={color} shape={shape} back={side === "back"} className="stage-tee" />
          <div
            ref={overlayRef}
            className="print-area"
            style={{
              left: `${((100 - g.wU / 2) / 200) * 100}%`,
              top: `${(g.top / 220) * 100}%`,
              width: `${(g.wU / 200) * 100}%`,
              height: `${(g.hU / 220) * 100}%`,
            }}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <span className="area-label">
              Área máx. {cm(g.wCm)} × {cm(g.hCm)} cm
            </span>
            {onSide.map((l) => (
              <div
                key={l.id}
                className={`layer ${selected === l.id ? "is-sel" : ""}`}
                style={{
                  left: `${(0.5 + l.cx / g.wCm) * 100}%`,
                  top: `${(0.5 + l.cy / g.hCm) * 100}%`,
                  width: `${(l.w / g.wCm) * 100}%`,
                }}
                onPointerDown={(e) => startDrag(e, l, "move")}
                onPointerMove={onDrag}
                onPointerUp={endDrag}
              >
                {views[l.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={views[l.id]} alt={l.name} draggable={false} />
                ) : (
                  <div className="layer-loading" style={{ aspectRatio: `1 / ${l.aspect}` }} />
                )}
                {selected === l.id && (
                  <span
                    className="handle"
                    aria-label="Cambiar tamaño"
                    onPointerDown={(e) => startDrag(e, l, "size")}
                    onPointerMove={onDrag}
                    onPointerUp={endDrag}
                  />
                )}
              </div>
            ))}
            {!onSide.length && <span className="area-empty">Tu diseño va aquí</span>}
          </div>
          </div>
        </div>
        <p className="hint center">
          Arrastra tu diseño para moverlo. Usa la esquina o el control de tamaño para agrandarlo.
        </p>
      </div>

      {/* ---------- Panel ---------- */}
      <div className="studio-panel">
        <section className="step">
          <h2>1. Tu polo</h2>
          <div className="filter-row" role="group" aria-label="Para quién">
            {(Object.keys(LINES) as Line[]).map((l) => (
              <button key={l} className={`chip ${line === l ? "is-on" : ""}`} aria-pressed={line === l} onClick={() => changeLine(l)}>
                {LINES[l].label}
              </button>
            ))}
          </div>
          <label className="field">
            Modelo
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                const p = getProduct(e.target.value)!;
                if (!p.colors.some((c) => c.name === colorName)) setColorName(p.colors[0].name);
              }}
            >
              {LINES[line].models.map((m) => (
                <option key={m} value={m}>
                  {getProduct(m)!.name} ({soles(getProduct(m)!.price)})
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>
              Color <b className="muted">{color.name}</b>
            </span>
            <div className="swatches swatches-lg">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  className="swatch"
                  aria-pressed={c.name === color.name}
                  aria-label={c.name}
                  title={c.name}
                  style={{ background: c.hex }}
                  onClick={() => setColorName(c.name)}
                />
              ))}
            </div>
          </div>
          <div className="field">
            <span>Talla</span>
            <div className="sizes">
              {LINES[line].sizes.map((s) => (
                <button key={s.size} className={`size ${size === s.size ? "is-on" : ""}`} aria-pressed={size === s.size} onClick={() => setSize(s.size)}>
                  {s.size}
                </button>
              ))}
            </div>
            <p className="hint">
              Pecho {area.chest} cm, largo {area.length} cm. El área de estampado se ajusta a la talla
              {line === "nino" ? " (hoja A4 para niños)." : " (hoja A3 para adultos)."}
            </p>
          </div>
          <label className="field">
            Cantidad
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </label>
        </section>

        <section className="step">
          <h2>2. Tu diseño en el {SIDE_LABEL[side].toLowerCase()}</h2>
          <div className="filter-row" role="tablist">
            {(
              [
                ["subir", "Subir imagen"],
                ["stock", "Diseños en stock"],
                ["texto", "Texto"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={`chip ${tab === k ? "is-on" : ""}`} onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </div>

          {tab === "subir" && (
            <div className="upload">
              <label
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFile(e.dataTransfer.files[0]);
                }}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    onFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <strong>{busy ? "Procesando…" : "Elige una imagen o arrástrala aquí"}</strong>
                <span>PNG, JPG o WEBP hasta {MAX_FILE_MB} MB. Mejor si es PNG sin fondo.</span>
              </label>
              <p className="secure">
                Tu imagen no se sube a internet: se revisa y se procesa solo en tu equipo. La enviarás tú por
                WhatsApp al terminar.
              </p>
            </div>
          )}

          {tab === "stock" && (
            <div className="designs">
              {DESIGNS.map((d, i) => (
                <button key={d.id} className="design" onClick={() => addDesign(i)} disabled={busy}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(d.svg)} alt="" />
                  <span>{d.name}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "texto" && (
            <div className="text-tool">
              <textarea value={text} rows={2} maxLength={60} onChange={(e) => setText(e.target.value)} aria-label="Tu texto" />
              <div className="filter-row" role="group" aria-label="Tipo de letra">
                {FONTS.map((f, i) => (
                  <button
                    key={f.family}
                    className={`chip ${font === i ? "is-on" : ""}`}
                    style={{ fontFamily: `"${f.family}", sans-serif`, fontWeight: f.weight }}
                    onClick={() => setFont(i)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="swatches swatches-lg" role="group" aria-label="Color del texto">
                {VINYL_COLORS.map((c) => (
                  <button key={c.hex} className="swatch" aria-pressed={textColor === c.hex} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => setTextColor(c.hex)} />
                ))}
              </div>
              <button className="btn btn-dark" onClick={applyText}>
                {sel?.kind === "text" ? "Actualizar texto" : "Agregar texto"}
              </button>
            </div>
          )}

          {uploadMsg && <p className={uploadMsg.type === "error" ? "error" : "ok-msg"}>{uploadMsg.text}</p>}

          {onSide.length > 0 && (
            <ul className="layers">
              {onSide.map((l) => (
                <li key={l.id} className={selected === l.id ? "is-sel" : ""}>
                  <button className="layer-name" onClick={() => setSelected(l.id)}>
                    {l.kind === "text" ? "Texto: " : l.kind === "design" ? "Diseño: " : "Imagen: "}
                    {l.name}
                  </button>
                  <span className="layer-size">
                    {cm(l.w)} × {cm(l.w * l.aspect)} cm
                  </span>
                  <button className="link-btn" onClick={() => removeLayer(l.id)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}

          {sel && sel.side === side && (
            <div className="layer-tools">
              <label className="field">
                Tamaño: {cm(sel.w)} × {cm(sel.w * sel.aspect)} cm
                <input
                  type="range"
                  min={3}
                  max={Math.floor(Math.min(g.wCm, g.hCm / sel.aspect) * 2) / 2}
                  step={0.5}
                  value={sel.w}
                  onChange={(e) => patch(sel.id, { w: Number(e.target.value) })}
                />
              </label>
              <div className="filter-row">
                <button className="chip" onClick={() => patch(sel.id, { cx: 0 })}>
                  Centrar
                </button>
                <button className="chip" onClick={() => patch(sel.id, { w: 9, cx: -g.wCm / 4, cy: -g.hCm / 2 })}>
                  Logo en el pecho
                </button>
                <button className="chip" onClick={() => patch(sel.id, { w: g.wCm, cx: 0, cy: -g.hCm })}>
                  Tamaño máximo
                </button>
                {sel.kind === "image" && !sel.transparent && (
                  <button className="chip" onClick={() => doRemoveBg(sel)}>
                    Quitar fondo blanco
                  </button>
                )}
              </div>
              {selQuality && (
                <p className={`quality q-${selQuality.level}`}>
                  {selQuality.level === "ok"
                    ? "Buena calidad para este tamaño."
                    : selQuality.level === "fair"
                      ? "Calidad aceptable. Si puedes, usa una imagen más grande."
                      : "La imagen puede verse pixelada a este tamaño. Achícala o usa una de mayor resolución."}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="step">
          <h2>3. Técnica de estampado</h2>
          <div className="techs">
            {(Object.keys(TECHNIQUES) as Technique[]).map((t) => (
              <button key={t} className={`tech ${tech === t ? "is-on" : ""}`} aria-pressed={tech === t} onClick={() => setTech(t)}>
                <strong>{TECHNIQUES[t].label}</strong>
                <span>{TECHNIQUES[t].short}</span>
              </button>
            ))}
          </div>
          <p className="hint">{TECHNIQUES[tech].note}</p>
          {tech === "serigrafia" && (
            <div className="field">
              <span>Número de colores</span>
              <div className="filter-row">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} className={`chip ${inks === n ? "is-on" : ""}`} aria-pressed={inks === n} onClick={() => setInks(n)}>
                    {n}
                  </button>
                ))}
                {palette.length > 0 && (
                  <span className="inks" aria-label="Tintas">
                    {palette.map((p) => (
                      <i key={p} style={{ background: p }} />
                    ))}
                  </span>
                )}
              </div>
              {qty < WHOLESALE_FROM && <p className="nudge">La serigrafía conviene desde {WHOLESALE_FROM} polos.</p>}
            </div>
          )}
          {tech === "vinilo" && (
            <div className="field">
              <span>Color del vinilo</span>
              <div className="swatches swatches-lg">
                {VINYL_COLORS.map((c) => (
                  <button key={c.hex} className="swatch" aria-pressed={vinylHex === c.hex} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => setVinylHex(c.hex)} />
                ))}
              </div>
            </div>
          )}
          {tech === "pedreria" && (
            <div className="field">
              <span>Tipo de piedra</span>
              <div className="filter-row">
                {STONES.map((s) => (
                  <button key={s.name} className={`chip ${stoneHex === s.hex ? "is-on" : ""}`} aria-pressed={stoneHex === s.hex} onClick={() => setStoneHex(s.hex)}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="step summary">
          <h2>Tu precio</h2>
          <dl>
            <div>
              <dt>Polo {wholesale ? "(por mayor)" : ""}</dt>
              <dd>{soles(garment)}</dd>
            </div>
            <div>
              <dt>
                Frente
                {fpFront && (
                  <small>
                    {cm(fpFront.w)} × {cm(fpFront.h)} cm, {prFront.label}
                  </small>
                )}
              </dt>
              <dd>{fpFront ? soles(prFront.price) : "Sin diseño"}</dd>
            </div>
            <div>
              <dt>
                Espalda
                {fpBack && (
                  <small>
                    {cm(fpBack.w)} × {cm(fpBack.h)} cm, {prBack.label}
                  </small>
                )}
              </dt>
              <dd>{fpBack ? soles(prBack.price) : "Sin diseño"}</dd>
            </div>
            <div className="sum-unit">
              <dt>Por polo</dt>
              <dd>{soles(unit)}</dd>
            </div>
            <div className="sum-total">
              <dt>
                {qty} {qty === 1 ? "polo" : "polos"}
              </dt>
              <dd>{soles(total)}</dd>
            </div>
          </dl>
          <button className="btn btn-yellow btn-block" onClick={finish} disabled={busy}>
            {busy ? "Preparando tu diseño…" : "Terminar y pedir por WhatsApp"}
          </button>
          <p className="hint center">Precio referencial. Te confirmamos el final por chat.</p>
        </section>
      </div>

      {result && (
        <div className="result-scrim" role="dialog" aria-modal="true" aria-label="Tu polo está listo">
          <div className="result">
            <div className="drawer-head">
              <h2>Tu polo está listo</h2>
              <button className="icon-btn" onClick={() => setResult(null)} aria-label="Cerrar">
                ✕
              </button>
            </div>
            <div className="result-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.image} alt="Vista de tu polo, frente y espalda" />
              <p>
                Tu código de pedido es <strong className="code">{result.code}</strong>. Guárdalo para ver el
                estado de tu pedido.
              </p>
              <ol className="send-steps">
                <li className={sent.preview ? "done" : ""}>
                  <strong>Envía tu pedido y la vista previa</strong>
                  <span>Se abre WhatsApp con el detalle de tu pedido. Elige el chat de Baltica.</span>
                  <button className="btn btn-wa btn-block" onClick={sharePreview}>
                    {sent.preview ? "Enviar de nuevo" : "Enviar pedido por WhatsApp"}
                  </button>
                  <a href={waLink(result.msg)} target="_blank" rel="noopener noreferrer" className="link-btn small">
                    ¿No aparece Baltica al compartir? Abre el chat directo
                  </a>
                </li>
                <li className={result.designs.every((_, k) => sent[k]) ? "done" : ""}>
                  <strong>Envía tu diseño en calidad original</strong>
                  <span>
                    Si lo mandas como foto, WhatsApp lo comprime. Guárdalo y adjúntalo como{" "}
                    <b>Documento</b>: llega intacto para estampar.
                  </span>
                  <ul className="design-files">
                    {result.designs.map((d, k) => (
                      <li key={d.file.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.url} alt="" />
                        <div>
                          <strong>{d.label}</strong>
                          <small>
                            {d.file.name}, {d.px}
                          </small>
                        </div>
                        <button className={`btn ${sent[k] ? "btn-outline" : "btn-dark"}`} onClick={() => saveDesign(k)}>
                          {sent[k] ? "Guardado" : "Guardar"}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <details className="howto">
                    <summary>¿Cómo se adjunta como Documento?</summary>
                    <ol>
                      <li>En el chat de Baltica toca el clip (Android) o el + (iPhone).</li>
                      <li>Elige <b>Documento</b>. No elijas Galería ni Fotos.</li>
                      <li>Busca el archivo en Descargas (Android) o en Archivos (iPhone) y envíalo.</li>
                      <li>En la computadora, arrastra el archivo al chat de WhatsApp Web y elige enviarlo como documento.</li>
                    </ol>
                  </details>
                </li>
                <li>
                  <strong>Te confirmamos el precio final y el pago</strong>
                  <span>Sigue tu pedido con tu código y agenda cuándo recogerlo.</span>
                </li>
              </ol>
              <div className="result-row">
                <button className="btn btn-outline" onClick={() => result && save(result.preview)}>
                  Guardar vista previa
                </button>
                <Link className="btn btn-outline" href={`/seguimiento/?codigo=${result.code}`}>
                  Ver seguimiento
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

