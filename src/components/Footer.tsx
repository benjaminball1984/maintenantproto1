import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Youtube, Cloud } from 'lucide-react';

const SOCIALS = [
  { href: 'https://www.instagram.com/bioconsomacteurs/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.facebook.com/bioconsomacteurs/', icon: Facebook, label: 'Facebook' },
  {
    href: 'https://bsky.app/profile/bioconsomacteurs.org',
    icon: Cloud,
    label: 'Bluesky',
  },
  { href: 'https://www.linkedin.com/company/bca-idf/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://www.youtube.com/@bioconsomacteursBCA', icon: Youtube, label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-bca-green-dark text-bca-cream">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <a
            href="https://bioconsomacteurs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-bca-cream rounded-xl p-3"
            aria-label="Site Bio Consom'acteurs"
          >
            <img
              src="/images/logo-bca.svg"
              alt="Bio Consom'acteurs"
              className="h-12 w-auto"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
          <p className="mt-3 text-sm leading-relaxed text-bca-cream/85">
            Pétition portée par <strong>Bio Consom'acteurs</strong>
            <br />
            10 rue Beaumarchais, 93100 Montreuil
          </p>
          <a
            href="https://www.helloasso.com/associations/bio-consom-acteurs/formulaires/1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-4 !py-2 !px-4 !text-sm"
          >
            Faire un don à BCA
          </a>
        </div>

        <div>
          <h3 className="font-display text-xl text-bca-yellow mb-3">Suivre BCA</h3>
          <ul className="flex flex-wrap gap-2">
            {SOCIALS.map(({ href, icon: Icon, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-bca-yellow hover:text-bca-green-dark transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-bca-yellow mb-3">Liens utiles</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/mentions-legales" className="hover:text-bca-yellow underline-offset-2 hover:underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                to="/politique-confidentialite"
                className="hover:text-bca-yellow underline-offset-2 hover:underline"
              >
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-bca-yellow underline-offset-2 hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <a
                href="mailto:contact@bioconsomacteurs.org"
                className="hover:text-bca-yellow underline-offset-2 hover:underline"
              >
                contact@bioconsomacteurs.org
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs text-bca-cream/70 text-center">
          © {new Date().getFullYear()} Bio Consom'acteurs — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
