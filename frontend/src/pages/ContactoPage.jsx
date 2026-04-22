import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-base">

      {/* Hero banner */}
      <div className="bg-raised border-b border-border pt-16 pb-12 text-center px-6 relative overflow-hidden">
        <img src={logoImg} alt="SNEAK-OUT" className="h-24 mx-auto mb-6" />
        <h1 className="text-4xl font-black text-primary mb-4">Contáctanos</h1>
        <p className="text-secondary mt-3 text-base">
          ¿Dudas sobre un pedido, tallas o colaboraciones? Estamos aquí para ayudarte.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12">

        {/* Info cards */}
        <div>
          <h2 className="text-2xl font-black text-primary mb-6">Información de contacto</h2>

          {[
            { icon: '📍', title: 'Dirección',  lines: ['Calle Gran Vía 42', 'Madrid, 28013, España'] },
            { icon: '📞', title: 'Teléfono',   lines: ['+34 910 000 000'] },
            { icon: '✉️', title: 'Email',      lines: ['hola@sneakout.es', 'soporte@sneakout.es'] },
            { icon: '🕐', title: 'Horario',    lines: ['Lunes – Viernes: 9:00 – 20:00', 'Sábados: 10:00 – 15:00'] },
          ].map((item) => (
            <div key={item.title}
              className="flex gap-4 mb-5 p-5 bg-raised rounded-xl border border-border transition-colors duration-200 hover:border-accent cursor-default">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <p className="font-bold text-accent mb-1 text-[0.85rem]">{item.title}</p>
                {item.lines.map(l => <p key={l} className="text-secondary text-sm m-0">{l}</p>)}
              </div>
            </div>
          ))}

          {/* Social */}
          <div className="mt-4">
            <p className="font-bold text-muted mb-3 text-[0.85rem]">Síguenos</p>
            <div className="flex gap-3 flex-wrap">
              {['Instagram', 'TikTok', 'Twitter/X'].map(red => (
                <a key={red} href="#"
                  className="px-3.5 py-1.5 bg-raised border border-border rounded-full text-[0.8rem] text-secondary no-underline transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent">
                  {red}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="card p-10">
          <h2 className="text-2xl font-black text-primary mb-2">Envíanos un mensaje</h2>
          <p className="text-secondary text-sm mb-8">Responderemos en menos de 24 horas en días laborables.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre *</label>
                <input type="text" name="nombre" required value={form.nombre} onChange={handleChange}
                  placeholder="Tu nombre" className="input-field" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="tu@email.com" className="input-field" />
              </div>
            </div>

            <div>
              <label className="form-label">Asunto *</label>
              <input type="text" name="asunto" required value={form.asunto} onChange={handleChange}
                placeholder="¿En qué te podemos ayudar?" className="input-field" />
            </div>

            <div>
              <label className="form-label">Mensaje *</label>
              <textarea name="mensaje" required rows={5} value={form.mensaje} onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                className="input-field resize-y font-[inherit]" />
            </div>

            <button type="submit" disabled={sending}
              className={`btn-accent w-full py-3.5 text-sm tracking-wide ${sending ? 'opacity-80 cursor-not-allowed' : ''}`}>
              {sending ? 'Enviando...' : 'Enviar Mensaje →'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
