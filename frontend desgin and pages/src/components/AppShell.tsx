import { useState } from 'react';
import { useNav, type Route } from '@/lib/nav';
import { useCart } from '@/lib/cart';
import { useTheme } from '@/lib/theme';
import { Logo, CoinIcon } from '@/components/Brand';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Recycle, Store, ShoppingCart, Wallet, Bell, Trophy,
  Leaf, User, Settings, Truck, Package, Factory, Shield, BarChart3,
  FileBarChart, ScanSearch, PackageSearch, Menu, X, Moon, Sun, LogOut, Search,
} from 'lucide-react';

interface NavItem {
  route: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const mainNav: NavItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'sell', label: 'Sell Plastic', icon: Recycle },
  { route: 'ai', label: 'AI Detection', icon: ScanSearch },
  { route: 'listings', label: 'My Listings', icon: PackageSearch },
  { route: 'marketplace', label: 'Marketplace', icon: Store },
  { route: 'orders', label: 'Orders', icon: Package },
  { route: 'wallet', label: 'Wallet', icon: Wallet },
];

const impactNav: NavItem[] = [
  { route: 'environment', label: 'Environmental', icon: Leaf },
  { route: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { route: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
];

const accountNav: NavItem[] = [
  { route: 'profile', label: 'Profile', icon: User },
  { route: 'settings', label: 'Settings', icon: Settings },
];

const opsNav: NavItem[] = [
  { route: 'collector', label: 'Collector', icon: Truck },
  { route: 'inventory', label: 'Inventory', icon: Package },
  { route: 'recycler', label: 'Recycler', icon: Factory },
];

const adminNav: NavItem[] = [
  { route: 'admin', label: 'Admin', icon: Shield },
  { route: 'analytics', label: 'Analytics', icon: BarChart3 },
  { route: 'reports', label: 'Reports', icon: FileBarChart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { route, navigate } = useNav();
  const { count } = useCart();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups = [
    { items: mainNav },
    { label: 'Impact', items: impactNav },
    { label: 'Operations', items: opsNav },
    { label: 'Admin', items: adminNav },
    { label: 'Account', items: accountNav },
  ];

  const allItems = navGroups.flatMap(g => g.items);
  const activeItem = allItems.find(i => i.route === route);
  const cartBadge = count > 0 ? count : undefined;

  return (
    <div className="min-h-screen bg-surface-subtle flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface border-r border-base sticky top-0 h-screen">
        <div className="p-5 border-b border-base">
          <button onClick={() => navigate('landing')}><Logo /></button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && <p className="px-3 mb-2 text-xs font-semibold text-base-muted uppercase tracking-wider">{group.label}</p>}
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const badge = item.route === 'marketplace' ? cartBadge : item.badge;
                  return (
                    <button
                      key={item.route}
                      onClick={() => navigate(item.route)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        route === item.route
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-soft'
                          : 'text-base-muted hover:text-base-strong hover:bg-surface-subtle'
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {badge && (
                        <span className="bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-base">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CoinIcon size={20} />
              <span className="font-display font-bold text-base-strong">8,420</span>
              <span className="text-xs text-base-muted">coins</span>
            </div>
            <p className="text-xs text-base-muted">≈ Rs 4,210 reward value</p>
          </div>
          <button onClick={() => navigate('landing')} className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-base-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
            <LogOut className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in-fast">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-base overflow-y-auto animate-slide-up">
            <div className="p-5 border-b border-base flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-base-muted" /></button>
            </div>
            <nav className="px-3 py-4 space-y-6">
              {navGroups.map((group, gi) => (
                <div key={gi}>
                  {group.label && <p className="px-3 mb-2 text-xs font-semibold text-base-muted uppercase tracking-wider">{group.label}</p>}
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <button
                        key={item.route}
                        onClick={() => { navigate(item.route); setMobileOpen(false); }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                          route === item.route
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'text-base-muted hover:text-base-strong hover:bg-surface-subtle'
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px]" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass border-b border-base/50 h-16 flex items-center px-4 sm:px-6 gap-3">
          <button className="lg:hidden p-2 rounded-lg text-base-strong" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold text-base-strong hidden sm:block">{activeItem?.label || 'Dashboard'}</h1>
          <div className="flex-1 max-w-md mx-auto sm:mx-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-muted" />
              <input
                placeholder="Search products, listings, orders..."
                className="w-full h-10 rounded-xl border border-base bg-surface-subtle pl-10 pr-4 text-sm text-base-strong placeholder:text-base-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggle} className="p-2.5 rounded-lg text-base-muted hover:text-base-strong hover:bg-surface-subtle transition-colors">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => navigate('notifications')} className="relative p-2.5 rounded-lg text-base-muted hover:text-base-strong hover:bg-surface-subtle transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button onClick={() => navigate('cart')} className="relative p-2.5 rounded-lg text-base-muted hover:text-base-strong hover:bg-surface-subtle transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartBadge && <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{cartBadge}</span>}
            </button>
            <button onClick={() => navigate('profile')}>
              <Avatar name="Aarav Patel" size="sm" ring />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
