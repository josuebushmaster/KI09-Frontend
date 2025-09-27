import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Producto } from '../../../../domain/entities';
import { getProducto } from '../../../../infrastructure/api/ProductoApi';
import { clampQuantity } from '../../../../utils/currency';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock?: number | null;
  image?: string | null;
  description?: string | null;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Producto; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'REHYDRATE'; payload: { items: CartItem[] } }
  | { type: 'CLEAR' };

const MAX_PER_ITEM = 99;
const STORAGE_KEY = 'shop_cart_v1';

function normalizeProduct(product: Producto, quantity: number): CartItem {
  const stock = typeof product.stock === 'number' && product.stock >= 0 ? product.stock : undefined;
  const safeQuantity = clampQuantity(quantity, { min: 1, max: stock ?? MAX_PER_ITEM });
  const safePrice = Number(product.precio);

  return {
    productId: Number(product.id_producto),
    name: product.nombre_producto.trim() || 'Producto sin nombre',
    price: Number.isFinite(safePrice) ? safePrice : 0,
    quantity: safeQuantity,
    stock,
    image: product.imagen_url ?? null,
    description: product.descripcion ?? null,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const normalized = normalizeProduct(product, quantity);
      const existingIndex = state.items.findIndex((item) => item.productId === normalized.productId);

      if (existingIndex === -1) {
        return {
          items: [...state.items, normalized],
        };
      }

      const existing = state.items[existingIndex];
      const nextQty = clampQuantity(existing.quantity + normalized.quantity, {
        min: 1,
        max: existing.stock ?? MAX_PER_ITEM,
      });
      const nextItems = [...state.items];
      nextItems[existingIndex] = {
        ...existing,
        quantity: nextQty,
      };
      return { items: nextItems };
    }
    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      return { items: state.items.filter((item) => item.productId !== productId) };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.productId === productId);
      if (index === -1) return state;
      const target = state.items[index];
      const nextQty = clampQuantity(quantity, {
        min: 1,
        max: target.stock ?? MAX_PER_ITEM,
      });
      const nextItems = [...state.items];
      nextItems[index] = {
        ...target,
        quantity: nextQty,
      };
      return { items: nextItems };
    }
    case 'CLEAR':
      return { items: [] };
      case 'REHYDRATE': {
        return { items: action.payload.items };
      }
    default:
      return state;
  }
}

function readInitialState(): CartState {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      return { items: [] };
    }
    const items = (parsed.items as unknown[])
      .map((item): CartItem | null => {
        if (!item || typeof item !== 'object') return null;
        const obj = item as Record<string, unknown>;
        const productId = Number(obj.productId);
        const price = Number(obj.price);
        const quantity = Number(obj.quantity);
        if (!Number.isFinite(productId) || !Number.isFinite(price) || !Number.isFinite(quantity)) {
          return null;
        }
        return {
          productId,
          name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : 'Producto',
          price,
          quantity: clampQuantity(quantity, { min: 1, max: MAX_PER_ITEM }),
          stock: typeof obj.stock === 'number' && obj.stock >= 0 ? obj.stock : undefined,
          image: typeof obj.image === 'string' ? obj.image : null,
          description: typeof obj.description === 'string' ? obj.description : null,
        } satisfies CartItem;
      })
      .filter((item): item is CartItem => item !== null);
    return { items };
  } catch (error) {
    console.warn('useCart: no se pudo leer el carrito almacenado', error);
    return { items: [] };
  }
}

const CartContext = createContext<{
  state: CartState;
  addItem: (product: Producto, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, readInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({ items: state.items });
    window.localStorage.setItem(STORAGE_KEY, payload);
  }, [state.items]);

  // Rehydrate: try to complete missing product info for items loaded from localStorage
  const rehydratedRef = useRef(false);
  useEffect(() => {
    if (rehydratedRef.current) return;
    rehydratedRef.current = true;
    const missingIds = state.items
      .filter((i) => !i.name || i.name === 'Producto' || i.name === 'Producto sin nombre')
      .map((i) => i.productId);
    if (missingIds.length === 0) return;
    let active = true;
    const controller = new AbortController();
    (async () => {
      try {
        const results = await Promise.allSettled(missingIds.map((id) => getProducto(id)));
        if (!active) return;
        const idToProduct = new Map<number, Producto>();
        results.forEach((r) => {
          if (r.status === 'fulfilled') idToProduct.set(r.value.id_producto, r.value);
        });
        const merged = state.items.map((item) => {
          const prod = idToProduct.get(item.productId);
          if (!prod) return item;
          const normalized = normalizeProduct(prod, item.quantity);
          return {
            ...item,
            name: normalized.name,
            price: normalized.price,
            stock: normalized.stock,
            image: normalized.image,
            description: normalized.description,
          };
        });
        dispatch({ type: 'REHYDRATE', payload: { items: merged } });
      } catch {
        // ignore failures to rehydrate
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
    // We intentionally run this only once on mount to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    state,
    addItem: (product: Producto, quantity?: number) => {
      dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    },
    removeItem: (productId: number) => dispatch({ type: 'REMOVE_ITEM', payload: { productId } }),
    updateQuantity: (productId: number, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');

  const { state, addItem, removeItem, updateQuantity, clear } = ctx;

  const summary = useMemo(() => {
    const subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
    const estimatedTax = subtotal * 0.18; // 18% IGV por defecto
    const total = subtotal + estimatedTax;
    return { subtotal, estimatedTax, total, totalItems };
  }, [state.items]);

  const getItemQuantity = (productId: number) => state.items.find((item) => item.productId === productId)?.quantity ?? 0;

  return {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    summary,
    getItemQuantity,
  };
}
