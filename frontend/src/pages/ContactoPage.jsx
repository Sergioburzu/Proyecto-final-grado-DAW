import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
      toast.success('¡Mensaje enviado! Te responderemos pronto.');
    }, 1200);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.625rem',
    border: '1.5px solid var(--color-border)',
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };
  const onFocusAccent = (e) => { e.target.style.borderColor = 'var(--accent)'; };
  const onBlurAccent  = (e) => { e.target.style.borderColor = 'var(--color-border)'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: 'var(--bg-raised)',
        borderBottom: '1px solid var(--color-border)',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img src={logoImg} alt="SNEAK-OUT" style={{
          height: '6rem', marginBottom: '1.5rem',
        }} />
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0,
        }}>
          Contáctanos
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1rem' }}>
          ¿Dudas sobre un pedido, tallas o colaboraciones? Estamos aquí para ayudarte.
        </p>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '3rem' }}>

        {/* Info */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Información de contacto
          </h2>

          {[
            { icon: '📍', title: 'Dirección',   lines: ['Calle Gran Vía 42', 'Madrid, 28013, España'] },
            { icon: '📞', title: 'Teléfono',    lines: ['+34 910 000 000'] },
            { icon: '✉️', title: 'Email',       lines: ['hola@sneakout.es', 'soporte@sneakout.es'] },
            { icon: '🕐', title: 'Horario',     lines: ['Lunes – Viernes: 9:00 – 20:00', 'Sábados: 10:00 – 15:00'] },
          ].map((item) => (
            <div key={item.title} style={{
              display: 'flex', gap: '1rem', marginBottom: '1.25rem',
              padding: '1.25rem', background: 'var(--bg-raised)',
              borderRadius: '0.75rem', border: '1px solid var(--color-border)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  {item.title}
                </p>
                {item.lines.map(l => (
                  <p key={l} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{l}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Redes sociales */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              Síguenos
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['Instagram', 'TikTok', 'Twitter/X'].map(red => (
                <a key={red} href="#" style={{
                  padding: '0.4rem 0.9rem',
                  background: 'var(--bg-raised)', border: '1px solid var(--color-border)',
                  borderRadius: '2rem', fontSize: '0.8rem',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.target.style.background = 'var(--bg-raised)'; e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--color-border)'; }}>
                  {red}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '1rem',
          border: '1px solid var(--color-border)',
          padding: '2.5rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Envíanos un mensaje
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Responderemos en menos de 24 horas en días laborables.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '0.4rem' }}>
                  Nombre *
                </label>
                <input
                  type="text" name="nombre" required
                  value={form.nombre} onChange={handleChange}
                  placeholder="Tu nombre"
                  style={inputStyle} onFocus={onFocusAccent} onBlur={onBlurAccent}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '0.4rem' }}>
                  Email *
                </label>
                <input
                  type="email" name="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="tu@email.com"
                  style={inputStyle} onFocus={onFocusAccent} onBlur={onBlurAccent}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '0.4rem' }}>
                Asunto *
              </label>
              <input
                type="text" name="asunto" required
                value={form.asunto} onChange={handleChange}
                placeholder="¿En qué te podemos ayudar?"
                style={inputStyle} onFocus={onFocusAccent} onBlur={onBlurAccent}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '0.4rem' }}>
                Mensaje *
              </label>
              <textarea
                name="mensaje" required rows={5}
                value={form.mensaje} onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={onFocusAccent} onBlur={onBlurAccent}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                padding: '0.875rem',
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.9rem',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: sending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = 'var(--accent-hover)'; } }}
              onMouseLeave={e => { if (!sending) { e.currentTarget.style.background = 'var(--accent)'; } }}
            >
              {sending ? 'Enviando...' : 'Enviar Mensaje →'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
