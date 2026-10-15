import Link from "next/link";
import { STORE } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="wordmark wordmark-light">
            BALTICA<span>T-Shirts · Gamarra</span>
          </p>
          <p className="footer-text">
            Confeccionamos polos y poleras en nuestro taller de Gamarra. Vendemos por unidad, por
            mayor y con estampado para empresas.
          </p>
        </div>
        <div>
          <h3>Visítanos</h3>
          <p>
            {STORE.address}
            <br />
            {STORE.stores}
            <br />
            {STORE.district}
          </p>
        </div>
        <div>
          <h3>Escríbenos</h3>
          <p>
            <a href={waLink("Hola Baltica, tengo una consulta.")} target="_blank" rel="noopener noreferrer">
              WhatsApp {STORE.phoneLabel}
            </a>
            <br />
            <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
          </p>
          <p className="socials">
            <a href={STORE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={STORE.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href={STORE.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
          </p>
        </div>
        <div>
          <h3>Tienda</h3>
          <p className="footer-links">
            <Link href="/tienda/">Todos los productos</Link>
            <Link href="/mayoristas/">Por mayor y empresas</Link>
            <Link href="/tienda/?cat=ninos">Niños y niñas</Link>
            <a href="https://www.polosbaltica.com/libro-de-reclamaciones/">Libro de reclamaciones</a>
          </p>
        </div>
      </div>
      <div className="wrap footer-bottom">© 2026 Baltica T-Shirts</div>
    </footer>
  );
}
