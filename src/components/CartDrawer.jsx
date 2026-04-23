import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, addItem, removeItem, removeProduct, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar');
      navigate('/login');
      onClose();
      return;
    }
    if (items.length === 0) { toast.error('El carrito está vacío'); return; }
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer — transform is dynamic JS so style is required here */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-base border-l border-border z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-black text-primary">
            Tu Carrito
            {items.length > 0 && (
              <span className="ml-2 text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold">
                {items.length}
              </span>
            )}
          </h2>
          <button onClick={onClose}
            className="p-2 rounded-full bg-surface border border-border text-secondary cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-[1.1rem] h-[1.1rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm text-muted">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id}
                className="flex gap-3 bg-surface rounded-xl p-3 border border-border transition-colors duration-200 hover:border-accent group">
                <img
                  src={item.image_url ? `${BASE_URL}${item.image_url}` : 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted">{item.brand}</p>
                  <p className="text-accent font-bold text-sm mt-1">
                    {(item.price * item.quantity).toFixed(2)}€
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => addItem(item)}
                    className="w-6 h-6 rounded-full bg-accent text-white border-none text-sm cursor-pointer font-bold flex items-center justify-center transition-all duration-200 hover:bg-accent-hover">
                    +
                  </button>
                  <span className="text-sm font-bold text-primary">{item.quantity}</span>
                  <button onClick={() => removeItem(item.id)}
                    className="w-6 h-6 rounded-full bg-raised text-secondary border border-border text-sm cursor-pointer flex items-center justify-center transition-all duration-200 hover:border-accent hover:text-accent">
                    −
                  </button>
                </div>
                <button onClick={() => removeProduct(item.id)}
                  className="self-start p-1 bg-transparent border-none text-[#444] cursor-pointer transition-colors duration-200 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total</span>
              <span className="text-2xl font-black text-primary">{total.toFixed(2)}€</span>
            </div>
            <button onClick={handleCheckout}
              className="btn-accent w-full py-3.5 text-base rounded-xl">
              Finalizar Compra →
            </button>
            <button onClick={clearCart}
              className="w-full py-2 bg-transparent border-none text-[0.8rem] text-[#444] cursor-pointer transition-colors duration-200 hover:text-red-500">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
