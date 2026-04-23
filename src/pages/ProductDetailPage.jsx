import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import MiniProductCard from '../components/MiniProductCard';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

function parseSizes(sizeStr) {
  if (!sizeStr) return [];
  return sizeStr.split(',').map(s => s.trim()).filter(Boolean);
}

const thumbStyles = [
  {},
  { filter: 'brightness(0.7)' },
  { filter: 'brightness(1.2) saturate(0.8)' },
];

export default function ProductDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedSize, setSelected] = useState(null);
  const [activeThumb, setThumb]     = useState(0);

  useEffect(() => {
    setSelected(null); setThumb(0);
    window.scrollTo({ top: 0 });
    (async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([getProduct(id), getProducts()]);
        setProduct(prodRes.data);
        setRelated(allRes.data.filter(p => String(p.id) !== String(id)).slice(0, 4));
      } catch { toast.error('Producto no encontrado'); navigate('/'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Selecciona una talla primero'); return; }
    addItem({ ...product, selectedSize });
    toast.success(`${product.name} (talla ${selectedSize}) añadido al carrito 🛒`);
  };

  if (loading) {
    return (
      <div className="bg-base min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-raised rounded-2xl aspect-square animate-pulse border border-border" />
            <div className="flex flex-col gap-4">
              {[80, 60, 40, 100, 50, 50].map((w, i) => (
                <div key={i} className="h-6 bg-raised rounded-lg animate-pulse" style={{ width: `${w}%` }} />
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
    <div className="bg-base min-h-screen">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted text-sm bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-accent">
          ← Volver al Catálogo
        </button>
      </div>

      {/* Product layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* Images */}
          <div>
            <div className="bg-raised rounded-2xl overflow-hidden aspect-square mb-4 border border-border flex items-center justify-center">
              {/* filter is dynamic (activeThumb) so style is needed */}
              <img src={product.image_url || 'https://via.placeholder.com/600'} alt={product.name}
                className="w-full h-full object-contain p-6 transition-[filter] duration-300"
                style={thumbStyles[activeThumb]} />
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {thumbStyles.map((style, i) => (
                <button key={i} onClick={() => setThumb(i)}
                  className="p-0 border-none cursor-pointer rounded-xl overflow-hidden aspect-square bg-raised flex items-center justify-center transition-all duration-100"
                  style={{ outline: activeThumb === i ? '2px solid var(--color-accent)' : '2px solid transparent', outlineOffset: '2px' }}>
                  <img src={product.image_url || 'https://via.placeholder.com/200'} alt={`Vista ${i + 1}`}
                    className="w-full h-full object-contain p-2" style={style} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pt-2">
            <p className="text-accent text-xs font-bold tracking-[0.1em] uppercase mb-2">{product.brand}</p>
            <h1 className="text-4xl font-black text-primary leading-tight mb-3">{product.name}</h1>
            <p className="text-[1.75rem] font-black text-primary mb-5">{Number(product.price).toFixed(2)}€</p>

            <p className="text-secondary text-sm leading-[1.75] mb-8 border-b border-border2 pb-6">
              {product.description || 'Diseñadas para redefinir el lujo urbano. Una zapatilla premium con una estética de vanguardia.'}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-primary font-bold text-sm">Selecciona tu talla</p>
                <button className="text-accent text-[0.8rem] bg-transparent border-none cursor-pointer underline">
                  Guía de tallas
                </button>
              </div>
              {sizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button key={size} onClick={() => setSelected(selectedSize === size ? null : size)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150 min-w-[3.5rem]"
                      /* bg, color, border vary with selectedSize → style required */
                      style={{
                        background: selectedSize === size ? 'var(--color-accent)' : 'var(--color-surface)',
                        color: selectedSize === size ? '#fff' : 'var(--color-secondary)',
                        border: selectedSize === size ? '2px solid var(--color-accent)' : '2px solid var(--color-border2)',
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">Talla única</p>
              )}
            </div>

            {/* Stock badges */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="mb-4 px-4 py-2.5 bg-red-900/20 border border-red-900/30 rounded-lg">
                <p className="text-red-300 text-[0.8rem] font-semibold m-0">⚠️ Solo quedan {product.stock} unidades</p>
              </div>
            )}
            {product.stock === 0 && (
              <div className="mb-4 px-4 py-2.5 bg-zinc-800 rounded-lg">
                <p className="text-gray-400 text-[0.8rem] font-semibold m-0">Producto agotado</p>
              </div>
            )}

            {/* Add to cart */}
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="w-full py-4 rounded-xl text-base font-black flex items-center justify-center gap-2 mb-3 transition-all duration-200"
              style={{
                background: selectedSize && product.stock > 0 ? 'var(--color-accent)' : 'var(--color-raised)',
                color: selectedSize && product.stock > 0 ? '#fff' : 'var(--color-muted)',
                border: selectedSize && product.stock > 0 ? 'none' : '1px solid var(--color-border)',
                opacity: product.stock === 0 ? 0.5 : 1,
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              }}>
              🛒 Añadir al Carrito
              {selectedSize && <span className="font-normal text-[0.85rem] opacity-85">— Talla {selectedSize}</span>}
            </button>

            {/* Favourites */}
            <button className="btn-outline w-full py-3.5 text-sm font-bold mb-8">
              ♡ Añadir a Favoritos
            </button>

            {/* Benefits */}
            <div className="flex flex-col gap-4 border-t border-border2 pt-6">
              {[
                { icon: '📦', title: 'Envío Gratis', desc: 'En compras superiores a 150€' },
                { icon: '🔄', title: 'Devoluciones Gratis', desc: '30 días para cambios y devoluciones' },
                { icon: '✅', title: 'Garantía Auténtica', desc: '100% originales verificados' },
              ].map(b => (
                <div key={b.title} className="flex items-start gap-3.5">
                  <span className="text-xl mt-0.5">{b.icon}</span>
                  <div>
                    <p className="text-primary font-bold text-sm m-0">{b.title}</p>
                    <p className="text-muted text-[0.8rem] mt-0.5 m-0">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="border-t border-border2 pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-[1.75rem] font-black text-primary mb-7">También Te Puede Gustar ⚡</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map(p => <MiniProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
