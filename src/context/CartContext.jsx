import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'sneakout_cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
  
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Sync cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Add item or increment quantity
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

  // Remove one unit or remove the item entirely
  const removeItem = useCallback((productId) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  // Remove product completely from cart
  const removeProduct = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  // Clear the whole cart
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

