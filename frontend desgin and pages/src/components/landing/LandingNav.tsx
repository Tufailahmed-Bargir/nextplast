import { useNav } from '@/lib/nav';
import { Logo } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { Menu, X, Moon, Sun, Recycle } from 'lucide-react';
import { useState } from 'react';

const links = [
  { label: 'What is NexPlast', href: '#what' },
  { label: 'How It Works', href: '#how' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Impact', href: '#impact' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNav() {
  const { navigate } = useNav();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 glass border-b border-base/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.href} href={l.href} className="px-3.5 py-2 text-sm font-medium text-base-muted hover:text-base-strong transition-colors rounded-lg hover:bg-surface-subtle">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2.5 rounded-lg text-base-muted hover:text-base-strong hover:bg-surface-subtle transition-colors">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('auth', { mode: 'login' })}>
            Log in
          </Button>
          <Button size="sm" onClick={() => navigate('auth', { mode: 'register' })} className="hidden sm:inline-flex">
            Get Started
          </Button>
          <button className="md:hidden p-2.5 rounded-lg text-base-strong" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-base glass animate-slide-up">
          <div className="px-5 py-4 space-y-1">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-base-muted hover:text-base-strong rounded-lg hover:bg-surface-subtle">
                {l.label}
              </a>
            ))}
            <div className="pt-2 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('auth', { mode: 'login' })}>Log in</Button>
              <Button size="sm" className="flex-1" onClick={() => navigate('auth', { mode: 'register' })}>Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
