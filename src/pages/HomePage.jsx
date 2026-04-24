import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import MiniProductCard from '../components/MiniProductCard';
import Footer from '../components/Footer';
import ProductSlider from '../components/ProductSlider/ProductSlider';
import toast from 'react-hot-toast';

import { FunnelPlus } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // ── Filter state ──────────────────────────────────────────────────────
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceMax, setPriceMax] = useState(null); // null = sin límite
  const [sortBy, setSortBy] = useState('default');
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const section = searchParams.get('section') || '';
  const showFullCatalog = searchQuery || section === 'catalogo';

  useEffect(() => { fetchProducts(); }, [searchQuery]);

  // Resetear filtros al entrar al catálogo
  useEffect(() => {
    if (!showFullCatalog) {
      setSelectedBrands([]);
      setPriceMax(null);
      setSortBy('default');
    }
  }, [showFullCatalog]);

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

  // ── Derived values from products (no hardcode) ─────────────────────────
  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand).filter(Boolean));
    return [...set].sort();
  }, [products]);

  const catalogMaxPrice = useMemo(() => {
    if (!products.length) return 0;
    return Math.ceil(Math.max(...products.map(p => Number(p.price))));
  }, [products]);

  // Inicializar priceMax cuando llegan los productos por primera vez
  useEffect(() => {
    if (catalogMaxPrice > 0 && priceMax === null) {
      setPriceMax(catalogMaxPrice);
    }
  }, [catalogMaxPrice]);

  // ── Filtered + sorted list ─────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedBrands.length > 0)
      list = list.filter(p => selectedBrands.includes(p.brand));
    if (priceMax !== null)
      list = list.filter(p => Number(p.price) <= priceMax);
    if (sortBy === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === 'name_az') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name_za') list.sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [products, selectedBrands, priceMax, sortBy]);

  const activeFilterCount =
    selectedBrands.length +
    (priceMax !== null && priceMax < catalogMaxPrice ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0);

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceMax(catalogMaxPrice);
    setSortBy('default');
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // ── Filter panel (shared between desktop bar and mobile offcanvas) ─────
  const FilterPanel = () => (
    <div className='flex flex-col gap-6'>
      
      
      <div className="flex gap-6">


        {/* Marcas */}
        <div className="w-1/3">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Marca</p>
          <div className="flex flex-wrap gap-2">
            {brands.map(brand => (
              <button key={brand} onClick={() => toggleBrand(brand)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedBrands.includes(brand)
                  ? 'bg-accent text-white border-accent'
                  : 'bg-transparent text-secondary border-border hover:border-accent hover:text-accent'
                  } `}>
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div className="w-1/2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Precio máx.</p>
            <span className="text-sm font-black text-accent">{priceMax}€</span>
          </div>
          <input
            type="range"
            min={0}
            max={catalogMaxPrice}
            step={5}
            value={priceMax ?? catalogMaxPrice}
            onChange={e => setPriceMax(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>0€</span>
            <span>{catalogMaxPrice}€</span>
          </div>
        </div>

        {/* Ordenar */}
        <div className="w-1/4">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Ordenar por</p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="w-full bg-raised border border-border text-secondary text-sm rounded-lg px-3 py-2 outline-none focus:border-accent cursor-pointer">
            <option value="default">Relevancia</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_az">Nombre: A → Z</option>
            <option value="name_za">Nombre: Z → A</option>
          </select>
        </div>

      </div>
      {/* Limpiar */}
      <div className="flex items-center justify-between mb-6 mt-6 w-full">
        {activeFilterCount > 0 && (
          <button onClick={clearFilters}
            className="text-xs text-accent font-semibold bg-transparent border-none cursor-pointer hover:text-accent-hover transition-colors self-start">
            ✕ Limpiar filtros
          </button>
        )}
      </div>

    </div>

  );

  const trending = products.slice(0, 4);
  const newReleases = products.slice(2, 6);

  /* ── Full catalog / search view ── */
  if (showFullCatalog) {
    return (
      <div className="min-h-screen bg-base">
        <div className="section-container py-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-black text-primary">
                {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo Completo'}
              </h2>
              <p className="text-sm text-muted mt-1">
                {filteredProducts.length}
                {filteredProducts.length !== products.length && ` de ${products.length} `} productos
              </p>
            </div>
            <button onClick={() => navigate('/')}
              className="text-sm text-accent bg-transparent border-none cursor-pointer hover:text-accent-hover transition-colors">
              ← Volver al inicio
            </button>
          </div>

          {/* ── Desktop: horizontal filter bar ── */}
          {!loading && products.length > 0 && (
            <div className="hidden sm:block bg-raised border border-border rounded-2xl px-6 py-4 mb-8">
              <FilterPanel />
            </div>
          )}

          {/* ── Mobile: floating filter button ── */}
          {!loading && products.length > 0 && (
            <div className="sm:hidden fixed bottom-6 right-6 z-40">
              <button onClick={() => setOffcanvasOpen(true)}
                className="flex items-center gap-2 p-3 bg-accent text-white rounded-full shadow-xl font-bold">
                <FunnelPlus className='w-5 h-5' />
                {activeFilterCount > 0 && (
                  <span className="bg-white text-accent text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ── Mobile offcanvas ── */}
          {offcanvasOpen && (
            <>
              {/* Backdrop */}
              <div className="sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setOffcanvasOpen(false)} />
              {/* Panel */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-base rounded-t-3xl p-6 shadow-2xl"
                style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-primary">Filtros</h3>
                  <button onClick={() => setOffcanvasOpen(false)}
                    className="p-2 rounded-full bg-raised border border-border text-muted cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterPanel />
                <button onClick={() => setOffcanvasOpen(false)}
                  className="mt-6 w-full py-3 bg-accent text-white rounded-xl font-bold text-sm">
                  Ver {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-raised rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 text-muted">
              <p className="text-5xl mb-4">👟</p>
              <p className="text-lg mb-2">No hay zapatillas con estos filtros</p>
              <button onClick={clearFilters}
                className="text-sm text-accent font-semibold bg-transparent border-none cursor-pointer hover:text-accent-hover">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => <MiniProductCard key={p.id} product={p} />)}
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
