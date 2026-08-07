import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import {
  Upload, Scan, Camera, CheckCircle2, AlertTriangle, Sparkles,
  Cpu, FileSearch, ShieldAlert, ArrowRight, Eye,
} from 'lucide-react';

export function AIPage() {
  const { navigate } = useNav();
  const [uploaded, setUploaded] = useState(false);

  const detections = [
    { label: 'PET Bottle', confidence: 98, box: '15%, 20%, 40%, 50%', color: 'emerald' },
    { label: 'PET Bottle', confidence: 96, box: '60%, 50%, 25%, 35%', color: 'emerald' },
    { label: 'HDPE Cap', confidence: 89, box: '80%, 10%, 10%, 15%', color: 'sky' },
  ];

  const fraudAlerts = [
    { type: 'Duplicate Image', detail: 'Image hash matches submission from Jul 24', severity: 'high' },
    { type: 'Weight Discrepancy', detail: 'AI estimate 20.4 kg vs claimed 35 kg', severity: 'medium' },
  ];

  const timeline = [
    { step: 'Image uploaded', time: '10:32 AM', icon: Upload, done: true },
    { step: 'Preprocessing', time: '10:32 AM', icon: Cpu, done: true },
    { step: 'Object detection', time: '10:32 AM', icon: Scan, done: true },
    { step: 'Classification', time: '10:32 AM', icon: FileSearch, done: true },
    { step: 'Fraud check', time: '10:33 AM', icon: ShieldAlert, done: true },
    { step: 'Results ready', time: '10:33 AM', icon: CheckCircle2, done: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">AI Detection Dashboard</h1>
        <p className="text-base-muted mt-1">Upload plastic photos for AI-powered detection and verification</p>
      </div>

      {/* Upload */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Upload for Detection</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <button
            onClick={() => setUploaded(true)}
            className={cn(
              'aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all',
              uploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-base hover:border-emerald-400 hover:bg-surface-subtle'
            )}
          >
            {uploaded ? (
              <>
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <img src="https://images.pexels.com/photos/5719837/pexels-photo-5719837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Uploaded" className="w-full h-full object-cover" />
                  <div className="absolute left-[10%] top-[15%] w-[35%] h-[55%] border-2 border-emerald-400 rounded-lg" style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }}>
                    <span className="absolute -top-6 left-0 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">PET 98%</span>
                  </div>
                  <div className="absolute left-[55%] top-[50%] w-[30%] h-[35%] border-2 border-sky-400 rounded-lg" style={{ boxShadow: '0 0 0 4px rgba(14,165,233,0.2)' }}>
                    <span className="absolute -top-6 left-0 bg-sky-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">PET 96%</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-surface-subtle flex items-center justify-center">
                  <Camera className="h-7 w-7 text-base-muted" />
                </div>
                <p className="font-semibold text-base-strong">Upload plastic photo</p>
                <p className="text-xs text-base-muted">JPG, PNG up to 10MB</p>
              </>
            )}
          </button>

          <div className="space-y-4">
            {uploaded ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Type', value: 'PET', color: 'text-emerald-600' },
                    { label: 'Weight', value: '20.4 kg', color: 'text-sky-600' },
                    { label: 'Confidence', value: '98%', color: 'text-teal-600' },
                  ].map(r => (
                    <div key={r.label} className="rounded-xl bg-surface-subtle p-4 text-center">
                      <p className="text-xs text-base-muted">{r.label}</p>
                      <p className={cn('font-display text-xl font-bold mt-1', r.color)}>{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Detection passed</span>
                  </div>
                  <p className="text-xs text-base-muted">3 objects detected · No fraud indicators</p>
                </div>
                <Button onClick={() => navigate('sell')}>Create Listing <ArrowRight className="h-4 w-4" /></Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-base-strong">How AI detection works</p>
                {[
                  { icon: Cpu, title: 'Computer Vision', desc: 'YOLO-based object detection identifies plastic items' },
                  { icon: Scan, title: 'Classification', desc: 'Plastic type (PET, HDPE, PP, etc.) with confidence scores' },
                  { icon: ShieldAlert, title: 'Fraud Prevention', desc: 'Duplicate detection and weight discrepancy checks' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <div className="h-9 w-9 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-strong">{item.title}</p>
                      <p className="text-xs text-base-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Detection details */}
      {uploaded && (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Detected Objects</h3>
              <div className="space-y-3">
                {detections.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center',
                      d.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-sky-50 dark:bg-sky-950'
                    )}>
                      <Eye className={cn('h-5 w-5', d.color === 'emerald' ? 'text-emerald-600' : 'text-sky-600')} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-base-strong">{d.label}</p>
                      <p className="text-xs text-base-muted">Box: {d.box}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base-strong">{d.confidence}%</p>
                      <Progress value={d.confidence} size="sm" className="w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Processing Timeline</h3>
              <div className="space-y-3">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      t.done ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-surface-subtle'
                    )}>
                      <t.icon className={cn('h-4 w-4', t.done ? 'text-emerald-600' : 'text-base-muted')} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-base-strong">{t.step}</p>
                    </div>
                    <span className="text-xs text-base-muted">{t.time}</span>
                    {t.done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Fraud alerts */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <h3 className="font-display text-lg font-semibold text-base-strong">Fraud Detection</h3>
            </div>
            <div className="space-y-3">
              {fraudAlerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-base-strong">{alert.type}</p>
                    <p className="text-xs text-base-muted">{alert.detail}</p>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'red' : 'amber'}>{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
