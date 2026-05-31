import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'sneakout_cart';

/* Intenta cargar el carrito guardado en el almacenamiento local */
function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/* Proveedor que gestiona el estado global del carrito de compras */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Sincroniza el carrito con localStorage tras cada cambio
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Añade un artículo o incrementa su cantidad si ya existe
  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // Reduce en uno la cantidad o elimina el artículo si llega a cero
  const removeItem = useCallback((productId) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  // Elimina por completo un producto del carrito
  const removeProduct = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  // Vacía todos los artículos del carrito
  const clearCart = useCallback(() => setItems([]), []);

  const total         = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount     = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, removeProduct, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
