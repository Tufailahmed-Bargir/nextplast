import { createContext, useContext, useState, useCallback } from 'react';

type Route =
  | 'landing' | 'auth'
  | 'dashboard' | 'sell' | 'listings' | 'marketplace' | 'product' | 'cart' | 'checkout' | 'orders'
  | 'wallet' | 'notifications' | 'leaderboard' | 'environment' | 'profile' | 'settings'
  | 'collector' | 'inventory' | 'recycler' | 'admin' | 'analytics' | 'reports' | 'ai'
  | 'pickup';

interface NavCtx {
  route: Route;
  params: Record<string, string>;
  navigate: (route: Route, params?: Record<string, string>) => void;
  isApp: boolean;
}

const Ctx = createContext<NavCtx>({ route: 'landing', params: {}, navigate: () => {}, isApp: false });

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>('landing');
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((r: Route, p: Record<string, string> = {}) => {
    setRoute(r);
    setParams(p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const isApp = !['landing', 'auth'].includes(route);

  return <Ctx.Provider value={{ route, params, navigate, isApp }}>{children}</Ctx.Provider>;
}

export function useNav() { return useContext(Ctx); }
export type { Route };
