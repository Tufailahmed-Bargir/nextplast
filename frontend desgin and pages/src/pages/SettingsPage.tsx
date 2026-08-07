import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Moon, Sun, Bell, Lock, User, Globe, CreditCard, Trash2, Check } from 'lucide-react';

export function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [notif, setNotif] = useState({ pickups: true, rewards: true, orders: true, leaderboard: false, newsletter: true });
  const [saved, setSaved] = useState(false);

  const toggleNotif = (key: keyof typeof notif) => setNotif(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">Settings</h1>
        <p className="text-base-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <User className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-base-strong">Profile Information</h3>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <Avatar name="Aarav Patel" size="lg" ring />
          <div>
            <Button variant="outline" size="sm">Change Photo</Button>
            <p className="text-xs text-base-muted mt-1.5">JPG or PNG, max 2MB</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" defaultValue="Aarav Patel" />
          <Input label="Email" defaultValue="aarav@email.com" />
          <Input label="Phone" defaultValue="+91 98765 43210" />
          <Input label="City" defaultValue="Pune" />
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center">
            {theme === 'light' ? <Sun className="h-5 w-5 text-sky-600" /> : <Moon className="h-5 w-5 text-sky-600" />}
          </div>
          <h3 className="font-display text-lg font-semibold text-base-strong">Appearance</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle">
          <div>
            <p className="font-medium text-sm text-base-strong">Dark Mode</p>
            <p className="text-xs text-base-muted">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggle}
            className={cn('relative h-7 w-12 rounded-full transition-colors', theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300')}
          >
            <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-transform', theme === 'dark' ? 'translate-x-6' : 'translate-x-1')} />
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
            <Bell className="h-5 w-5 text-teal-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-base-strong">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'pickups' as const, label: 'Pickup updates', desc: 'Notifications about scheduled pickups' },
            { key: 'rewards' as const, label: 'Coin rewards', desc: 'When you earn Nature Coins' },
            { key: 'orders' as const, label: 'Order updates', desc: 'Marketplace order status changes' },
            { key: 'leaderboard' as const, label: 'Leaderboard changes', desc: 'When your rank changes' },
            { key: 'newsletter' as const, label: 'Newsletter', desc: 'Eco tips and NexPlast updates' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-subtle transition-colors">
              <div>
                <p className="font-medium text-sm text-base-strong">{item.label}</p>
                <p className="text-xs text-base-muted">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={cn('relative h-7 w-12 rounded-full transition-colors', notif[item.key] ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700')}
              >
                <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-transform', notif[item.key] ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
            <Lock className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-base-strong">Security</h3>
        </div>
        <div className="space-y-3">
          <Input label="Current password" type="password" placeholder="••••••••" />
          <Input label="New password" type="password" placeholder="••••••••" />
          <Button variant="outline" size="sm">Update Password</Button>
        </div>
      </Card>

      {/* Save bar */}
      <div className="flex items-center justify-between sticky bottom-4">
        <Button variant="danger" size="sm"><Trash2 className="h-4 w-4" /> Delete Account</Button>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-emerald-600 flex items-center gap-1 animate-fade-in-fast"><Check className="h-4 w-4" /> Saved</span>}
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
