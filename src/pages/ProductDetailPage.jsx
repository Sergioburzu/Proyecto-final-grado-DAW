import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProducts, checkIsFavorite, addFavorite, removeFavorite } from '../services/api';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MiniProductCard from '../components/MiniProductCard';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from "react-icons/fi";
import { BsBox2 } from "react-icons/bs";
import { TfiReload } from "react-icons/tfi";
import { FaCheck } from "react-icons/fa";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { HiOutlineShoppingCart } from "react-icons/hi";
import { Heart } from 'lucide-react';
import SizeGuideModal from '../components/SizeGuideModal';

function parseSizes(sizeStr) {
  if (!sizeStr) return [];
  return sizeStr.split(',').map(s => s.trim()).filter(Boolean);
}

const STORAGE_BUCKET  = 'Images';
const IMAGE_COUNT     = 3;

export default function ProductDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { addItem } = useCart();
  const { user }    = useAuth();

  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedSize, setSelected] = useState(null);
  const [activeThumb, setThumb]     = useState(0);
  const [isFav, setIsFav]           = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    setSelected(null); setThumb(0);
    window.scrollTo({ top: 0 });
    (async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([getProduct(id), getProducts()]);
        const currentProduct = prodRes.data;
        const relatedData = allRes.data.filter(p => String(p.id) !== String(id)).slice(0, 4);

        // Preload detail images and related product thumbnail images
        const preloadUrls = [];
        if (currentProduct) {
          for (let i = 0; i < IMAGE_COUNT; i++) {
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${currentProduct.image_url}/${i}.png`);
            if (data?.publicUrl) preloadUrls.push(data.publicUrl);
          }
        }
        relatedData.forEach(p => {
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(`${p.image_url}/0.png`);
          if (data?.publicUrl) preloadUrls.push(data.publicUrl);
        });

        const preloadPromises = preloadUrls.map(url => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve; // resolve anyway to avoid hanging
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

        setProduct(currentProduct);
        setRelated(relatedData);
        
        if (user) {
          const fav = await checkIsFavorite(id);
          setIsFav(fav);
        } else {
          setIsFav(false);
        }
      } catch (err) {
        console.error(err);
        toast.error('Producto no encontrado');
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(id);
        setIsFav(false);
        toast.success('Eliminado de favoritos');
      } else {
        await addFavorite(id);
        setIsFav(true);
        toast.success('Añadido a favoritos');
      }
    } catch (err) {
      toast.error('Error al actualizar favoritos');
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Selecciona una talla primero'); return; }
    addItem({ ...product, selectedSize });
    toast.success(`${product.name} (talla ${selectedSize}) añadido al carrito`);
  };

  if (loading) {
    return (
      <SkeletonTheme baseColor="var(--color-raised)" highlightColor="var(--color-base)">
        <div className="bg-base min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Product Image skeleton */}
              <div className="relative rounded-2xl aspect-square overflow-hidden border border-border flex items-center justify-center">
                <Skeleton height="100%" containerClassName="w-full h-full block leading-none" />
              </div>
              {/* Product Info skeleton */}
              <div className="flex flex-col gap-4 pt-2">
                <Skeleton height={14} width="15%" borderRadius="0.375rem" />
                <Skeleton height={32} width="60%" borderRadius="0.375rem" />
                <Skeleton height={28} width="25%" borderRadius="0.375rem" />
                <div className="my-2">
                  <Skeleton count={3} height={16} width="100%" borderRadius="0.375rem" />
                </div>
                <div className="mt-4">
                  <Skeleton height={48} width="100%" borderRadius="0.75rem" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!product) return null;
  const sizes = parseSizes(product.size);

  const images = Array.from({ length: IMAGE_COUNT }, (_, i) => {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${product.image_url}/${i}.png`);
    return data.publicUrl;
  });

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
              <img
                src={images[activeThumb]}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-opacity duration-300"
              />
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, i) => (
                <button key={i} onClick={() => setThumb(i)}
                  className="p-0 border-none cursor-pointer rounded-xl overflow-hidden aspect-square bg-raised flex items-center justify-center transition-all duration-100"
                  style={{ outline: activeThumb === i ? '2px solid var(--color-accent)' : '2px solid transparent', outlineOffset: '2px' }}>
                  <img src={url} alt={`Vista ${i + 1}`}
                    className="w-full h-full object-contain p-2" />
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
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-accent text-[0.8rem] bg-transparent border-none cursor-pointer underline hover:text-accent-hover transition-colors"
                >
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
                <p className="text-red-300 text-[0.8rem] font-semibold m-0"><FiAlertTriangle className="mr-2 text-yellow-400 inline-block" /> Solo quedan {product.stock} unidades</p>
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
              <HiOutlineShoppingCart className="w-5 h-5" /> Añadir al Carrito
              {selectedSize && <span className="font-normal text-[0.85rem] opacity-85">— Talla {selectedSize}</span>}
            </button>

            {/* Favourites */}
            <button onClick={handleToggleFavorite} disabled={favLoading}
              className={`btn-outline w-full py-3.5 text-sm font-bold mb-8 transition-colors flex items-center justify-center gap-2 ${isFav ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300' : ''}`}>
              {favLoading ? (
                '...'
              ) : (
                <>
                  <Heart className={`w-5 h-5 transition-colors duration-200 ${isFav ? 'fill-red-600 text-red-600' : 'text-current'}`} />
                  {isFav ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                </>
              )}
            </button>

            {/* Benefits */}
            <div className="flex flex-col gap-4 border-t border-border2 pt-6">
              {[
                { icon: <BsBox2 className='text-accent' size={25} />, title: 'Envío Gratis', desc: 'En compras superiores a 150€' },
                { icon: <TfiReload className='text-accent' size={25} />, title: 'Devoluciones Gratis', desc: '30 días para cambios y devoluciones' },
                { icon: <FaCheck className='text-accent' size={25} />, title: 'Garantía Auténtica', desc: '100% originales verificados' },
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
            <h2 className="text-[1.75rem] font-black text-primary mb-7">También Te Puede Gustar </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map(p => <MiniProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} productSizes={sizes} />
      <Footer />
    </div>
  );
}
