import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Calendar, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AnimatedCounter from '@/components/AnimatedCounter';
import { LeafIcon, FlagIcon } from '@/components/decor/Decor';

type Stats = {
  total_signatures: number;
  upcoming_distributions: number;
  total_distributions: number;
  cities_count: number;
};

type DeptRow = { dept_code: string; signatures: number };
type CityRow = { postal_code: string; signatures: number };

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [byDept, setByDept] = useState<DeptRow[]>([]);
  const [topCities, setTopCities] = useState<CityRow[]>([]);

  useEffect(() => {
    document.title = 'Les chiffres — Pas de pesticides pour nos enfants';
    let cancelled = false;
    (async () => {
      const [{ data: s }, { data: d }, { data: c }] = await Promise.all([
        supabase.from('public_stats').select('*').single(),
        supabase.from('public_signatures_by_department').select('*'),
        supabase.from('public_top_cities').select('*'),
      ]);
      if (cancelled) return;
      if (s) setStats(s as Stats);
      if (d) setByDept(d as DeptRow[]);
      if (c) setTopCities(c as CityRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxDeptSig = byDept[0]?.signatures ?? 0;

  return (
    <section className="bg-bca-cream py-12 md:py-16 relative overflow-hidden">
      <LeafIcon className="absolute top-6 left-4 w-16 h-16 md:w-24 md:h-24 opacity-30" aria-hidden />
      <FlagIcon className="absolute bottom-12 right-6 w-16 h-16 md:w-20 md:h-20 opacity-30" aria-hidden />

      <div className="container mx-auto px-4 max-w-5xl relative">
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Tableau de bord
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2 mb-3">
          La mobilisation en chiffres
        </h1>
        <p className="text-ink-muted md:text-lg mb-10">
          Mis à jour en temps réel. Plus on est nombreux·euses, plus on pèse.
        </p>

        {/* Compteurs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Counter
            icon={<Users />}
            label="Signataires"
            value={stats?.total_signatures ?? null}
            color="bg-bca-green-dark text-bca-cream"
          />
          <Counter
            icon={<MapPin />}
            label="Distributions à venir"
            value={stats?.upcoming_distributions ?? null}
            color="bg-bca-orange text-white"
          />
          <Counter
            icon={<Calendar />}
            label="Distributions au total"
            value={stats?.total_distributions ?? null}
            color="bg-bca-yellow text-bca-green-dark"
          />
          <Counter
            icon={<Building />}
            label="Communes mobilisées"
            value={stats?.cities_count ?? null}
            color="bg-bca-green-light text-bca-green-dark"
          />
        </div>

        {/* Top départements */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4">
              Top 10 départements
            </h2>
            {byDept.length === 0 ? (
              <p className="text-sm text-ink-muted">Pas encore de données.</p>
            ) : (
              <ol className="space-y-2">
                {byDept.slice(0, 10).map((d, i) => (
                  <li key={d.dept_code} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-ink-muted text-right">
                      {i + 1}.
                    </span>
                    <span className="w-12 font-mono text-sm font-semibold">
                      {d.dept_code}
                    </span>
                    <div className="flex-1 h-3 bg-bca-cream rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bca-green-dark"
                        style={{ width: `${(d.signatures / maxDeptSig) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm font-semibold tabular-nums">
                      {d.signatures.toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Top communes */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4">
              Top 10 codes postaux
            </h2>
            {topCities.length === 0 ? (
              <p className="text-sm text-ink-muted">Pas encore de données.</p>
            ) : (
              <ol className="space-y-2">
                {topCities.map((c, i) => (
                  <li
                    key={c.postal_code}
                    className="flex items-center justify-between py-1 border-b border-bca-cream last:border-b-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 text-sm text-ink-muted text-right">
                        {i + 1}.
                      </span>
                      <span className="font-mono font-semibold">{c.postal_code}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {c.signatures.toLocaleString('fr-FR')} signature
                      {c.signatures > 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="mt-12 bg-bca-green-dark text-bca-cream rounded-2xl p-8 text-center">
          <p className="font-display text-2xl md:text-3xl mb-2">
            Votre département n'est pas dans le top ?
          </p>
          <p className="text-bca-cream/85 mb-5">
            Faites tourner la pétition autour de vous, organisez une distribution :
            chaque commune compte.
          </p>
          <Link to="/signer" className="btn-primary">
            Signer maintenant
          </Link>
        </div>
      </div>
    </section>
  );
}

const Counter = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  color: string;
}) => (
  <div className={`rounded-2xl p-5 ${color} shadow-sm`}>
    <div className="opacity-80 mb-2">{icon}</div>
    <p className="text-sm opacity-85">{label}</p>
    <p className="font-display text-4xl md:text-5xl mt-1 leading-none">
      <AnimatedCounter value={value} />
    </p>
  </div>
);
