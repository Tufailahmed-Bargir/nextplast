import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { Logo, CoinIcon } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Mail, Lock, User, ArrowRight, Leaf, Recycle, ShieldCheck } from 'lucide-react';

export function AuthPage() {
  const { params, navigate } = useNav();
  const [mode, setMode] = useState<'login' | 'register'>((params.mode as 'login' | 'register') || 'login');

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <button onClick={() => navigate('landing')}>
            <Logo className="[&_span]:text-white" />
          </button>
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-6">
              <Leaf className="h-3 w-3" /> Join the circular economy
            </Badge>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Turn waste into worth.<br />Earn while you heal the planet.
            </h2>
            <div className="mt-10 space-y-4">
              {[
                { icon: Recycle, text: 'AI-powered plastic detection in seconds' },
                { icon: CoinIcon, text: 'Earn Nature Coins for every gram recycled' },
                { icon: ShieldCheck, text: 'Verified collectors & secure transactions' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-emerald-50">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-emerald-100/80">© 2025 NexPlast. Built for a circular future.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <button onClick={() => navigate('landing')}><Logo /></button>
          </div>

          <h1 className="font-display text-3xl font-bold text-base-strong">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-base-muted">
            {mode === 'login' ? 'Log in to your NexPlast account' : 'Join NexPlast and start earning Nature Coins'}
          </p>

          <div className="mt-8 space-y-4">
            {mode === 'register' && (
              <Input label="Full name" placeholder="Aarav Patel" icon={<User className="h-4 w-4" />} />
            )}
            <Input label="Email address" type="email" placeholder="you@email.com" icon={<Mail className="h-4 w-4" />} />
            <Input label="Password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} />
            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-base-muted cursor-pointer">
                  <input type="checkbox" className="rounded border-base text-emerald-600 focus:ring-emerald-500/30" />
                  Remember me
                </label>
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</a>
              </div>
            )}
            <Button className="w-full" size="lg" onClick={() => navigate('dashboard')}>
              {mode === 'login' ? 'Log in' : 'Create account'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base" /></div>
            <div className="relative flex justify-center"><span className="bg-surface px-4 text-xs text-base-muted">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="md" onClick={() => navigate('dashboard')}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate('dashboard')}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.844.991-2.22 1.75-3.562 1.75-.137 0-.27-.013-.404-.027-.013-.013-.013-.026-.013-.026 0-1.14.534-2.267 1.218-3.075.858-.991 2.314-1.75 3.656-1.75.013 0 .026 0 .04.013.013 0 .013 0 .013.013ZM20.5 17.5c-.5 1.5-2.5 4.5-4.5 4.5s-2.5-1-4-1-2.5 1-4 1-4-3-4.5-4.5C2.5 14 3 9 5.5 9c1.5 0 2.5 1 4 1s2.5-1 4-1c2.5 0 3 5 3 8.5Z"/></svg>
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-base-muted">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-emerald-600 hover:text-emerald-700 font-semibold">
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
