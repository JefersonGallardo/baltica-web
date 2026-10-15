# Baltica T-Shirts: propuesta de rediseño

Demo de la nueva tienda web de [Baltica T-Shirts](https://www.polosbaltica.com/), polos y poleras de Gamarra. Hecha en Next.js como sitio estático, lista para publicarse gratis en GitHub Pages.

## Qué incluye

- **Portada nueva**: un colgador con todos los colores de la tienda, lo más pedido, categorías, banda de mayoristas y cómo comprar.
- **Tienda con filtros**: por categoría (hombre, dama, niño, niña), color y talla, con precios siempre visibles. Los filtros quedan en el enlace, así se pueden compartir (ej. `/tienda/?cat=dama&color=Negro`).
- **Ficha de producto**: un solo producto con todos sus colores (hoy cada color es un producto aparte), guía de tallas, cantidad y aviso de cuánto falta para el precio por mayor.
- **Pedido por WhatsApp**: el carrito arma el mensaje con modelo, color, talla, cantidad, precio y total. Desde 12 prendas del mismo modelo se aplica solo el precio por mayor.
- **Por mayor y empresas**: cotizador con modelo, cantidad, tipo de estampado (serigrafía o DTF), ubicaciones y fecha, que envía la cotización por WhatsApp. Incluye la tabla de precios por cantidad.

## Antes de mostrarla

- **Precios**: son referenciales. Se cambian en `src/lib/products.ts` (precio por unidad y por mayor de cada modelo).
- **Costos de estampado**: en `src/app/mayoristas/Quote.tsx`.
- **Medidas de la guía de tallas**: en `src/components/SizeGuide.tsx`.
- **WhatsApp, dirección y redes**: en `src/lib/config.ts`.
- **Fotos**: la demo usa ilustraciones de cada prenda en su color. En la versión final van fotos reales de cada modelo y color.

## Correr en tu computadora

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `baltica-web`), sin README.
2. En esta carpeta:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/baltica-web.git
   git push -u origin main
   ```
3. En el repositorio, ve a **Settings → Pages** y en **Source** elige **GitHub Actions**.
4. Espera a que termine la acción "Publicar en GitHub Pages" (pestaña **Actions**). La demo queda en `https://TU-USUARIO.github.io/baltica-web/`.

Cada vez que hagas `git push` a `main`, la página se vuelve a publicar sola.

## Estructura

```
src/
  app/
    page.tsx               Portada
    tienda/                Catálogo con filtros
    producto/[slug]/       Ficha de producto
    mayoristas/            Por mayor, cotizador y tabla de precios
    globals.css            Estilos y colores de la marca
  components/              Header, carrito, tarjetas, ilustración de prenda, etc.
  lib/
    config.ts              Datos de contacto
    products.ts            Catálogo y precios
    whatsapp.ts            Enlaces de WhatsApp
```
