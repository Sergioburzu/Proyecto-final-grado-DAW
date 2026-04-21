import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, addItem, removeItem, removeProduct, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar');
      navigate('/login');
      onClose();
      return;
    }
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 40 }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0,
        height: '100%', width: '100%', maxWidth: '28rem',
        background: 'var(--bg-base)',
        borderLeft: '1px solid var(--color-border)',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isOpen ? '-8px 0 40px rgba(255,106,0,0.08)' : 'none',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Tu Carrito
            {items.length > 0 && (
              <span style={{
                marginLeft: '0.5rem', fontSize: '0.75rem',
                background: 'var(--accent)', color: '#000',
                padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 700,
                boxShadow: '0 0 8px rgba(255,106,0,0.5)',
              }}>
                {items.length}
              </span>
            )}
          </h2>
          <button onClick={onClose} style={{
            padding: '0.5rem', borderRadius: '50%',
            background: 'var(--bg-surface)', border: '1px solid var(--color-border)',
            cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.1rem', height: '1.1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '4rem', height: '4rem', marginBottom: '1rem', opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{
                display: 'flex', gap: '0.75rem',
                background: 'var(--bg-surface)', borderRadius: '0.75rem',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <img
                  src={item.image_url ? `${BASE_URL}${item.image_url}` : 'https://via.placeholder.com/80'}
                  alt={item.name}
                  style={{ width: '4rem', height: '4rem', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.brand}</p>
                  <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {(item.price * item.quantity).toFixed(2)}€
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <button onClick={() => addItem(item)} style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    fontSize: '0.875rem', cursor: 'pointer', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>+</button>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.quantity}</span>
                  <button onClick={() => removeItem(item.id)} style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                    background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--color-border)',
                    fontSize: '0.875rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>−</button>
                </div>
                <button onClick={() => removeProduct(item.id)} style={{
                  alignSelf: 'flex-start', padding: '0.25rem', background: 'none', border: 'none',
                  color: '#444', cursor: 'pointer', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#444'}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{total.toFixed(2)}€</span>
            </div>
            <button
              onClick={handleCheckout}
              style={{
                width: '100%', padding: '0.875rem',
                background: 'var(--accent)', color: '#fff',
                fontWeight: 900, fontSize: '1rem',
                border: 'none', borderRadius: '0.75rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
            >
              Finalizar Compra →
            </button>
            <button
              onClick={clearCart}
              style={{
                width: '100%', padding: '0.5rem',
                background: 'none', border: 'none',
                fontSize: '0.8rem', color: '#444',
                cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#444'}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
