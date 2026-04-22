import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './ProductSlider.css';

/* ─── Skeleton ── */
function SliderSkeleton() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 p-12 overflow-hidden"
      style={{ minHeight: 'calc(100vh - 72px)', background: 'linear-gradient(135deg,#3a0d10 0%,#1a0608 50%,#000 100%)' }}>
      <div className="ps-skeleton w-3/5 h-20 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="ps-skeleton w-4/5 h-20 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="flex justify-between w-full max-w-3xl mt-8">
        <div className="ps-skeleton w-28 h-14 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="ps-skeleton w-24 h-9 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>
    </div>
  );
}

/* ─── Stars ── */
function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="ps-star">{i < 5 ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

/* ─── Main ── */
export default function ProductSlider() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textClass, setTextClass] = useState('');
  const [imgClass, setImgClass] = useState('');

  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    supabase.from('products').select('id,name,description,price,image_url,slide_image_url').limit(5)
      .then(({ data, error }) => { if (!error && data) setProducts(data); setLoading(false); });
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const navigate_slide = useCallback((dir) => {
    if (isAnimating || products.length < 2) return;
    setIsAnimating(true);
    setTextClass(dir === 'next' ? 'ps-text-exit-left' : 'ps-text-exit-right');
    setImgClass(dir === 'next' ? 'ps-img-exit-right' : 'ps-img-exit-left');

    timerRef.current = setTimeout(() => {
      setCurrent(p => dir === 'next' ? (p + 1) % products.length : (p - 1 + products.length) % products.length);
      setTextClass(dir === 'next' ? 'ps-text-enter-right' : 'ps-text-enter-left');
      setImgClass(dir === 'next' ? 'ps-img-enter-left' : 'ps-img-enter-right');
      timerRef.current = setTimeout(() => { setTextClass(''); setImgClass(''); setIsAnimating(false); }, 620);
    }, 620);
  }, [isAnimating, products.length]);

  const handleBuyNow = () => {
    const p = products[current];
    if (!p) return;
    addItem(p);
    toast.success(`${p.name} añadido al carrito`);
  };

  if (loading) return <SliderSkeleton />;
  if (!products.length) return null;
  const product = products[current];

  return (
    <section
      className="ps-mount relative w-full overflow-hidden flex flex-col justify-center items-center "
      aria-label="Slider de productos destacados"
      style={{ minHeight: 'calc(100vh - 72px)', background: 'linear-gradient(135deg,#4a1118 0%,#2a080c 40%,#0d0000 75%,#000 100%)' }}
    >
      {/* Ambient glow */}
      <div aria-hidden="true" className="absolute pointer-events-none z-0"
        style={{ top: '20%', left: '35%', width: '600px', height: '450px', background: 'radial-gradient(ellipse,rgba(114,28,36,0.4) 0%,transparent 70%)' }} />

      {/* IMAGE LAYER — z-[1] behind text */}
      <div className={`${imgClass} absolute inset-0 z-[1] flex items-center justify-center pointer-events-none`}>
        <img
          key={product.id}
          src={product.slide_image_url}
          alt={product.name}
          className="ps-float object-contain select-none block"
          style={{ width: 'min(65%, 560px)', filter: 'drop-shadow(0 30px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(114,28,36,0.4))' }}
        />
        <div className="ps-shadow absolute rounded-full"
          style={{ bottom: '60px', left: '50%', width: '320px', height: '24px', background: 'rgba(0,0,0,0.5)', filter: 'blur(16px)' }} />
      </div>

      {/* TEXT LAYER — z-[2] on top */}
      <div className={`${textClass} relative z-[2] flex-1 flex flex-col justify-center items-center pointer-events-none p-6 md:p-10 max-w-[65%]`}
        style={{ minHeight: 'min(540px, 60vw)' }}>

        {/* Name wrapper — flex-1 centres the title vertically in the remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <h2 className="ps-name text-white text-center uppercase font-black leading-none tracking-tight w-full"
            style={{ fontSize: 'clamp(2rem, 5vw, 6rem)', textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
            {product.name}
          </h2>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end pointer-events-auto gap-3 w-full">
          {/* Left: price + stars + description */}
          <div className="flex flex-col gap-1.5 w-full md:max-w-[45%]">
            <span className="text-3xl font-black md:text-4xl text-white tracking-tight">
              {Number(product.price).toFixed(2)}€
            </span>
            <Stars />
            {product.description && (
              <p className="text-sm md:text-base text-white/50 leading-relaxed font-mono m-0">
                {product.description.length > 60 ? product.description.slice(0, 60) + '…' : product.description}
              </p>
            )}
          </div>
          {/* BUY NOW */}
          <button id={`ps-buy-${product.id}`} className="ps-buy-btn w-full md:w-auto text-center" onClick={handleBuyNow}
            aria-label={`Añadir ${product.name} al carrito`}>
            COMPRAR
          </button>
        </div>

      </div>

      {/* Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-6 z-[3] pointer-events-none">
        <button id="ps-prev" className="ps-arrow pointer-events-auto" onClick={() => navigate_slide('prev')} disabled={isAnimating} aria-label="Anterior">‹</button>
        <button id="ps-next" className="ps-arrow pointer-events-auto" onClick={() => navigate_slide('next')} disabled={isAnimating} aria-label="Siguiente">›</button>
      </div>

      {/* Dots */}
      {/* Mobile info row pinned to bottom 
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 items-center z-[3]">
        {products.slice(0, Math.min(products.length, 10)).map((_, i) => (
          <div key={i} id={`ps-dot-${i}`}
            className={`ps-dot${i === current ? ' active' : ''}`}
            style={{ width: i === current ? '20px' : '6px' }}
            onClick={() => !isAnimating && i !== current && navigate_slide(i > current ? 'next' : 'prev')}
            role="button" aria-label={`Ir al producto ${i + 1}`} tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate_slide(i > current ? 'next' : 'prev')} />
        ))}
      </div>
*/}
    </section>

  );
}
