export default function Footer() {
  return (
    <footer className="bg-base border-t border-border mt-20">

      {/* Newsletter */}
      <div className="bg-raised py-14 text-center border-b border-border px-4">
        <h3 className="text-2xl font-black text-primary mb-2">
          Suscríbete y Obtén 10% Off
        </h3>
        <p className="text-muted text-sm mb-6">
          Recibe notificaciones de drops exclusivos y ofertas especiales
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="tu@email.com"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-accent px-5 py-2.5 text-sm">
            Suscribirse
          </button>
        </form>
      </div>

      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { title: 'Tienda',   links: ['Catálogo', 'Tendencias', 'Drops', 'Ofertas'] },
          { title: 'Ayuda',    links: ['Envíos', 'Devoluciones', 'Tallas', 'FAQ'] },
          { title: 'Nosotros', links: ['Historia', 'Tiendas', 'Contacto', 'Blog'] },
          { title: 'Legal',    links: ['Privacidad', 'Términos', 'Cookies', 'Aviso Legal'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-accent font-bold text-xs mb-4 tracking-[0.1em] uppercase">
              {col.title}
            </h4>
            <ul className="list-none flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="nav-link text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="border-t border-border px-6 py-6 text-center">
        <p className="text-secondary text-xs">
          © 2026 <span className="text-accent">SNEAK-OUT</span>. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
