import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--color-border)', marginTop: '5rem' }}>

      {/* Newsletter */}
      <div style={{
        background: 'var(--bg-raised)',
        padding: '3.5rem 1rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h3 style={{
          fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}>
          Suscríbete y Obtén 10% Off
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Recibe notificaciones de drops exclusivos y ofertas especiales
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', gap: '0.75rem', maxWidth: '28rem', margin: '0 auto' }}
        >
          <input
            type="email"
            placeholder="tu@email.com"
            style={{
              flex: 1, padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--bg-base)',
              border: '1px solid var(--color-border)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
          />
          <button
            type="submit"
            style={{
              padding: '0.625rem 1.25rem',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            Suscribirse
          </button>
        </form>
      </div>

      {/* Links */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
        {[
          { title: 'Tienda',    links: ['Catálogo', 'Tendencias', 'Drops', 'Ofertas'] },
          { title: 'Ayuda',     links: ['Envíos', 'Devoluciones', 'Tallas', 'FAQ'] },
          { title: 'Nosotros',  links: ['Historia', 'Tiendas', 'Contacto', 'Blog'] },
          { title: 'Legal',     links: ['Privacidad', 'Términos', 'Cookies', 'Aviso Legal'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 style={{
              color: 'var(--accent)', fontWeight: 700, fontSize: '0.75rem',
              marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {col.title}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { e.target.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          © 2026 <span style={{ color: 'var(--accent)' }}>SNEAK-OUT</span>. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
