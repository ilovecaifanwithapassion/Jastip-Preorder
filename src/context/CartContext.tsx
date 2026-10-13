"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  tripId: string;
  tripTitle: string;
  name: string;
  variantId?: string;
  variantName?: string;
  originalPrice: number;
  originalCurrency: string;
  priceAdjustment: number;
  quantity: number;
  image?: string;
  exchangeRate?: number;
  estimatedUnitPriceIDR?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalEstimatedIDR: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jastip_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("jastip_cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to localStorage:", e);
    }
  }, [items, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalEstimatedIDR = items.reduce((acc, item) => {
    const unitPrice = item.estimatedUnitPriceIDR || 0;
    return acc + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        totalEstimatedIDR,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
