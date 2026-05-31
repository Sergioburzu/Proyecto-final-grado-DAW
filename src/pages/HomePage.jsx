import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import MiniProductCard from '../components/MiniProductCard';
import MiniProductCardSkeleton from '../components/MiniProductCardSkeleton';
import Footer from '../components/Footer';
import ProductSlider from '../components/ProductSlider/ProductSlider';
import toast from 'react-hot-toast';
import { PiSneakerBold } from "react-icons/pi";
import { AiFillThunderbolt } from "react-icons/ai";
import { FaFireFlameCurved } from "react-icons/fa6";
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // ── Filter state ──────────────────────────────────────────────────────
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceMax, setPriceMax] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);

  // Estado interno del modal (se aplica solo al confirmar)
  const [draftBrands, setDraftBrands] = useState([]);
  const [draftPrice, setDraftPrice] = useState(null);
  const [draftSort, setDraftSort] = useState('default');
  const rafRef = useRef(null);

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
      const productsData = res.data || [];

      // Preload images to ensure all sneakers render simultaneously
      const preloadPromises = productsData.map(product => {
        const { data: imgData } = supabase.storage
          .from('Images')
          .getPublicUrl(`${product.image_url}/0.png`);
        const imageUrl = imgData?.publicUrl;

        if (!imageUrl) return Promise.resolve();
        return new Promise((resolve) => {
          const img = new Image();
          img.src = imageUrl;
          img.onload = resolve;
          img.onerror = resolve; // resolve anyway to avoid blocking
        });
      });

      // Wait for all image assets to load (max 3s timeout) and ensure a minimum 800ms display for a smooth skeleton transition
      await Promise.all([
        Promise.race([
          Promise.all(preloadPromises),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);

      setProducts(productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //Derived values from products
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

  // Filtered + sorted list
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

  // Open modal: copy current state to draft
  const openFilter = () => {
    setDraftBrands([...selectedBrands]);
    setDraftPrice(priceMax ?? catalogMaxPrice);
    setDraftSort(sortBy);
    setFilterOpen(true);
  };

  // Apply draft to real state
  const applyFilters = () => {
    setSelectedBrands(draftBrands);
    setPriceMax(draftPrice);
    setSortBy(draftSort);
    setFilterOpen(false);
  };

  const toggleDraftBrand = (brand) => {
    setDraftBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Slider fluido con requestAnimationFrame
  const handleSliderChange = useCallback((e) => {
    const val = Number(e.target.value);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setDraftPrice(val));
  }, []);

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

          {/* ── Botón Filtros (desktop + móvil) ── */}
          {!loading && products.length > 0 && (
            <div className="flex items-center gap-3 mb-8">
              <button
                id="open-filter-modal"
                onClick={openFilter}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-raised text-secondary text-sm font-semibold cursor-pointer hover:border-accent hover:text-accent transition-all duration-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span
                    className="ml-1 flex items-center justify-center w-5 h-5 rounded-full text-white text-[0.65rem] font-black"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted bg-transparent border-none cursor-pointer hover:text-accent transition-colors"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* ── Modal de filtros ── */}
          {filterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                onClick={() => setFilterOpen(false)}
              />
              {/* Panel */}
              <div
                className="fixed z-50 top-1/2 left-1/2 w-[92vw] max-w-lg"
                style={{
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--color-surface, #fff)',
                  borderRadius: '1.25rem',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
                  padding: '2rem',
                }}
              >
                {/* Cabecera del modal */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-primary m-0">Filtros</h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1.5 rounded-lg border border-border bg-raised text-muted cursor-pointer hover:text-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── Marcas ── */}
                <p className="text-[0.7rem] font-bold text-muted uppercase tracking-widest mb-3">Marca</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {brands.map(brand => {
                    const active = draftBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => toggleDraftBrand(brand)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150"
                        style={{
                          background: active ? 'var(--color-primary)' : 'var(--color-raised)',
                          color: active ? '#fff' : 'var(--color-secondary)',
                          border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        }}
                      >
                        {active && <Check className="w-3 h-3" />}
                        {brand}
                      </button>
                    );
                  })}
                </div>

                {/* ── Precio máximo ── */}
                <p className="text-[0.7rem] font-bold text-muted uppercase tracking-widest mb-2">Precio máximo</p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted">0€</span>
                  <span
                    className="text-sm font-black px-2 py-0.5 rounded-lg"
                    style={{ color: 'var(--color-accent)', background: 'var(--color-raised)' }}
                  >
                    {draftPrice}€
                  </span>
                  <span className="text-xs text-muted">{catalogMaxPrice}€</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={catalogMaxPrice}
                  step={1}
                  value={draftPrice ?? catalogMaxPrice}
                  onChange={handleSliderChange}
                  className="w-full mb-6 cursor-pointer"
                  style={{ accentColor: 'var(--color-accent)' }}
                />

                {/* ── Ordenar por ── */}
                <p className="text-[0.7rem] font-bold text-muted uppercase tracking-widest mb-2">Ordenar por</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    { value: 'default',    label: 'Relevancia' },
                    { value: 'price_asc',  label: 'Precio ↑' },
                    { value: 'price_desc', label: 'Precio ↓' },
                    { value: 'name_az',    label: 'A → Z' },
                    { value: 'name_za',    label: 'Z → A' },
                  ].map(opt => {
                    const active = draftSort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDraftSort(opt.value)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150"
                        style={{
                          background: active ? 'var(--color-accent)' : 'var(--color-raised)',
                          color: active ? '#fff' : 'var(--color-secondary)',
                          border: active ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border)',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* ── Acciones ── */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDraftBrands([]); setDraftPrice(catalogMaxPrice); setDraftSort('default'); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border bg-transparent text-muted cursor-pointer hover:text-primary hover:border-primary transition-all"
                  >
                    Limpiar
                  </button>
                  <button
                    id="apply-filters-btn"
                    onClick={applyFilters}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white cursor-pointer transition-all"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    Ver {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <MiniProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 text-muted">
              <PiSneakerBold className='w-5 h-5' />
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

  /* Main view */
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
              <h2 className="text-[1.75rem] font-black text-primary m-0">En Tendencia <FaFireFlameCurved className='text-3xl text-accent inline-block ' /></h2>
              <p className="text-muted text-sm mt-1">Los drops mas buscados del momento.</p>
            </div>
            <Link to="/?section=catalogo"
              className="text-accent font-semibold text-sm no-underline hover:text-accent-hover transition-colors">
              Ver Todo →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <MiniProductCardSkeleton key={i} />
              ))}
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
              <h2 className="text-[1.75rem] font-black text-primary m-0">Nuevos Lanzamientos <AiFillThunderbolt className='text-3xl text-accent inline-block' /></h2>
              <p className="text-muted text-sm mt-1">Recién llegados. No te quedes sin el tuyo.</p>
            </div>
            <Link to="/?section=catalogo"
              className="text-accent font-semibold text-sm no-underline hover:text-accent-hover transition-colors">
              Ver Catálogo →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <MiniProductCardSkeleton key={i} />
              ))}
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
