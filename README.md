# Baltica T-Shirts: propuesta de rediseño

Demo de la nueva tienda web de [Baltica T-Shirts](https://www.polosbaltica.com/), polos y poleras de Gamarra. Hecha en Next.js como sitio estático, lista para publicarse gratis en GitHub Pages.

## Qué incluye

- **Portada nueva**: un colgador con todos los colores de la tienda, lo más pedido, categorías, banda de mayoristas y cómo comprar.
- **Tienda con filtros**: por categoría (hombre, dama, niño, niña), color y talla, con precios siempre visibles. Los filtros quedan en el enlace, así se pueden compartir (ej. `/tienda/?cat=dama&color=Negro`).
- **Ficha de producto**: un solo producto con todos sus colores (hoy cada color es un producto aparte), guía de tallas, cantidad y aviso de cuánto falta para el precio por mayor.
- **Pedido por WhatsApp**: el carrito arma el mensaje con modelo, color, talla, cantidad, precio y total. Desde 12 prendas del mismo modelo se aplica solo el precio por mayor.
- **Por mayor y empresas**: cotizador con modelo, cantidad, tipo de estampado (serigrafía o DTF), ubicaciones y fecha, que envía la cotización por WhatsApp. Incluye la tabla de precios por cantidad.

- **Creativo (diseña tu polo)**: el cliente sube su imagen, elige un diseño en stock o escribe un texto, en frente y espalda. El área de estampado se ajusta a la talla (A3 adultos, A4 niños) y la vista previa cambia según la técnica: transfer, DTF, serigrafía (1 a 4 tintas), vinilo de corte (un color) y pedrería. Calcula el precio por técnica y tamaño, genera la imagen del polo y un código de pedido, y lo envía por WhatsApp.
- **Seguimiento**: línea de estados del pedido y agenda de recojo.

### Seguridad al subir imágenes

- Solo se aceptan PNG, JPG y WEBP, revisando los bytes reales del archivo (no solo la extensión). Se rechazan SVG y otros formatos que pueden llevar código.
- Máximo 10 MB y mínimo 200 px por lado.
- La imagen se redibuja en un canvas: se descartan metadatos y cualquier cosa que no sean píxeles.
- El archivo **nunca se sube a un servidor**: se procesa en el navegador del cliente y él mismo lo envía por WhatsApp.

### Límites de la demo

- Los pedidos y su seguimiento se guardan solo en el dispositivo del cliente. La versión real necesita una base de datos y un panel para que la tienda cambie los estados (por ejemplo con Supabase o Firebase).

## Antes de mostrarla

- **Precios**: son referenciales. Se cambian en `src/lib/products.ts` (precio por unidad y por mayor de cada modelo).
- **Costos de estampado**: en `src/app/mayoristas/Quote.tsx`.
- **Medidas de la guía de tallas**: en `src/components/SizeGuide.tsx`.
- **Medidas por talla, hojas y precios de estampado del Creativo**: en `src/lib/creative.ts`.
- **Diseños en stock**: en `src/lib/designs.ts`.
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
