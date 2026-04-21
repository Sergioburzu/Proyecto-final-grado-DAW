import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

const inputCls = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  background: 'var(--bg-raised)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
};
const onFN = (e) => { e.target.style.borderColor = 'var(--accent)'; };
const onBN = (e) => { e.target.style.borderColor = 'var(--color-border)'; };

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
      const orderData = {
        ...form,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      };
      await createOrder(orderData);
      clearCart();
      toast.success('¡Pedido realizado con éxito! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</p>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Tu carrito está vacío</p>
        <button onClick={() => navigate('/')} style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--accent)', color: '#fff',
          fontWeight: 700, borderRadius: '0.75rem', border: 'none',
          cursor: 'pointer', fontSize: '0.9rem',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}>
          Ver catálogo →
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem',
        }}>
          Finalizar Compra
        </h1>
        <div style={{ height: '2px', width: '80px', background: 'var(--accent)', borderRadius: '1px', marginBottom: '2.5rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Shipping form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Datos de Envío
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>Nombre completo</label>
                <input id="s-name" type="text" name="shipping_name" value={form.shipping_name} onChange={handleChange} required placeholder="Nombre Apellido" style={inputCls} onFocus={onFN} onBlur={onBN} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>Dirección</label>
                <input id="s-address" type="text" name="shipping_address" value={form.shipping_address} onChange={handleChange} required placeholder="Calle, Número, Piso..." style={inputCls} onFocus={onFN} onBlur={onBN} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>Ciudad</label>
                  <input id="s-city" type="text" name="shipping_city" value={form.shipping_city} onChange={handleChange} required placeholder="Madrid" style={inputCls} onFocus={onFN} onBlur={onBN} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>Código Postal</label>
                  <input id="s-zip" type="text" name="shipping_zip" value={form.shipping_zip} onChange={handleChange} required placeholder="28001" style={inputCls} onFocus={onFN} onBlur={onBN} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>Teléfono</label>
                <input id="s-phone" type="tel" name="shipping_phone" value={form.shipping_phone} onChange={handleChange} required placeholder="+34 600 000 000" style={inputCls} onFocus={onFN} onBlur={onBN} />
              </div>

              {/* Payment info (simulated) */}
              <div style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '0.75rem', background: 'var(--bg-raised)', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.25rem' }}>💳 Pago Simulado</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Este es un proyecto académico. No se procesará ningún pago real.</p>
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '1rem',
                  background: 'var(--accent)',
                  color: '#fff', fontWeight: 900, fontSize: '1rem',
                  border: 'none', borderRadius: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '0.5rem', transition: 'all 0.2s',
                  opacity: loading ? 0.8 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--accent-hover)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'var(--accent)'; } }}
              >
                {loading ? 'Procesando pedido...' : `Confirmar Pedido · ${total.toFixed(2)}€ →`}
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '1.25rem', padding: '2rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Resumen del Pedido
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '20rem', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>{item.brand} · x{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {(item.price * item.quantity).toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total</span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
