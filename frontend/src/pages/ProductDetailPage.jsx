import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import MiniProductCard from '../components/MiniProductCard';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

// Formato de talla: el backend guarda "40,41,42,43" → array
function parseSizes(sizeStr) {
  if (!sizeStr) return [];
  return sizeStr.split(',').map((s) => s.trim()).filter(Boolean);
}

export default function ProductDetailPage() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const { addItem }       = useCart();

  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedSize, setSelected] = useState(null);
  const [activeThumb, setThumb]     = useState(0);

  useEffect(() => {
    setSelected(null);
    setThumb(0);
    window.scrollTo({ top: 0 });
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, allRes] = await Promise.all([
        getProduct(id),
        getProducts(),
      ]);
      setProduct(prodRes.data);
      // Related = other products (exclude current)
      setRelated(allRes.data.filter((p) => String(p.id) !== String(id)).slice(0, 4));
    } catch {
      toast.error('Producto no encontrado');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Selecciona una talla primero');
      return;
    }
    addItem({ ...product, selectedSize });
    toast.success(`${product.name} (talla ${selectedSize}) añadido al carrito 🛒`);
  };

  // Generate 3 pseudo-thumbnails from the same URL (dark/light variants via filter)
  const thumbStyles = [
    {},
    { filter: 'brightness(0.7)' },
    { filter: 'brightness(1.2) saturate(0.8)' },
  ];

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
            <div style={{ background: 'var(--bg-raised)', borderRadius: '1rem', aspectRatio: '1', animation: 'pulse 2s infinite', border: '1px solid #1f1f1f' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[80, 60, 40, 100, 50, 50].map((w, i) => (
                <div key={i} style={{ height: '1.5rem', width: `${w}%`, background: 'var(--bg-raised)', borderRadius: '0.5rem', animation: 'pulse 2s infinite' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const sizes = parseSizes(product.size);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* ── BREADCRUMB ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-muted)', fontSize: '0.875rem', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'color 0.2s, text-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ← Volver al Catálogo
        </button>
      </div>

      {/* ── PRODUCT LAYOUT ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

          {/* LEFT — Images */}
          <div>
            {/* Main image */}
            <div style={{
              background: 'var(--bg-raised)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              aspectRatio: '1',
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={product.image_url || 'https://via.placeholder.com/600'}
                alt={product.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  padding: '1.5rem',
                  boxSizing: 'border-box',
                  ...thumbStyles[activeThumb],
                  transition: 'filter 0.3s',
                }}
              />
            </div>
            {/* Thumbnails */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {thumbStyles.map((style, i) => (
                <button
                  key={i}
                  onClick={() => setThumb(i)}
                  style={{
                    padding: 0, border: 'none', cursor: 'pointer',
                    borderRadius: '0.75rem', overflow: 'hidden',
                    aspectRatio: '1',
                    background: 'var(--bg-raised)',
                    outline: activeThumb === i ? '2px solid var(--accent)' : '2px solid transparent',
                    outlineOffset: '2px',
                    transition: 'outline 0.1s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={product.image_url || 'https://via.placeholder.com/200'}
                    alt={`Vista ${i + 1}`}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      padding: '0.5rem',
                      boxSizing: 'border-box',
                      ...style,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div style={{ paddingTop: '0.5rem' }}>
            {/* Brand tag */}
            <p style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {product.brand}
            </p>

            {/* Name */}
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              {product.name}
            </h1>

            {/* Price */}
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              {Number(product.price).toFixed(2)}€
            </p>

            {/* Description */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2rem', borderBottom: '1px solid var(--color-border2)', paddingBottom: '1.5rem' }}>
              {product.description || 'Diseñadas para redefinir el lujo urbano. Una zapatilla premium con una estética de vanguardia. Perfectas para destacar en la ciudad con un estilo atrevido y una exclusividad inconfundible.'}
            </p>

            {/* Size selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Selecciona tu talla</p>
                <button style={{ color: 'var(--accent)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Guía de tallas
                </button>
              </div>
              {sizes.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelected(selectedSize === size ? null : size)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '0.6rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: selectedSize === size ? 'var(--accent)' : 'var(--bg-surface)',
                        color: selectedSize === size ? '#fff' : 'var(--text-secondary)',
                        border: selectedSize === size ? '2px solid var(--accent)' : '2px solid var(--color-border2)',
                        minWidth: '3.5rem',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Talla única</p>
              )}
            </div>

            {/* Stock badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', background: '#7f1d1d33', border: '1px solid #991b1b44', borderRadius: '0.5rem' }}>
                <p style={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600 }}>
                  ⚠️ Solo quedan {product.stock} unidades disponibles
                </p>
              </div>
            )}
            {product.stock === 0 && (
              <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', background: '#27272a', borderRadius: '0.5rem' }}>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 600 }}>Producto agotado</p>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                marginBottom: '0.75rem',
                transition: 'all 0.2s',
                background: selectedSize && product.stock > 0 ? 'var(--accent)' : 'var(--bg-raised)',
                color: selectedSize && product.stock > 0 ? '#fff' : 'var(--text-muted)',
                border: selectedSize && product.stock > 0 ? 'none' : '1px solid var(--color-border)',
                opacity: product.stock === 0 ? 0.5 : 1,
              }}
            >
              🛒 Añadir al Carrito
              {selectedSize && <span style={{ fontWeight: 400, fontSize: '0.85rem', opacity: 0.85 }}>— Talla {selectedSize}</span>}
            </button>

            {/* Favourites */}
            <button
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '2px solid var(--color-border)',
                transition: 'all 0.2s',
                marginBottom: '2rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              ♡ Añadir a Favoritos
            </button>

            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--color-border2)', paddingTop: '1.5rem' }}>
              {[
                { icon: '📦', title: 'Envío Gratis', desc: 'En compras superiores a 150€' },
                { icon: '🔄', title: 'Devoluciones Gratis', desc: '30 días para cambios y devoluciones' },
                { icon: '✅', title: 'Garantía Auténtica', desc: '100% originales verificados' },
              ].map((b) => (
                <div key={b.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <span style={{ fontSize: '1.25rem', marginTop: '0.1rem' }}>{b.icon}</span>
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{b.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAMBIÉN TE PUEDE GUSTAR ──────────────────────────────────────── */}
      {related.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-border2)', paddingTop: '3rem', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
              También Te Puede Gustar ⚡
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              {related.map((p) => (
                <MiniProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
