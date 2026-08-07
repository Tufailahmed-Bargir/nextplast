import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Scan, Camera, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

export function AIDetection() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <section id="what" className="py-24 bg-surface">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className={`reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
            <Badge variant="sky" className="mb-4">AI Detection</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">
              AI that sees plastic like an expert
            </h2>
            <p className="mt-4 text-lg text-base-muted leading-relaxed">
              Our computer vision model identifies plastic types (PET, HDPE, PP, LDPE, and more), estimates weight and quality, and flags suspicious submissions — all from a single photo.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Camera, title: 'Snap & upload', desc: 'Take a photo of your plastic waste from any angle.' },
                { icon: Cpu, title: 'Real-time inference', desc: 'Bounding boxes, type classification, and confidence scores in under 2 seconds.' },
                { icon: CheckCircle2, title: 'Quality grading', desc: 'Clean, sorted plastic earns bonus coins. Contaminated plastic is flagged.' },
                { icon: AlertTriangle, title: 'Fraud detection', desc: 'Duplicate images, fake weights, and suspicious patterns are caught automatically.' },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-base-strong">{item.title}</p>
                    <p className="text-sm text-base-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-6 relative overflow-hidden group">
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative" style={{ aspectRatio: '4/3' }}>
              <img src="https://images.pexels.com/photos/5719818/pexels-photo-5719818.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="AI detection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute left-[15%] top-[20%] w-[40%] h-[50%] border-2 border-emerald-400 rounded-lg animate-pulse" style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }} />
                <div className="absolute left-[60%] top-[55%] w-[25%] h-[30%] border-2 border-sky-400 rounded-lg" style={{ boxShadow: '0 0 0 4px rgba(14,165,233,0.2)' }} />
              </div>
              <div className="absolute left-[15%] top-[20%] -translate-y-full mt-[-4px]">
                <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-soft">PET 98%</span>
              </div>
              <div className="absolute left-[60%] top-[55%] -translate-y-full mt-[-4px]">
                <span className="bg-sky-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-soft">HDPE 94%</span>
              </div>
              <div className="absolute top-3 right-3 glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Scan className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-base-strong">Analyzing…</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-xs text-base-muted">Type</p>
                <p className="font-display font-bold text-base-strong">PET</p>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-xs text-base-muted">Est. Weight</p>
                <p className="font-display font-bold text-base-strong">20.4 kg</p>
              </div>
              <div className="rounded-xl bg-surface-subtle p-3 text-center">
                <p className="text-xs text-base-muted">Confidence</p>
                <p className="font-display font-bold text-emerald-600">98%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
