import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Progress } from '@/components/ui/Progress';
import { cn, formatCoin } from '@/lib/utils';
import {
  Upload, Camera, Scan, CheckCircle2, Truck, Calendar, MapPin,
  ArrowRight, ArrowLeft, Recycle, Sparkles, AlertCircle, FileText,
} from 'lucide-react';

const plasticTypes = [
  { id: 'PET', name: 'PET Bottles', rate: 10, icon: '🥤' },
  { id: 'HDPE', name: 'HDPE Containers', rate: 8, icon: '🧴' },
  { id: 'PP', name: 'Polypropylene', rate: 7, icon: '📦' },
  { id: 'LDPE', name: 'LDPE Bags', rate: 5, icon: '🛍️' },
  { id: 'PVC', name: 'PVC Pipes', rate: 4, icon: '🔧' },
  { id: 'PS', name: 'Polystyrene', rate: 3, icon: '☕' },
];

export function SellPlasticPage() {
  const { navigate } = useNav();
  const [step, setStep] = useState(1);
  const [plasticType, setPlasticType] = useState('PET');
  const [weight, setWeight] = useState(20);
  const [quality, setQuality] = useState<'clean' | 'mixed' | 'contaminated'>('clean');
  const [uploaded, setUploaded] = useState(false);

  const baseCoins = weight * 10;
  const qualityMultiplier = quality === 'clean' ? 1.2 : quality === 'mixed' ? 1.0 : 0.7;
  const estimatedCoins = Math.round(baseCoins * qualityMultiplier);

  const steps = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'AI Verify', icon: Scan },
    { id: 3, label: 'Details', icon: FileText },
    { id: 4, label: 'Pickup', icon: Truck },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">Sell Your Plastic</h1>
        <p className="text-base-muted mt-1">Upload, get AI-verified, and schedule a free pickup to earn Nature Coins.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center transition-all',
              step === s.id ? 'bg-emerald-600 text-white shadow-glow' :
              step > s.id ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-surface-subtle text-base-muted'
            )}>
              {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
            </div>
            <span className={cn('text-sm font-medium hidden sm:block', step === s.id ? 'text-base-strong' : 'text-base-muted')}>{s.label}</span>
            {i < steps.length - 1 && <div className={cn('flex-1 h-px', step > s.id ? 'bg-emerald-300' : 'bg-base')} />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Upload Plastic Photos</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setUploaded(true)}
              className={cn(
                'aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all',
                uploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-base hover:border-emerald-400 hover:bg-surface-subtle'
              )}
            >
              {uploaded ? (
                <>
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  <p className="font-semibold text-emerald-600">Photo uploaded!</p>
                  <p className="text-xs text-base-muted">plastic_bottles.jpg · 2.4 MB</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-surface-subtle flex items-center justify-center">
                    <Camera className="h-7 w-7 text-base-muted" />
                  </div>
                  <p className="font-semibold text-base-strong">Tap to upload</p>
                  <p className="text-xs text-base-muted">JPG, PNG up to 10MB</p>
                </>
              )}
            </button>
            <div className="space-y-3">
              <div className="rounded-xl bg-surface-subtle p-4">
                <p className="text-sm font-semibold text-base-strong mb-2">Tips for best results</p>
                <ul className="space-y-1.5 text-xs text-base-muted">
                  <li className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-emerald-500" /> Good lighting helps AI detect better</li>
                  <li className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-emerald-500" /> Show all plastic items in one photo</li>
                  <li className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-emerald-500" /> Clean, sorted plastic earns bonus coins</li>
                </ul>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CoinIcon size={18} />
                  <span className="text-sm font-semibold text-base-strong">Earn more with quality</span>
                </div>
                <p className="text-xs text-base-muted">Clean PET can earn up to 20% bonus coins</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => navigate('dashboard')}><ArrowLeft className="h-4 w-4" /> Cancel</Button>
            <Button disabled={!uploaded} onClick={() => setStep(2)}>Run AI Detection <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {/* Step 2: AI Detection */}
      {step === 2 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold text-base-strong">AI Detection Results</h3>
            <Badge variant="emerald" dot>98% confidence</Badge>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden bg-surface-subtle relative" style={{ aspectRatio: '4/3' }}>
              <img src="https://images.pexels.com/photos/5719837/pexels-photo-5719837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Detection" className="w-full h-full object-cover" />
              <div className="absolute left-[10%] top-[15%] w-[35%] h-[55%] border-2 border-emerald-400 rounded-lg" style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }}>
                <span className="absolute -top-6 left-0 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">PET 98%</span>
              </div>
              <div className="absolute left-[55%] top-[50%] w-[30%] h-[35%] border-2 border-sky-400 rounded-lg" style={{ boxShadow: '0 0 0 4px rgba(14,165,233,0.2)' }}>
                <span className="absolute -top-6 left-0 bg-sky-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">PET 96%</span>
              </div>
              <div className="absolute top-3 right-3 glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Scan className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-base-strong">Verified</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Plastic Type', value: 'PET', icon: Recycle, color: 'emerald' },
                  { label: 'Est. Weight', value: '20.4 kg', icon: Recycle, color: 'sky' },
                  { label: 'Confidence', value: '98%', icon: Sparkles, color: 'teal' },
                  { label: 'Items Detected', value: '47', icon: Recycle, color: 'emerald' },
                ].map(r => (
                  <div key={r.label} className="rounded-xl bg-surface-subtle p-4">
                    <p className="text-xs text-base-muted">{r.label}</p>
                    <p className={cn('font-display text-xl font-bold mt-1', `text-${r.color}-600`)}>{r.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Fraud check passed</span>
                </div>
                <p className="text-xs text-base-muted">No duplicate images or suspicious patterns detected.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-base-muted">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                AI results are estimates. Final coins are based on collector's verified weight.
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <Button onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-5">Listing Details</h3>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-base-strong mb-2">Plastic Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {plasticTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPlasticType(t.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                      plasticType === t.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-base hover:border-emerald-300'
                    )}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-base-strong">{t.name}</p>
                      <p className="text-xs text-base-muted">{t.rate} coins/kg</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-base-strong">Estimated Weight</p>
                <span className="font-display text-lg font-bold text-base-strong">{weight} kg</span>
              </div>
              <input type="range" min="1" max="100" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-base-muted mt-1">
                <span>1 kg</span><span>50 kg</span><span>100 kg</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-base-strong mb-2">Quality Grade</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'clean', label: 'Clean & Sorted', desc: '+20% bonus', mult: 1.2 },
                  { id: 'mixed', label: 'Mixed Types', desc: 'Standard rate', mult: 1.0 },
                  { id: 'contaminated', label: 'Contaminated', desc: '-30% penalty', mult: 0.7 },
                ].map(q => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id as 'clean' | 'mixed' | 'contaminated')}
                    className={cn(
                      'p-3 rounded-xl border-2 text-center transition-all',
                      quality === q.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-base hover:border-emerald-300'
                    )}
                  >
                    <p className="text-sm font-semibold text-base-strong">{q.label}</p>
                    <p className="text-xs text-base-muted mt-0.5">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reward estimate */}
            <div className="rounded-2xl bg-gradient-to-br from-coin-50 to-amber-50 dark:from-coin-950 dark:to-slate-900 border border-coin-200 dark:border-coin-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-muted">Estimated Reward</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CoinIcon size={28} />
                    <span className="font-display text-3xl font-bold coin-text">{formatCoin(estimatedCoins)}</span>
                    <span className="text-sm text-base-muted">coins</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-base-muted">Internal Value</p>
                  <p className="font-display text-xl font-bold text-base-strong">₹{(estimatedCoins * 0.5).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <Button onClick={() => setStep(4)}>Schedule Pickup <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {/* Step 4: Pickup */}
      {step === 4 && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-5">Schedule Pickup</h3>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-base-strong mb-2">Pickup Date</p>
                <div className="grid grid-cols-4 gap-2">
                  {['Today', 'Tomorrow', 'Jul 31', 'Aug 1'].map((d, i) => (
                    <button key={d} className={cn('p-3 rounded-xl border-2 text-center transition-all', i === 0 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-base hover:border-emerald-300')}>
                      <p className="text-xs font-semibold text-base-strong">{d}</p>
                      <p className="text-xs text-base-muted">{['4 PM', '10 AM', '2 PM', '11 AM'][i]}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-base-strong mb-2">Pickup Address</p>
                <div className="rounded-xl border border-base p-4 flex gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-base-strong">Home</p>
                    <p className="text-xs text-base-muted">12 MG Road, Pune, 411001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-subtle p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-eco-gradient flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-base-strong">Assigned Collector</p>
                  <p className="text-sm text-base-muted">Rajesh K. · 4.9 ★ · 2.3 km away</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-base-muted">
                <Calendar className="h-4 w-4 text-emerald-500" /> Today, 4:00 PM · Free pickup
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-coin-50 to-amber-50 dark:from-coin-950 dark:to-slate-900 border border-coin-200 dark:border-coin-900 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CoinIcon size={28} />
                <div>
                  <p className="font-display text-2xl font-bold coin-text">{formatCoin(estimatedCoins)} coins</p>
                  <p className="text-xs text-base-muted">Estimated reward (final based on verified weight)</p>
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <Button onClick={() => navigate('dashboard')}>Confirm Pickup <CheckCircle2 className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}
    </div>
  );
}
