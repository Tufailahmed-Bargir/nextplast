import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { cn } from '@/lib/utils';
import { FileBarChart, Download, Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ReportsPage() {
  const reports = [
    { id: 'RPT-001', name: 'Monthly Recycling Summary', period: 'July 2025', status: 'ready', date: 'Jul 29' },
    { id: 'RPT-002', name: 'Collector Performance Report', period: 'Q2 2025', status: 'ready', date: 'Jul 15' },
    { id: 'RPT-003', name: 'Marketplace Sales Report', period: 'July 2025', status: 'processing', date: 'Jul 29' },
    { id: 'RPT-004', name: 'Fraud Detection Report', period: 'July 2025', status: 'ready', date: 'Jul 28' },
    { id: 'RPT-005', name: 'Environmental Impact Report', period: '2025 YTD', status: 'ready', date: 'Jul 25' },
    { id: 'RPT-006', name: 'User Growth Analytics', period: 'Q2 2025', status: 'ready', date: 'Jul 10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-strong">Reports</h1>
          <p className="text-base-muted mt-1">Generate and download platform reports</p>
        </div>
        <Button><FileBarChart className="h-4 w-4" /> Generate Report</Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Reports Generated', value: '48', icon: FileBarChart },
          { label: 'This Month', value: '12', icon: Calendar },
          { label: 'Avg Processing', value: '2.4s', icon: TrendingUp },
          { label: 'Fraud Alerts', value: '3', icon: AlertTriangle },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-surface-subtle flex items-center justify-center">
                <s.icon className="h-5 w-5 text-base-muted" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-base-strong">{s.value}</p>
                <p className="text-xs text-base-muted">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reports list */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Available Reports</h3>
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-subtle hover:bg-surface-muted transition-colors">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                r.status === 'ready' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-amber-50 dark:bg-amber-950'
              )}>
                {r.status === 'ready' ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Calendar className="h-6 w-6 text-amber-600 animate-spin-slow" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base-strong">{r.name}</p>
                <p className="text-xs text-base-muted">{r.id} · {r.period} · Generated {r.date}</p>
              </div>
              <Badge variant={r.status === 'ready' ? 'emerald' : 'amber'} dot>{r.status}</Badge>
              <Button variant="outline" size="sm" disabled={r.status !== 'ready'}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
