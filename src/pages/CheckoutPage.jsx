import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shipping_name: '', shipping_address: '',
    shipping_city: '', shipping_zip: '', shipping_phone: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('El carrito está vacío'); return; }
    setLoading(true);
    try {
      await createOrder({ ...form, items: items.map(i => ({ product_id: i.id, quantity: i.quantity })) });
      clearCart();
      toast.success('¡Pedido realizado con éxito! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pedido');
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center text-muted gap-4">
        <p className="text-6xl">🛒</p>
        <p className="text-xl font-semibold text-secondary">Tu carrito está vacío</p>
        <button onClick={() => navigate('/')} className="btn-accent px-6 py-3 text-sm mt-2">
          Ver catálogo →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-primary mb-2">Finalizar Compra</h1>
        <div className="h-0.5 w-20 bg-accent rounded mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Shipping form */}
          <div className="card p-8">
            <h2 className="text-xl font-bold text-primary mb-6">Datos de Envío</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Nombre completo" id="s-name">
                <input id="s-name" type="text" name="shipping_name" value={form.shipping_name}
                  onChange={handleChange} required placeholder="Nombre Apellido" className="input-field" />
              </Field>
              <Field label="Dirección" id="s-address">
                <input id="s-address" type="text" name="shipping_address" value={form.shipping_address}
                  onChange={handleChange} required placeholder="Calle, Número, Piso..." className="input-field" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ciudad" id="s-city">
                  <input id="s-city" type="text" name="shipping_city" value={form.shipping_city}
                    onChange={handleChange} required placeholder="Madrid" className="input-field" />
                </Field>
                <Field label="Código Postal" id="s-zip">
                  <input id="s-zip" type="text" name="shipping_zip" value={form.shipping_zip}
                    onChange={handleChange} required placeholder="28001" className="input-field" />
                </Field>
              </div>
              <Field label="Teléfono" id="s-phone">
                <input id="s-phone" type="tel" name="shipping_phone" value={form.shipping_phone}
                  onChange={handleChange} required placeholder="+34 600 000 000" className="input-field" />
              </Field>

              {/* Simulated payment */}
              <div className="mt-2 p-4 rounded-xl bg-raised border border-border">
                <p className="text-sm text-accent font-semibold mb-1">💳 Pago Simulado</p>
                <p className="text-xs text-secondary">Este es un proyecto académico. No se procesará ningún pago real.</p>
              </div>

              <button type="submit" disabled={loading}
                className={`btn-accent w-full py-4 text-base mt-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}>
                {loading ? 'Procesando pedido...' : `Confirmar Pedido · ${total.toFixed(2)}€ →`}
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div className="card p-8 h-fit">
            <h2 className="text-xl font-bold text-primary mb-6">Resumen del Pedido</h2>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate m-0">{item.name}</p>
                    <p className="text-xs text-muted mt-0.5 m-0">{item.brand} · x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-accent shrink-0">
                    {(item.price * item.quantity).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-secondary">Total</span>
              <span className="text-3xl font-black text-primary">{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
