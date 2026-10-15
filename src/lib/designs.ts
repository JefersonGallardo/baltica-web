// Diseños en stock de la demo (originales). En la versión final se reemplazan
// por los diseños que la tienda tiene listos para transfer.

const FONT = "Arial Black, Impact, Helvetica, sans-serif";

export const DESIGNS: { id: string; name: string; svg: string }[] = [
  {
    id: "gamarra",
    name: "Hecho en Gamarra",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <circle cx="200" cy="200" r="180" fill="none" stroke="#D7262F" stroke-width="14"/>
      <circle cx="200" cy="200" r="150" fill="none" stroke="#D7262F" stroke-width="4"/>
      <path id="a" d="M70 200 A130 130 0 0 1 330 200" fill="none"/>
      <text font-family="${FONT}" font-size="40" fill="#D7262F" letter-spacing="6"><textPath href="#a" startOffset="50%" text-anchor="middle">HECHO EN</textPath></text>
      <text x="200" y="228" font-family="${FONT}" font-size="50" fill="#1E1E1E" text-anchor="middle" textLength="250" lengthAdjust="spacingAndGlyphs">GAMARRA</text>
      <text x="200" y="285" font-family="${FONT}" font-size="26" fill="#D7262F" text-anchor="middle" letter-spacing="8">LIMA · PERÚ</text>
      <path d="M150 112 l10 -20 l10 20 l-20 -12 h20 z M230 112 l10 -20 l10 20 l-20 -12 h20 z" fill="#1E1E1E"/>
    </svg>`,
  },
  {
    id: "sol",
    name: "Sol de Lima",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <g fill="#F2A900">${Array.from({ length: 16 }, (_, i) => `<path d="M200 30 L214 110 L186 110 Z" transform="rotate(${i * 22.5} 200 180)"/>`).join("")}</g>
      <circle cx="200" cy="180" r="70" fill="#F2A900"/>
      <circle cx="200" cy="180" r="52" fill="#FFD23F"/>
      <rect x="40" y="290" width="320" height="76" rx="10" fill="#1E1E1E"/>
      <text x="200" y="350" font-family="${FONT}" font-size="58" fill="#FFFFFF" text-anchor="middle" letter-spacing="10">LIMA</text>
    </svg>`,
  },
  {
    id: "andes",
    name: "Andes",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="360" viewBox="0 0 400 360">
      <circle cx="270" cy="110" r="44" fill="#D7262F"/>
      <path d="M20 270 L120 120 L170 190 L230 90 L380 270 Z" fill="#1F2C4D"/>
      <path d="M120 120 L140 150 L125 148 L110 160 Z M230 90 L258 132 L238 126 L220 140 L214 114 Z" fill="#FFFFFF"/>
      <text x="200" y="335" font-family="${FONT}" font-size="58" fill="#1F2C4D" text-anchor="middle" letter-spacing="16">PERÚ</text>
    </svg>`,
  },
  {
    id: "promo",
    name: "Promo 2026",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="320" viewBox="0 0 420 320">
      <text x="210" y="120" font-family="${FONT}" font-size="104" fill="#FFFFFF" stroke="#1F2C4D" stroke-width="10" paint-order="stroke" text-anchor="middle" textLength="360" lengthAdjust="spacingAndGlyphs">PROMO</text>
      <text x="210" y="255" font-family="${FONT}" font-size="140" fill="#D7262F" stroke="#1F2C4D" stroke-width="10" paint-order="stroke" text-anchor="middle" textLength="300" lengthAdjust="spacingAndGlyphs">2026</text>
      <g fill="#F2A900"><path d="M40 160 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3z"/><path d="M380 160 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3z"/></g>
    </svg>`,
  },
  {
    id: "numero",
    name: "Camiseta 10",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="380" viewBox="0 0 320 380">
      <text x="160" y="64" font-family="${FONT}" font-size="40" fill="#1E1E1E" text-anchor="middle" textLength="280" lengthAdjust="spacingAndGlyphs">TU NOMBRE</text>
      <text x="160" y="350" font-family="${FONT}" font-size="290" fill="#D7262F" stroke="#1E1E1E" stroke-width="8" paint-order="stroke" text-anchor="middle">10</text>
    </svg>`,
  },
  {
    id: "corazon",
    name: "Corazón",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="380" viewBox="0 0 400 380">
      <path d="M200 340 C60 250 30 170 60 110 C90 50 170 50 200 110 C230 50 310 50 340 110 C370 170 340 250 200 340 Z" fill="#D7262F"/>
      <path d="M110 120 C120 95 145 90 160 100" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity=".7"/>
    </svg>`,
  },
];
