const brands = [
  { name: 'Nike',        src: '/imagenes animacion/pngegg.png' },
  { name: 'Adidas',      src: '/imagenes animacion/Adidas_logo.png' },
  { name: 'New Balance',  src: '/imagenes animacion/pngegg (2).png' },
  { name: 'Jordan',       src: '/imagenes animacion/pngegg (1).png' },
  { name: 'Yeezy',        src: '/imagenes animacion/Adidas_Yeezy_Logo.png' },
  { name: 'Off-White',    src: '/imagenes animacion/Off-White-logo.png' },
  { name: 'Amiri',        src: '/imagenes animacion/Amiri-Logo-2020.png' },
  { name: 'BAPE',         src: '/imagenes animacion/pngegg (4).png' },
];

export default function BrandMarquee() {
  return (
    <div className="bg-raised border-b border-border overflow-hidden py-15 group cursor-default select-none">
      <div
        className="flex whitespace-nowrap w-max  items-center"
        style={{
          animation: 'marqueeScroll 30s linear infinite',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
          <span
            key={i}
            className="inline-flex items-center shrink-0 mx-15 opacity-60 transition-opacity duration-200 hover:opacity-100"
          >
            <img
              src={brand.src}
              alt={brand.name}
              className="h-10 w-auto object-contain"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
