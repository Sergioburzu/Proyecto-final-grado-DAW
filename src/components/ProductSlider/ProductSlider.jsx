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

/* ─── Shared title style ── */
/*
const titleStyle = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 'clamp(2rem, 5vw, 6rem)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  lineHeight: 1.05,
  textAlign: 'center',
  width: '60%',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};
*/
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
    supabase
      .from('products')
      .select('id,name,description,price,image_url,slide_image_url')
      .limit(5)
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const navigate_slide = useCallback((dir) => {
    if (isAnimating || products.length < 2) return;
    setIsAnimating(true);
    setTextClass(dir === 'next' ? 'ps-text-exit-left' : 'ps-text-exit-right');
    setImgClass(dir === 'next' ? 'ps-img-exit-right' : 'ps-img-exit-left');

    timerRef.current = setTimeout(() => {
      setCurrent(p => dir === 'next'
        ? (p + 1) % products.length
        : (p - 1 + products.length) % products.length
      );
      setTextClass(dir === 'next' ? 'ps-text-enter-right' : 'ps-text-enter-left');
      setImgClass(dir === 'next' ? 'ps-img-enter-left' : 'ps-img-enter-right');
      timerRef.current = setTimeout(() => {
        setTextClass('');
        setImgClass('');
        setIsAnimating(false);
      }, 620);
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
      className="ps-mount relative w-full overflow-hidden flex flex-col justify-center items-center"
      aria-label="Slider de productos destacados"
      style={{ minHeight: 'calc(100vh - 72px)', background: 'linear-gradient(135deg,#4a1118 0%,#2a080c 40%,#0d0000 75%,#000 100%)' }}
    >
      {/* Ambient glow */}
      <div aria-hidden="true" className="absolute pointer-events-none z-0"
        style={{
          top: '20%', left: '35%', width: '600px', height: '450px',
          background: 'radial-gradient(ellipse,rgba(114,28,36,0.4) 0%,transparent 70%)'
        }} />

      {/* ─────────────────────────────────────────────────────────
          CAPA 1 — Texto base SÓLIDO BLANCO  (z-[1], detrás imagen)
          Visible solo donde el texto NO solapa la zapatilla.
      ───────────────────────────────────────────────────────── */}
      <div
        className={`${textClass} absolute inset-0 z-[1] flex items-center justify-center pointer-events-none`}
        aria-hidden="true"
      >
        <h2
          className="ps-name"
          style={{
            color: 'rgb(255,255,255)',
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}
        >
          {product.name}
        </h2>
      </div>

      {/* ─────────────────────────────────────────────────────────
          CAPA 2 — Imagen de la zapatilla  (z-[2])
          Queda entre los dos textos para crear el efecto cutout.
      ───────────────────────────────────────────────────────── */}
      <div className={`${imgClass} absolute inset-0 z-[2] flex items-center justify-center pointer-events-none`}>
        <img
          key={product.id}
          src={product.slide_image_url}
          alt={product.name}
          className="ps-float object-contain select-none block"
          style={{
            width: 'min(100%, 940px)',
            filter: 'drop-shadow(0 30px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(114,28,36,0.4))',
          }}
        />
        <div
          className="ps-shadow absolute rounded-full"
          style={{
            bottom: '60px', left: '50%', width: '320px', height: '24px',
            background: 'rgba(0,0,0,0.5)', filter: 'blur(16px)'
          }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────
          CAPA 3 — Texto OUTLINE TRANSPARENTE  (z-[3], sobre imagen)
          Solo el trazo blanco es visible; el relleno es transparent,
          dejando ver la zapatilla a través de las letras.
      ───────────────────────────────────────────────────────── */}
      <div
        className={`${textClass} absolute inset-0 z-[3] flex items-center justify-center pointer-events-none`}
        aria-hidden="true"
      >
        <h2
          className="ps-name"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1.3px #721c24',
          }}
        >
          {product.name}
        </h2>
      </div>

      {/* ─────────────────────────────────────────────────────────
          CAPA 4 — UI inferior: precio, stars, descripción, botón
          (z-[4], pointer-events activos solo en los controles)
      ───────────────────────────────────────────────────────── */}
      <div
        className={`${textClass} absolute bottom-0 left-0 right-0 z-[4]
          flex flex-col md:flex-row md:justify-between md:items-end
          pointer-events-none p-6 md:p-10 gap-3`}
      >
        {/* Left: precio + stars + descripción */}
        <div className="flex flex-col gap-1.5 pointer-events-none md:max-w-[45%]">
          <span className="text-3xl font-black md:text-4xl text-white tracking-tight">
            {Number(product.price).toFixed(2)}€
          </span>
          <Stars />
          {product.description && (
            <p className="text-sm md:text-base text-white/50 leading-relaxed font-mono m-0">
              {product.description.length > 60
                ? product.description.slice(0, 60) + '…'
                : product.description}
            </p>
          )}
        </div>

        {/* Botón COMPRAR */}
        <button
          id={`ps-buy-${product.id}`}
          className="ps-buy-btn w-full md:w-auto text-center pointer-events-auto"
          onClick={handleBuyNow}
          aria-label={`Añadir ${product.name} al carrito`}
        >
          COMPRAR
        </button>
      </div>

      {/* Arrows  z-[5] */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-6 z-[5] pointer-events-none">
        <button
          id="ps-prev"
          className="ps-arrow pointer-events-auto"
          onClick={() => navigate_slide('prev')}
          disabled={isAnimating}
          aria-label="Anterior"
        >‹</button>
        <button
          id="ps-next"
          className="ps-arrow pointer-events-auto"
          onClick={() => navigate_slide('next')}
          disabled={isAnimating}
          aria-label="Siguiente"
        >›</button>
      </div>
    </section>
  );
}