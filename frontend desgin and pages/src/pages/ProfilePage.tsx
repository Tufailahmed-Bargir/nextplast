import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { CoinIcon } from '@/components/Brand';
import { Progress } from '@/components/ui/Progress';
import { useNav } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { impactData, achievements } from '@/lib/data';
import * as Icons from 'lucide-react';

export function ProfilePage() {
  const { navigate } = useNav();

  const stats = [
    { label: 'Coins', value: '8,420' },
    { label: 'Recycled', value: '842 kg' },
    { label: 'Pickups', value: '28' },
    { label: 'Orders', value: '15' },
    { label: 'Rank', value: '#4' },
    { label: 'Member since', value: 'Jan 2025' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card className="relative overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar name="Aarav Patel" size="xl" ring className="ring-4 ring-surface" />
            <div className="flex-1 sm:mb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-base-strong">Aarav Patel</h1>
                <Badge variant="emerald" dot>Verified</Badge>
              </div>
              <p className="text-base-muted">aarav@email.com · Pune, India</p>
            </div>
            <div className="flex gap-2 sm:mb-2">
              <Button variant="outline" size="sm" onClick={() => navigate('settings')}>Edit Profile</Button>
              <Button size="sm" onClick={() => navigate('settings')}>Settings</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className="font-display text-xl font-bold text-base-strong">{s.value}</p>
            <p className="text-xs text-base-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Impact summary */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Environmental Impact</h3>
          <div className="space-y-4">
            {[
              { icon: Icons.Recycle, label: 'Plastic Recycled', value: '842 kg', color: 'emerald' },
              { icon: Icons.Wind, label: 'CO₂ Saved', value: '1,684 kg', color: 'sky' },
              { icon: Icons.TreePine, label: 'Trees Saved', value: '42', color: 'forest' },
              { icon: Icons.Droplets, label: 'Water Saved', value: '4,200 L', color: 'teal' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle">
                <item.icon className={cn('h-5 w-5', `text-${item.color}-600`)} />
                <span className="text-sm text-base-muted flex-1">{item.label}</span>
                <span className="font-semibold text-base-strong">{item.value}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4" onClick={() => navigate('environment')}>
            View Full Dashboard
          </Button>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {achievements.filter(a => a.unlocked).map(a => {
              const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] || Icons.Award;
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950">
                  <div className="h-10 w-10 rounded-xl bg-eco-gradient flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-base-strong">{a.name}</p>
                    <p className="text-xs text-base-muted">{a.desc}</p>
                  </div>
                  <Icons.CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              );
            })}
            {achievements.filter(a => !a.unlocked).slice(0, 2).map(a => {
              const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] || Icons.Award;
              return (
                <div key={a.id} className="p-3 rounded-xl bg-surface-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-surface-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-base-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-base-strong">{a.name}</p>
                      <p className="text-xs text-base-muted">{a.desc}</p>
                    </div>
                  </div>
                  <Progress value={a.progress || 0} size="sm" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
