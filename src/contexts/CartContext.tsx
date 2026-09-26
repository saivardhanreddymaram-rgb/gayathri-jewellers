import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../api/cart';
import { extractErrorMessage } from '../api/client';
import { useAuth } from './AuthContext';
import type { Cart, CartItem } from '../types';
import toast from 'react-hot-toast';

// ─── State ────────────────────────────────────────────────────────────────────

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_CART'; cart: Cart | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.cart, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue extends CartState {
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  emptyCart: () => Promise<void>;
  refresh: () => Promise<void>;
  itemCount: number;
  hasItem: (productId: number) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!user) { dispatch({ type: 'SET_CART', cart: null }); return; }
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const { cart } = await getCart();
      dispatch({ type: 'SET_CART', cart });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: extractErrorMessage(err) });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    try {
      const { cart } = await addToCart(productId, quantity);
      dispatch({ type: 'SET_CART', cart });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      const { cart } = await updateCartItem(itemId, quantity);
      dispatch({ type: 'SET_CART', cart });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const { cart } = await removeCartItem(itemId);
      dispatch({ type: 'SET_CART', cart });
      toast.success('Item removed');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  const emptyCart = useCallback(async () => {
    try {
      await clearCart();
      dispatch({ type: 'SET_CART', cart: null });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, []);

  const itemCount = state.cart?.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0) ?? 0;

  const hasItem = useCallback(
    (productId: number) =>
      state.cart?.items.some((i: CartItem) => i.product.id === productId) ?? false,
    [state.cart]
  );

  return (
    <CartContext.Provider value={{ ...state, addItem, updateItem, removeItem, emptyCart, refresh, itemCount, hasItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
