import { useNav } from '@/lib/nav';
import { Logo } from '@/components/Brand';
import { CoinIcon } from '@/components/Brand';
import { Mail, Twitter, Github, Linkedin } from 'lucide-react';

const cols = [
  { title: 'Platform', links: ['How It Works', 'AI Detection', 'Marketplace', 'Nature Coins', 'Environmental Impact'] },
  { title: 'For Business', links: ['For Collectors', 'For Recyclers', 'For Admins', 'API Access', 'Partnerships'] },
  { title: 'Company', links: ['About Us', 'Careers', 'Press Kit', 'Blog', 'Contact'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Coin Policy', 'Cookie Policy', 'Security'] },
];

export function Footer() {
  const { navigate } = useNav();
  return (
    <footer className="border-t border-base bg-surface-subtle pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-base-muted max-w-xs leading-relaxed">
              An AI-powered circular economy platform turning plastic waste into Nature Coin rewards and eco products.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg border border-base flex items-center justify-center text-base-muted hover:text-emerald-600 hover:border-emerald-300 transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm text-base-strong mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-base-muted hover:text-base-strong transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-base">
          <p className="text-xs text-base-muted">© 2025 NexPlast. Built for a circular future.</p>
          <div className="flex items-center gap-2 text-xs text-base-muted">
            <CoinIcon size={16} />
            <span>1 Nature Coin = 100 g recycled plastic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
