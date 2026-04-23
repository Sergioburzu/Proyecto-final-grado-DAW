import { useNavigate } from 'react-router-dom';

export default function MiniProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/producto/${product.id}`)}
      className="cursor-pointer group"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-raised rounded-xl overflow-hidden mb-3 border border-border transition-colors duration-200 group-hover:border-accent flex items-center justify-center">

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 z-10 badge-accent">
            BAJO STOCK
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 z-10 text-[0.6rem] font-bold px-2 py-0.5 rounded bg-border2 text-muted">
            AGOTADO
          </span>
        )}

        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </div>

      {/* Info */}
      <p className="text-sm font-semibold text-primary truncate m-0">
        {product.name}
      </p>
      <p className="text-sm font-bold text-accent mt-0.5 m-0">
        {Number(product.price).toFixed(2)}€
      </p>
    </div>
  );
}
