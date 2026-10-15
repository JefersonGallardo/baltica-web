// Prefijo de rutas cuando el sitio vive en un subdirectorio (GitHub Pages).
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Datos de contacto de la tienda. Cambia aquí y se actualiza en todo el sitio.
export const STORE = {
  name: "Baltica T-Shirts",
  // Número que recibe los pedidos por WhatsApp (código de país sin "+").
  // PRUEBAS: número de Jeferson. Antes de presentar, volver a "51983525777" y "983 525 777".
  whatsapp: "51953071648",
  phoneLabel: "953 071 648",
  email: "ventas@polosbaltica.com",
  address: "Jr. Gamarra 789, Galería Santa Rosa",
  stores: "Tiendas 122, 135 y 137",
  district: "La Victoria, Lima",
  instagram: "https://www.instagram.com/polosbaltica/",
  facebook: "https://www.facebook.com/Baltica.TShirts/",
  tiktok: "https://www.tiktok.com/@balticatpolos",
};

// Desde cuántas unidades por modelo se aplica el precio por mayor.
export const WHOLESALE_FROM = 12;
