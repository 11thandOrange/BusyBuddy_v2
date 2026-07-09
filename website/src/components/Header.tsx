import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/cn';

const NAV = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
];

const INSTALL_URL = 'https://apps.shopify.com/busybuddy';

export function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-surface-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-container-lg items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-1.5 text-xl font-bold shrink-0">
          <span className="text-brand">Busy</span>
          <span className="text-white">Buddy</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-7 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'transition-fast',
                location.pathname === item.href ? 'text-white font-medium' : 'text-content-secondary hover:text-white'
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <a
          href={INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-button bg-brand px-4 py-2 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover"
        >
          Install <ArrowUpRight size={14} />
        </a>
      </div>
    </header>
  );
}
