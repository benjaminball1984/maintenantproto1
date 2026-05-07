import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/#petition', label: 'La pétition' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bca-green-dark text-bca-cream shadow-md">
      <div className="bg-black/20 text-[11px] md:text-xs">
        <div className="container mx-auto px-4 py-1.5 text-center">
          Une initiative de{' '}
          <a
            href="https://bioconsomacteurs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-bca-yellow"
          >
            Bio Consom'acteurs
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium hover:text-bca-yellow transition-colors',
                  isActive && item.to !== '/#petition' && 'text-bca-yellow',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/signer" className="btn-secondary !py-2 !px-4 !text-sm">
            Signer
          </Link>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-bca-green-dark border-t border-white/10">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-2 text-base font-medium hover:text-bca-yellow"
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/signer"
              onClick={() => setOpen(false)}
              className="btn-secondary mt-2 self-start"
            >
              Signer la pétition
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
