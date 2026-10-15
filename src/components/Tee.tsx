import { useId } from "react";
import type { Color, Shape } from "@/lib/products";

// Ilustración vectorial de la prenda en el color elegido.
// En la versión final se reemplaza por fotos reales de cada color.

const BODY: Record<Shape, string> = {
  tee: "M70 22 Q100 40 130 22 L168 36 L196 80 L164 96 L156 84 L156 208 Q100 216 44 208 L44 84 L36 96 L4 80 L32 36 Z",
  fitted:
    "M74 24 Q100 40 126 24 L160 36 L186 76 L158 90 L150 82 Q140 140 152 208 Q100 216 48 208 Q60 140 50 82 L42 90 L14 76 L40 36 Z",
  hoodie:
    "M62 34 Q66 4 100 4 Q134 4 138 34 L172 46 Q192 92 196 186 L172 190 Q166 124 158 96 L158 206 Q100 212 42 206 L42 96 Q34 124 28 190 L4 186 Q8 92 28 46 Z",
};

export default function Tee({
  color,
  shape = "tee",
  className,
  title,
}: {
  color: Color;
  shape?: Shape;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const fill = color.melange ? `url(#m${id})` : color.hex;
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label={title ?? `Prenda color ${color.name}`}
    >
      <defs>
        <linearGradient id={`s${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".16" />
          <stop offset=".22" stopColor="#000" stopOpacity="0" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".07" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        {color.melange && (
          <pattern id={`m${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill={color.hex} />
            <circle cx="1.5" cy="1.5" r=".9" fill="#fff" opacity=".35" />
            <circle cx="4.5" cy="4" r=".8" fill="#000" opacity=".2" />
          </pattern>
        )}
      </defs>
      <path d={BODY[shape]} fill={fill} />
      <path d={BODY[shape]} fill={`url(#s${id})`} />
      {shape === "hoodie" ? (
        <>
          <path d="M76 38 Q100 12 124 38 Q100 56 76 38 Z" fill="#000" opacity=".28" />
          <path d="M92 50 L90 92 M108 50 L110 92" stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 146 L132 146 L144 186 L56 186 Z" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="2" />
        </>
      ) : (
        <path
          d={shape === "tee" ? "M70 22 Q100 48 130 22" : "M74 24 Q100 46 126 24"}
          fill="none"
          stroke="#000"
          strokeOpacity=".22"
          strokeWidth="5"
        />
      )}
      <path d={BODY[shape]} fill="none" stroke="#000" strokeOpacity=".16" strokeWidth="1.5" />
    </svg>
  );
}
