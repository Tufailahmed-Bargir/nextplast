"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Recycle,
  Store,
  Wallet,
  History,
  Trophy,
  User,
  Settings,
  Users,
  Truck,
  Factory,
  Package,
  Coins,
  ClipboardList,
  BarChart3,
  FileBarChart,
  Navigation,
  CheckCircle2,
  Clock,
  LogOut,
  Bell,
  ShoppingCart,
  Heart,
  Cpu,
  Leaf,
} from "lucide-react";
import type { NavIconName } from "@/constants/navigation";

const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  Recycle,
  Store,
  Wallet,
  History,
  Trophy,
  User,
  Settings,
  Users,
  Truck,
  Factory,
  Package,
  Coins,
  ClipboardList,
  BarChart3,
  FileBarChart,
  Navigation,
  CheckCircle2,
  Clock,
  LogOut,
  Bell,
  ShoppingCart,
  Heart,
  Cpu,
  Leaf,
};

export function getNavIcon(name: NavIconName): LucideIcon {
  return NAV_ICONS[name] ?? LayoutDashboard;
}
