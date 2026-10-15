import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WaFloat from "@/components/WaFloat";

export const metadata: Metadata = {
  title: "Baltica T-Shirts | Polos de algodón en Gamarra, por unidad y por mayor",
  description:
    "Polos y poleras de algodón confeccionados en Gamarra. Compra por unidad o por mayor, con estampado para empresas. Pedidos por WhatsApp y envíos a todo el Perú.",
  robots: { index: false, follow: false }, // demo: que Google no la indexe
};

export const viewport: Viewport = {
  themeColor: "#D7262F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <WaFloat />
        </CartProvider>
      </body>
    </html>
  );
}
