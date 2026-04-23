import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import MiniProductCard from '../components/MiniProductCard';
import Footer from '../components/Footer';
import ProductSlider from '../components/ProductSlider/ProductSlider';
import toast from 'react-hot-toast';

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

  const trending    = products.slice(0, 4);
  const newReleases = products.slice(2, 6);
  const showFullCatalog = searchQuery || section === 'catalogo';

  /* ── Full catalog / search view ── */
  if (showFullCatalog) {
    return (
      <div className="min-h-screen bg-base">
        <div className="section-container py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-primary">
                {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo Completo'}
              </h2>
              <p className="text-sm text-muted mt-1">{products.length} productos</p>
            </div>
            <button onClick={() => navigate('/')}
              className="text-sm text-accent bg-transparent border-none cursor-pointer hover:text-accent-hover transition-colors">
              ← Volver al inicio
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-raised rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 text-muted">
              <p className="text-5xl mb-4">👟</p>
              <p className="text-lg">No se encontraron zapatillas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => <MiniProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Main view ── */
  return (
    <div className="min-h-screen bg-base">

      {/* Hero Slider */}
      <ProductSlider />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-8" />

      {/* En Tendencia */}
      <div className="py-12">
        <div className="section-container">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-[1.75rem] font-black text-primary m-0">En Tendencia 🔥</h2>
              <p className="text-muted text-sm mt-1">Los drops más calientes del momento.</p>
            </div>
            <Link to="/?section=catalogo"
              className="text-accent font-semibold text-sm no-underline hover:text-accent-hover transition-colors">
              Ver Todo →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-raised rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {trending.map((p) => <MiniProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border2 to-transparent mx-8" />

      {/* Nuevos Lanzamientos */}
      <div className="py-12">
        <div className="section-container">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-[1.75rem] font-black text-primary m-0">Nuevos Lanzamientos ⚡</h2>
              <p className="text-muted text-sm mt-1">Recién llegados. No te quedes sin el tuyo.</p>
            </div>
            <Link to="/?section=catalogo"
              className="text-accent font-semibold text-sm no-underline hover:text-accent-hover transition-colors">
              Ver Catálogo →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-raised rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {newReleases.map((p) => <MiniProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
