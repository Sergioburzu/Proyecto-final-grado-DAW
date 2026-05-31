import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './ProductSlider.css';

/* Esqueleto de carga del carrusel */
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

/* Indicador visual de estrellas */
function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="ps-star">{i < 5 ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

/* Carrusel de productos destacados con efectos de capas y parallax */
export default function ProductSlider() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textClass, setTextClass] = useState('');
  const [imgClass, setImgClass] = useState('');

  const timerRef = useRef(null);
  const navigate = useNavigate();

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

  // Controla la transición de salida e ingreso de las diapositivas
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
    navigate(`/producto/${p.id}`);
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
      {/* Luz ambiental de fondo */}
      <div aria-hidden="true" className="absolute pointer-events-none z-0"
        style={{
          top: '20%', left: '35%', width: '600px', height: '450px',
          background: 'radial-gradient(ellipse,rgba(114,28,36,0.4) 0%,transparent 70%)'
        }} />

      {/* CAPA 1 — Texto base sólido blanco (detrás de la imagen) */}
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

      {/* CAPA 2 — Imagen de la zapatilla con efecto flotante */}
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

      {/* CAPA 3 — Texto de contorno transparente (por encima de la imagen) */}
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

      {/* CAPA 4 — Panel inferior con precio, descripción y botón de compra */}
      <div
        className={`${textClass} absolute bottom-0 left-0 right-0 z-[4]
          flex flex-col md:flex-row md:justify-between md:items-end
          pointer-events-none p-6 md:p-10 gap-3`}
      >
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

        <button
          id={`ps-buy-${product.id}`}
          className="ps-buy-btn w-full md:w-auto text-center pointer-events-auto"
          onClick={handleBuyNow}
          aria-label={`Ver detalles de ${product.name}`}
        >
          COMPRAR
        </button>
      </div>

      {/* Controles laterales del carrusel */}
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