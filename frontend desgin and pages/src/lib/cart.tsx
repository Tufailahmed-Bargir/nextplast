import { createContext, useContext, useState, useCallback } from 'react';
import { products, type Product } from '@/lib/data';

export interface CartItem {
  product: Product;
  qty: number;
  payCoins: number;
  payRs: number;
}

interface CartCtx {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  totalCoins: number;
  totalRs: number;
  count: number;
}

const Ctx = createContext<CartCtx>({
  items: [], add: () => {}, remove: () => {}, updateQty: () => {}, clear: () => {},
  totalCoins: 0, totalRs: 0, count: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((product: Product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { product, qty, payCoins: product.priceCoins, payRs: product.priceRs }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.product.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalCoins = items.reduce((s, i) => s + i.payCoins * i.qty, 0);
  const totalRs = items.reduce((s, i) => s + i.payRs * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, updateQty, clear, totalCoins, totalRs, count }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() { return useContext(Ctx); }
