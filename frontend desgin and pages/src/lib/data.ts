export interface Product {
  id: string;
  name: string;
  category: string;
  priceCoins: number;
  priceRs: number;
  ecoScore: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: boolean;
  materials: string[];
}

export const products: Product[] = [
  {
    id: 'eco-bottle',
    name: 'Eco Bottle 750ml',
    category: 'Drinkware',
    priceCoins: 40,
    priceRs: 20,
    ecoScore: 92,
    image: 'https://images.pexels.com/photos/13871766/pexels-photo-13871766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    rating: 4.8,
    reviews: 1240,
    description: 'A premium recycled stainless steel water bottle. Keeps drinks cold for 24 hours, hot for 12. Made from 100% recycled materials.',
    inStock: true,
    materials: ['Recycled PET', 'Recycled Steel'],
  },
  {
    id: 'flower-pot',
    name: 'Recycled Flower Pot',
    category: 'Garden',
    priceCoins: 100,
    priceRs: 50,
    ecoScore: 88,
    image: 'https://images.pexels.com/photos/3101767/pexels-photo-3101767.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    rating: 4.6,
    reviews: 856,
    description: 'Handcrafted flower pot made from 2.5kg of recycled plastic. Perfect for indoor plants and succulents.',
    inStock: true,
    materials: ['Recycled HDPE', 'Recycled PP'],
  },
  {
    id: 'dustbin',
    name: 'Smart Dustbin 30L',
    category: 'Home',
    priceCoins: 300,
    priceRs: 150,
    ecoScore: 85,
    image: 'https://images.pexels.com/photos/31587977/pexels-photo-31587977.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    rating: 4.4,
    reviews: 432,
    description: 'A durable 30-litre dustbin made entirely from recycled plastic waste. Features a pedal-operated lid.',
    inStock: true,
    materials: ['Recycled HDPE'],
  },
  {
    id: 'chair',
    name: 'Eco Garden Chair',
    category: 'Furniture',
    priceCoins: 600,
    priceRs: 300,
    ecoScore: 90,
    image: 'https://images.pexels.com/photos/17488642/pexels-photo-17488642.png?auto=compress&cs=tinysrgb&h=650&w=940',
    rating: 4.7,
    reviews: 318,
    description: 'A sturdy outdoor chair crafted from 6kg of recycled plastic. Weather-resistant and built to last.',
    inStock: true,
    materials: ['Recycled PET', 'Recycled PP'],
  },
  {
    id: 'tote-bag',
    name: 'Canvas Tote Bag',
    category: 'Accessories',
    priceCoins: 25,
    priceRs: 12,
    ecoScore: 95,
    image: 'https://images.pexels.com/photos/1214212/pexels-photo-1214212.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    rating: 4.9,
    reviews: 2105,
    description: 'A reusable canvas tote bag made from recycled cotton and plastic fibers. Say goodbye to single-use plastic bags.',
    inStock: true,
    materials: ['Recycled Cotton', 'Recycled PET'],
  },
  {
    id: 'bamboo-brush',
    name: 'Bamboo Toothbrush Set',
    category: 'Personal Care',
    priceCoins: 15,
    priceRs: 8,
    ecoScore: 97,
    image: 'https://images.pexels.com/photos/8103078/pexels-photo-8103078.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    rating: 4.8,
    reviews: 3420,
    description: 'A pack of 4 bamboo toothbrushes with biodegradable handles. A simple switch with a big environmental impact.',
    inStock: true,
    materials: ['Bamboo', 'Recycled PP bristles'],
  },
];

export const categories = ['All', 'Drinkware', 'Garden', 'Home', 'Furniture', 'Accessories', 'Personal Care'];

export interface Activity {
  id: string;
  type: 'pickup' | 'reward' | 'purchase' | 'listing' | 'system';
  title: string;
  detail: string;
  time: string;
  coins?: number;
}

export const activities: Activity[] = [
  { id: 'a1', type: 'reward', title: 'Nature Coins earned', detail: '20 kg PET bottles recycled', time: '2h ago', coins: 200 },
  { id: 'a2', type: 'pickup', title: 'Pickup completed', detail: 'Collector: Rajesh K. — 20.5 kg verified', time: '5h ago' },
  { id: 'a3', type: 'purchase', title: 'Marketplace order', detail: 'Eco Bottle 750ml delivered', time: '1d ago', coins: -40 },
  { id: 'a4', type: 'listing', title: 'New listing created', detail: '15 kg HDPE containers — listed', time: '2d ago' },
  { id: 'a5', type: 'reward', title: 'Bonus coins', detail: 'Achievement: Eco Warrior Level 5', time: '3d ago', coins: 50 },
  { id: 'a6', type: 'system', title: 'AI verification passed', detail: 'Plastic type: PET — 98% confidence', time: '3d ago' },
];

export interface LeaderEntry {
  rank: number;
  name: string;
  coins: number;
  recycled: number;
  city: string;
  avatar?: string;
}

export const leaderboard: LeaderEntry[] = [
  { rank: 1, name: 'Priya Sharma', coins: 12480, recycled: 1248, city: 'Mumbai' },
  { rank: 2, name: 'Arjun Mehta', coins: 11200, recycled: 1120, city: 'Delhi' },
  { rank: 3, name: 'Kavya Reddy', coins: 9850, recycled: 985, city: 'Bangalore' },
  { rank: 4, name: 'You', coins: 8420, recycled: 842, city: 'Pune' },
  { rank: 5, name: 'Vikram Singh', coins: 7600, recycled: 760, city: 'Chennai' },
  { rank: 6, name: 'Ananya Gupta', coins: 6900, recycled: 690, city: 'Hyderabad' },
  { rank: 7, name: 'Rohan Das', coins: 5400, recycled: 540, city: 'Kolkata' },
  { rank: 8, name: 'Sneha Patel', coins: 4800, recycled: 480, city: 'Ahmedabad' },
];

export interface Pickup {
  id: string;
  date: string;
  status: 'scheduled' | 'in-transit' | 'completed' | 'verifying';
  collector: string;
  weight: string;
  address: string;
  coins: number;
}

export const pickups: Pickup[] = [
  { id: 'PK-2841', date: 'Today, 4:00 PM', status: 'in-transit', collector: 'Rajesh Kumar', weight: '20 kg (est.)', address: '12 MG Road, Pune', coins: 200 },
  { id: 'PK-2830', date: 'Yesterday, 2:00 PM', status: 'completed', collector: 'Mohammed Ali', weight: '15.2 kg', address: '12 MG Road, Pune', coins: 152 },
  { id: 'PK-2815', date: 'Jul 26, 10:00 AM', status: 'completed', collector: 'Suresh Yadav', weight: '8.5 kg', address: '12 MG Road, Pune', coins: 85 },
  { id: 'PK-2801', date: 'Jul 24, 6:00 PM', status: 'verifying', collector: 'Rajesh Kumar', weight: '12 kg (est.)', address: '12 MG Road, Pune', coins: 120 },
];

export interface Notification {
  id: string;
  type: 'reward' | 'pickup' | 'order' | 'system' | 'achievement';
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

export const notifications: Notification[] = [
  { id: 'n1', type: 'pickup', title: 'Collector on the way', detail: 'Rajesh K. is heading to your location. ETA 25 min.', time: '10 min ago', read: false },
  { id: 'n2', type: 'reward', title: '200 Nature Coins earned', detail: 'Your pickup PK-2830 was verified and rewarded.', time: '5h ago', read: false },
  { id: 'n3', type: 'achievement', title: 'Achievement unlocked: Eco Warrior', detail: 'You recycled over 800 kg of plastic!', time: '1d ago', read: false },
  { id: 'n4', type: 'order', title: 'Order delivered', detail: 'Eco Bottle 750ml has been delivered.', time: '1d ago', read: true },
  { id: 'n5', type: 'system', title: 'AI verification complete', detail: 'Your listing passed AI detection with 98% confidence.', time: '2d ago', read: true },
];

export interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus';
  title: string;
  detail: string;
  amount: number;
  date: string;
  balance: number;
}

export const coinTransactions: CoinTransaction[] = [
  { id: 't1', type: 'earned', title: 'Pickup reward', detail: 'PK-2830 — 15.2 kg PET', amount: 152, date: 'Jul 28', balance: 8420 },
  { id: 't2', type: 'spent', title: 'Marketplace purchase', detail: 'Eco Bottle 750ml', amount: -40, date: 'Jul 27', balance: 8268 },
  { id: 't3', type: 'bonus', title: 'Achievement bonus', detail: 'Eco Warrior Level 5', amount: 50, date: 'Jul 25', balance: 8308 },
  { id: 't4', type: 'earned', title: 'Pickup reward', detail: 'PK-2815 — 8.5 kg HDPE', amount: 85, date: 'Jul 26', balance: 8258 },
  { id: 't5', type: 'spent', title: 'Marketplace purchase', detail: 'Canvas Tote Bag', amount: -25, date: 'Jul 24', balance: 8173 },
  { id: 't6', type: 'earned', title: 'Pickup reward', detail: 'PK-2801 — 12 kg PET', amount: 120, date: 'Jul 24', balance: 8198 },
];

export const impactData = {
  plasticRecycled: 842,
  co2Saved: 1684,
  treesSaved: 42,
  oilSaved: 210,
  waterSaved: 4200,
  energy: 5880,
};

export const monthlyData = [
  { month: 'Jan', kg: 45, coins: 450 },
  { month: 'Feb', kg: 62, coins: 620 },
  { month: 'Mar', kg: 38, coins: 380 },
  { month: 'Apr', kg: 78, coins: 780 },
  { month: 'May', kg: 95, coins: 950 },
  { month: 'Jun', kg: 110, coins: 1100 },
  { month: 'Jul', kg: 142, coins: 1420 },
];

export const weeklyData = [
  { day: 'Mon', value: 12 },
  { day: 'Tue', value: 18 },
  { day: 'Wed', value: 25 },
  { day: 'Thu', value: 20 },
  { day: 'Fri', value: 32 },
  { day: 'Sat', value: 28 },
  { day: 'Sun', value: 15 },
];

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export const achievements: Achievement[] = [
  { id: 'first', name: 'First Steps', desc: 'Complete your first pickup', icon: 'Sprout', unlocked: true },
  { id: 'warrior', name: 'Eco Warrior', desc: 'Recycle 800 kg of plastic', icon: 'Sword', unlocked: true },
  { id: 'guardian', name: 'Planet Guardian', desc: 'Recycle 2000 kg of plastic', icon: 'Shield', unlocked: false, progress: 42 },
  { id: 'streak', name: 'Consistency King', desc: 'Recycle every week for 3 months', icon: 'Flame', unlocked: false, progress: 75 },
  { id: 'marketplace', name: 'Eco Shopper', desc: 'Make 10 marketplace purchases', icon: 'ShoppingBag', unlocked: false, progress: 30 },
  { id: 'ambassador', name: 'Green Ambassador', desc: 'Refer 5 friends to NexPlast', icon: 'Users', unlocked: false, progress: 60 },
];

export interface CollectorPickup {
  id: string;
  user: string;
  address: string;
  weight: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'verified';
  otp: string;
  distance: string;
  coins: number;
  time: string;
}

export const collectorPickups: CollectorPickup[] = [
  { id: 'PK-2841', user: 'Aarav Patel', address: '12 MG Road, Pune', weight: '20 kg', status: 'in-progress', otp: '4821', distance: '2.3 km', coins: 200, time: '3:00 PM' },
  { id: 'PK-2842', user: 'Sneha R.', address: '45 Koregaon Park, Pune', weight: '12 kg', status: 'assigned', otp: '1937', distance: '5.1 km', coins: 120, time: '4:30 PM' },
  { id: 'PK-2843', user: 'Karan J.', address: '78 Baner Road, Pune', weight: '8 kg', status: 'assigned', otp: '5520', distance: '7.8 km', coins: 80, time: '5:00 PM' },
  { id: 'PK-2830', user: 'Diya S.', address: '23 Kalyani Nagar, Pune', weight: '15.2 kg', status: 'verified', otp: '3344', distance: '3.2 km', coins: 152, time: 'Yesterday' },
];

export interface InventoryItem {
  id: string;
  type: string;
  weight: number;
  quality: 'A' | 'B' | 'C';
  source: string;
  date: string;
  status: 'in-stock' | 'reserved' | 'shipped';
}

export const inventory: InventoryItem[] = [
  { id: 'INV-001', type: 'PET', weight: 320, quality: 'A', source: 'PK-2830', date: 'Jul 28', status: 'in-stock' },
  { id: 'INV-002', type: 'HDPE', weight: 180, quality: 'B', source: 'PK-2815', date: 'Jul 26', status: 'reserved' },
  { id: 'INV-003', type: 'PP', weight: 95, quality: 'A', source: 'PK-2801', date: 'Jul 24', status: 'in-stock' },
  { id: 'INV-004', type: 'PET', weight: 420, quality: 'A', source: 'PK-2790', date: 'Jul 22', status: 'shipped' },
  { id: 'INV-005', type: 'LDPE', weight: 65, quality: 'C', source: 'PK-2785', date: 'Jul 20', status: 'in-stock' },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'collector' | 'recycler' | 'admin';
  coins: number;
  recycled: number;
  status: 'active' | 'suspended';
  joined: string;
}

export const adminUsers: AdminUser[] = [
  { id: 'U-001', name: 'Aarav Patel', email: 'aarav@email.com', role: 'user', coins: 8420, recycled: 842, status: 'active', joined: 'Jan 2025' },
  { id: 'U-002', name: 'Rajesh Kumar', email: 'rajesh@email.com', role: 'collector', coins: 15600, recycled: 1560, status: 'active', joined: 'Dec 2024' },
  { id: 'U-003', name: 'GreenCycle Ltd', email: 'ops@greencycle.com', role: 'recycler', coins: 0, recycled: 12400, status: 'active', joined: 'Nov 2024' },
  { id: 'U-004', name: 'Priya Sharma', email: 'priya@email.com', role: 'user', coins: 12480, recycled: 1248, status: 'active', joined: 'Oct 2024' },
  { id: 'U-005', name: 'Mohammed Ali', email: 'mohammed@email.com', role: 'collector', coins: 9800, recycled: 980, status: 'active', joined: 'Nov 2024' },
  { id: 'U-006', name: 'Spam Account', email: 'spam@temp.com', role: 'user', coins: 15, recycled: 1, status: 'suspended', joined: 'Jul 2025' },
];
