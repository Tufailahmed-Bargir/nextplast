import { ThemeProvider } from '@/lib/theme';
import { NavProvider, useNav } from '@/lib/nav';
import { CartProvider } from '@/lib/cart';
import { AppShell } from '@/components/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { WalletPage } from '@/pages/WalletPage';
import { SellPlasticPage } from '@/pages/SellPlasticPage';
import { EnvironmentPage } from '@/pages/EnvironmentPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ListingsPage } from '@/pages/ListingsPage';
import { CollectorPage } from '@/pages/CollectorPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { RecyclerPage } from '@/pages/RecyclerPage';
import { AdminPage } from '@/pages/AdminPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AIPage } from '@/pages/AIPage';

function Router() {
  const { route, isApp } = useNav();

  if (route === 'landing') return <LandingPage />;
  if (route === 'auth') return <AuthPage />;

  const page = (() => {
    switch (route) {
      case 'dashboard': return <DashboardPage />;
      case 'sell': return <SellPlasticPage />;
      case 'ai': return <AIPage />;
      case 'listings': return <ListingsPage />;
      case 'marketplace': return <MarketplacePage />;
      case 'product': return <ProductDetailPage />;
      case 'cart': return <CartPage />;
      case 'checkout': return <CheckoutPage />;
      case 'orders': return <OrdersPage />;
      case 'wallet': return <WalletPage />;
      case 'notifications': return <NotificationsPage />;
      case 'leaderboard': return <LeaderboardPage />;
      case 'environment': return <EnvironmentPage />;
      case 'profile': return <ProfilePage />;
      case 'settings': return <SettingsPage />;
      case 'collector': return <CollectorPage />;
      case 'inventory': return <InventoryPage />;
      case 'recycler': return <RecyclerPage />;
      case 'admin': return <AdminPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'reports': return <ReportsPage />;
      default: return <DashboardPage />;
    }
  })();

  return <AppShell>{page}</AppShell>;
}

function App() {
  return (
    <ThemeProvider>
      <NavProvider>
        <CartProvider>
          <Router />
        </CartProvider>
      </NavProvider>
    </ThemeProvider>
  );
}

export default App;
