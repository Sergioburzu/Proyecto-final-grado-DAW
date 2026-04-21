import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import MiniProductCard from '../components/MiniProductCard';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

function Container({ children, className = '' }) {
  return (
    <div
      className={className}
      style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();
  const { addItem }             = useCart();

  const searchQuery = searchParams.get('search') || '';
  const section     = searchParams.get('section') || '';

  useEffect(() => { fetchProducts(); }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const res = await getProducts(params);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [heroIndex, setHeroIndex] = useState(0);
  const featured    = products[heroIndex] || null;
  const trending    = products.slice(0, 4);
  const newReleases = products.slice(2, 6);

  const showFullCatalog = searchQuery || section === 'catalogo';




  const goPrev = () => setHeroIndex(i => (i - 1 + products.length) % products.length);
  const goNext = () => setHeroIndex(i => (i + 1) % products.length);

  const handleAddFeatured = () => {
    if (!featured) return;
    addItem(featured);
    toast.success(`${featured.name} añadido al carrito`);
  };

  // ─── Catálogo completo / búsqueda ─────────────────────────────────────
  if (showFullCatalog) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Container className="py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo Completo'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{products.length} productos</p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                fontSize: '0.875rem', color: 'var(--accent)',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
            >
              ← Volver al inicio
            </button>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'var(--bg-raised)', borderRadius: '0.75rem', animation: 'pulse 2s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>👟</p>
              <p style={{ fontSize: '1.125rem' }}>No se encontraron zapatillas</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {products.map((p) => <MiniProductCard key={p.id} product={p} />)}
            </div>
          )}
        </Container>
        <Footer />
      </div>
    );
  }

  // ─── Vista principal ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem', position: 'relative' }}>
        {/* Background ambient subtle glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '35%',
          transform: 'translate(-50%,-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, var(--accent-glow2) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <Container>
          {loading || !featured ? (
            <div style={{ width: '100%', height: '320px', background: 'var(--bg-raised)', borderRadius: '0.5rem' }} />
          ) : (
            <div style={{
              position: 'relative', width: '100%',
              display: 'flex', minHeight: '340px', alignItems: 'center', zIndex: 1,
            }}>
              {/* Left: text */}
              <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10 }}>
                <span style={{
                  display: 'inline-block', marginBottom: '1rem',
                  padding: '0.25rem 0.75rem',
                  background: 'var(--accent)',
                  color: '#000',
                  fontSize: '0.7rem', fontWeight: 900,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  borderRadius: '0.25rem', width: 'fit-content',
                }}>
                  ⚡ Nuevo Lanzamiento
                </span>
                <h1 style={{
                  fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)',
                  lineHeight: 1.1, marginBottom: '0.75rem',
                }}>
                  {featured.name}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '320px', lineHeight: 1.6 }}>
                  {featured.description || 'Perfectas para destacar en la ciudad con un estilo atrevido y una exclusividad inconfundible.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <button
                    onClick={handleAddFeatured}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.75rem',
                      background: 'var(--accent)', color: '#000',
                      fontWeight: 900, fontSize: '0.9rem',
                      borderRadius: '0.5rem', border: 'none',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Comprar Ahora →
                  </button>
                  <span style={{
                    fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)',
                  }}>
                    {Number(featured.price).toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Right: CSS-animated sneaker */}
              <div
                style={{
                  width: '420px', flexShrink: 0,
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'visible',
                }}
              >
                {/* Left gradient fade */}
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                  background: 'linear-gradient(to right, var(--bg-base) 0%, transparent 30%)',
                }} />

                {/* Sneaker + shadow — key forces CSS animation restart on product change */}
                <div
                  key={heroIndex}
                  style={{
                    position: 'relative', zIndex: 2,
                    animation: 'heroEntrance 0.6s cubic-bezier(0.34, 1.4, 0.64, 1) forwards',
                  }}
                >
                  <img
                    src={featured.image_url || 'https://via.placeholder.com/320'}
                    alt={featured.name}
                    style={{
                      width: '300px', display: 'block',
                      objectFit: 'contain', pointerEvents: 'none', userSelect: 'none',
                      filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.12))',
                      animation: 'sneakerFloat 3.5s ease-in-out infinite 0.5s',
                    }}
                  />
                  {/* Animated shadow */}
                  <div style={{
                    position: 'absolute', bottom: '-16px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '200px', height: '16px',
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: '50%', filter: 'blur(10px)',
                    animation: 'shadowFloat 3.5s ease-in-out infinite 0.5s',
                  }} />
                </div>

                {/* Arrow Prev */}
                <button
                  onClick={goPrev}
                  style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', zIndex: 10,
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--accent)', borderRadius: '50%',
                    width: '38px', height: '38px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1.2rem',
                    backdropFilter: 'blur(6px)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  aria-label="Anterior"
                >‹</button>

                {/* Arrow Next */}
                <button
                  onClick={goNext}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', zIndex: 10,
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--accent)', borderRadius: '50%',
                    width: '38px', height: '38px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1.2rem',
                    backdropFilter: 'blur(6px)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  aria-label="Siguiente"
                >›</button>

                {/* Dot indicator */}
                <div style={{
                  position: 'absolute', bottom: '8px', left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', gap: '5px', zIndex: 10,
                }}>
                  {products.slice(0, Math.min(products.length, 8)).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      style={{
                        width: i === heroIndex ? '18px' : '6px',
                        height: '6px', borderRadius: '3px',
                        background: i === heroIndex ? 'var(--accent)' : 'var(--color-border2)',
                        cursor: 'pointer', transition: 'all 0.3s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* ── Divider neón ─────────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--color-border), transparent)', margin: '0 2rem' }} />

      {/* ── EN TENDENCIA ──────────────────────────────────────────────────── */}
      <div style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                En Tendencia 🔥
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Los drops más calientes del momento.</p>
            </div>
            <Link
              to="/?section=catalogo"
              style={{
                color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-hover)'}
              onMouseLeave={e => e.target.style.color = 'var(--accent)'}
            >
              Ver Todo →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'var(--bg-raised)', borderRadius: '0.75rem' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {trending.map((p) => <MiniProductCard key={p.id} product={p} />)}
            </div>
          )}
        </Container>
      </div>

      {/* ── Divider neón ─────────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--color-border2), transparent)', margin: '0 2rem' }} />

      {/* ── NUEVOS LANZAMIENTOS ───────────────────────────────────────────── */}
      <div style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Nuevos Lanzamientos ⚡
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Recién llegados. No te quedes sin el tuyo.</p>
            </div>
            <Link
              to="/?section=catalogo"
              style={{
                color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--accent-hover)'}
              onMouseLeave={e => e.target.style.color = 'var(--accent)'}
            >
              Ver Catálogo →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'var(--bg-raised)', borderRadius: '0.75rem' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {newReleases.map((p) => <MiniProductCard key={p.id} product={p} />)}
            </div>
          )}
        </Container>
      </div>

      <Footer />
    </div>
  );
}
