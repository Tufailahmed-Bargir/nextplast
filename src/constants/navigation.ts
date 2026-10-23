import { UserRole } from "@/constants/roles";

/** Serializable icon keys — resolved to Lucide components only in client UI. */
export type NavIconName =
  | "LayoutDashboard"
  | "Recycle"
  | "Store"
  | "Wallet"
  | "History"
  | "Trophy"
  | "User"
  | "Settings"
  | "Users"
  | "Truck"
  | "Factory"
  | "Package"
  | "Coins"
  | "ClipboardList"
  | "BarChart3"
  | "FileBarChart"
  | "Navigation"
  | "CheckCircle2"
  | "Clock"
  | "LogOut"
  | "Bell"
  | "ShoppingCart"
  | "Heart"
  | "Cpu"
  | "Leaf";

export interface NavItem {
  title: string;
  href: string;
  icon: NavIconName;
  roles?: readonly UserRole[];
}

/** User / seller dashboard sidebar */
export const userNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Sell Plastic", href: "/sell", icon: "Recycle" },
  // Hidden for users — AI runs inside Sell Plastic flow
  // { title: "AI Detection", href: "/ai", icon: "Cpu" },
  // Hidden — available via Dashboard Quick Actions
  // { title: "My Listings", href: "/listings", icon: "ClipboardList" },
  { title: "Marketplace", href: "/marketplace", icon: "Store" },
  // Hidden — available via top header cart icon
  // { title: "Cart", href: "/cart", icon: "ShoppingCart" },
  // Hidden — available via top header wishlist icon
  // { title: "Wishlist", href: "/wishlist", icon: "Heart" },
  { title: "Orders", href: "/orders", icon: "Package" },
  { title: "Wallet", href: "/wallet", icon: "Wallet" },
  // Hidden — available via Dashboard
  // { title: "Impact", href: "/impact", icon: "Leaf" },
  // Hidden — available via Dashboard
  // { title: "History", href: "/history", icon: "History" },
  // Hidden — available via top header bell icon
  // { title: "Notifications", href: "/notifications", icon: "Bell" },
  // Hidden for users
  // { title: "Leaderboard", href: "/leaderboard", icon: "Trophy" },
  // Hidden — available via top header avatar
  // { title: "Profile", href: "/profile", icon: "User" },
  // Hidden — available via profile / header
  // { title: "Settings", href: "/settings", icon: "Settings" },
];

/** Admin sidebar */
export const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { title: "Users", href: "/admin/users", icon: "Users" },
  { title: "Collectors", href: "/admin/collectors", icon: "Truck" },
  { title: "Recyclers", href: "/admin/recyclers", icon: "Factory" },
  { title: "Listings", href: "/admin/listings", icon: "Recycle" },
  {
    title: "Pickup Requests",
    href: "/admin/pickup-requests",
    icon: "ClipboardList",
  },
  { title: "Inventory", href: "/admin/inventory", icon: "Package" },
  { title: "Products", href: "/admin/products", icon: "Store" },
  { title: "Product Requests", href: "/admin/product-requests", icon: "Bell" },
  { title: "Orders", href: "/admin/orders", icon: "ClipboardList" },
  // Hidden from admin sidebar
  // { title: "Coin Economy", href: "/admin/coin-economy", icon: "Coins" },
  // Hidden from admin sidebar
  // { title: "AI Platform", href: "/admin/ai", icon: "Cpu" },
  // Hidden from admin sidebar
  // { title: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  // Hidden — available via Admin Dashboard
  // { title: "Reports", href: "/admin/reports", icon: "FileBarChart" },
  // Hidden — available via top header avatar
  // { title: "Settings", href: "/admin/settings", icon: "Settings" },
];

/** Collector sidebar */
export const collectorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/collector", icon: "LayoutDashboard" },
  {
    title: "Assigned Pickups",
    href: "/collector/assigned",
    icon: "ClipboardList",
  },
  { title: "Navigation", href: "/collector/navigation", icon: "Navigation" },
  {
    title: "Completed Pickups",
    href: "/collector/completed",
    icon: "CheckCircle2",
  },
  { title: "Pending Verification", href: "/collector/pending", icon: "Clock" },
  { title: "Notifications", href: "/collector/notifications", icon: "Bell" },
  { title: "Profile", href: "/collector/profile", icon: "User" },
];

/** Recycler partner sidebar */
export const recyclerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/recycler", icon: "LayoutDashboard" },
  { title: "Buy Inventory", href: "/recycler/inventory", icon: "Package" },
  { title: "Purchase History", href: "/recycler/history", icon: "History" },
  { title: "Notifications", href: "/recycler/notifications", icon: "Bell" },
  { title: "Profile", href: "/recycler/profile", icon: "User" },
];

export const logoutNavItem: NavItem = {
  title: "Logout",
  href: "/api/auth/signout",
  icon: "LogOut",
};
