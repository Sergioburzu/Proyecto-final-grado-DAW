import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} añadido al carrito`);
  };

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-white/5">
        <img
          src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Badge brand */}
      <div className="absolute top-3 left-3">
        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/30">
          {product.brand}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg leading-tight mb-1 truncate">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-1">Tallas: {product.size}</p>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-indigo-400">{Number(product.price).toFixed(2)}€</span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir
          </button>
        </div>

        {/* Stock indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="mt-2 text-xs text-amber-400 font-medium">⚠ Solo quedan {product.stock} unidades</p>
        )}
        {product.stock === 0 && (
          <p className="mt-2 text-xs text-red-400 font-medium">❌ Sin stock</p>
        )}
      </div>
    </div>
  );
}
