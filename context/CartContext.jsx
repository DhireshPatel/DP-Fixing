"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "dpfixing_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Failed to load cart from storage:", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to storage:", err);
    }
  }, [items, hydrated]);

  const addItem = useCallback((service, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.serviceId === service.id);
      if (existing) {
        return prev.map((i) =>
          i.serviceId === service.id
            ? { ...i, quantity: Math.min(20, i.quantity + quantity) }
            : i
        );
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          name: service.name,
          image: service.image,
          price: service.price,
          duration: service.duration,
          quantity: Math.min(20, quantity),
        },
      ];
    });
  }, []);

  const increaseQuantity = useCallback((serviceId) => {
    setItems((prev) =>
      prev.map((i) =>
        i.serviceId === serviceId ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i
      )
    );
  }, []);

  const decreaseQuantity = useCallback((serviceId) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.serviceId === serviceId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((serviceId) => {
    setItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = {
    items,
    hydrated,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
