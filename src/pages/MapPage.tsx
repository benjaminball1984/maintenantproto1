import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import maplibregl, { type Map as MlMap, type Marker } from 'maplibre-gl';
import { format, parseISO, startOfWeek, addDays, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Filter, MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  fetchPublicDistributions,
  statusForDate,
  type PublicDistribution,
} from '@/lib/distributions';

type TypeFilter = 'all' | 'ecole' | 'college' | 'lycee' | 'autre';
type PeriodFilter = 'all' | 'week' | 'month';

const FRANCE_CENTER: [number, number] = [2.5, 46.5];

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

function statusColor(s: ReturnType<typeof statusForDate>): string {
  switch (s) {
    case 'soon':
      return '#E76F4A';
    case 'upcoming':
      return '#9DBE6F';
    case 'past':
    default:
      return '#A6B6BB';
  }
}

function normalizeType(s: string | null | undefined): TypeFilter {
  const v = (s ?? '').toLowerCase();
  if (v.includes('ecole') || v.includes('école')) return 'ecole';
  if (v.includes('coll')) return 'college';
  if (v.includes('lyc')) return 'lycee';
  return 'autre';
}

export default function MapPage() {
  const [params] = useSearchParams();
  const focusId = params.get('focus');
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [distributions, setDistributions] = useState<PublicDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  useEffect(() => {
    document.title = 'Carte des mobilisations — Pas de pesticides pour nos enfants';
  }, []);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicDistributions().then((d) => {
      if (!cancelled) {
        setDistributions(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: FRANCE_CENTER,
      zoom: 5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Filter list
  const filtered = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 7);
    const monthEnd = addDays(now, 30);

    return distributions.filter((d) => {
      if (typeFilter !== 'all' && normalizeType(d.establishment_type) !== typeFilter) {
        return false;
      }
      if (periodFilter === 'week') {
        return isWithinInterval(parseISO(d.date), { start: weekStart, end: weekEnd });
      }
      if (periodFilter === 'month') {
        return isWithinInterval(parseISO(d.date), { start: now, end: monthEnd });
      }
      return true;
    });
  }, [distributions, typeFilter, periodFilter]);

  // Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const d of filtered) {
      if (!d.latitude || !d.longitude) continue;
      const status = statusForDate(d.date);
      const el = document.createElement('div');
      el.className = 'pdp-marker';
      el.style.cssText = `width:18px;height:18px;border-radius:50%;background:${statusColor(status)};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;`;
      if (d.id === focusId) {
        el.style.width = '26px';
        el.style.height = '26px';
        el.style.borderColor = '#F2C53D';
        el.style.borderWidth = '3px';
      }

      const popup = new maplibregl.Popup({ offset: 14, closeButton: true }).setHTML(
        renderPopup(d),
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([d.longitude, d.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);

      if (d.id === focusId) {
        map.flyTo({ center: [d.longitude, d.latitude], zoom: 12, duration: 1200 });
        marker.togglePopup();
      }
    }
  }, [filtered, focusId]);

  return (
    <section className="bg-bca-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Mobilisation
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2">
          La carte des distributions
        </h1>
        <p className="text-ink-muted mt-3 md:text-lg">
          {filtered.length > 0 ? (
            <>
              <strong className="text-bca-green-dark">{filtered.length}</strong>{' '}
              distribution{filtered.length > 1 ? 's' : ''} prévue
              {filtered.length > 1 ? 's' : ''} en France
            </>
          ) : loading ? (
            'Chargement…'
          ) : (
            'Aucune distribution prévue pour le moment.'
          )}
        </p>

        {/* Filtres */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-ink-muted flex items-center gap-1">
            <Filter size={14} aria-hidden /> Filtrer
          </span>
          <Pills
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              ['all', 'Tous'],
              ['ecole', 'Écoles'],
              ['college', 'Collèges'],
              ['lycee', 'Lycées'],
              ['autre', 'Autres lieux'],
            ]}
          />
          <Pills
            value={periodFilter}
            onChange={setPeriodFilter}
            options={[
              ['all', 'Toutes périodes'],
              ['week', 'Cette semaine'],
              ['month', 'Ce mois'],
            ]}
          />
        </div>

        {/* Carte */}
        <div className="mt-6 rounded-2xl overflow-hidden border border-bca-green-dark/10 shadow-sm">
          <div ref={containerRef} className="w-full h-[460px] md:h-[600px] bg-bca-cream" />
        </div>

        <p className="mt-3 text-xs text-ink-muted flex items-center gap-3">
          <Legend color="#9DBE6F" label="À venir" />
          <Legend color="#E76F4A" label="Aujourd'hui ou demain" />
        </p>

        {/* Agenda */}
        <h2 className="mt-12 font-display text-3xl text-bca-green-dark flex items-center gap-2">
          <Calendar size={26} aria-hidden /> Agenda
        </h2>
        {filtered.length === 0 ? (
          <p className="text-ink-muted mt-3">
            Aucune distribution à venir avec ces filtres.{' '}
            <Link to="/organiser" className="underline text-bca-green-dark">
              Soyez le·la premier·ière à en organiser une
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((d) => (
              <li key={d.id} className="bg-white rounded-2xl p-4 border border-bca-green-dark/10">
                <p className="text-sm text-bca-orange font-semibold">
                  {format(parseISO(d.date), 'EEEE d MMMM', { locale: fr })} ·{' '}
                  {d.start_time?.slice(0, 5)} → {d.end_time?.slice(0, 5)}
                </p>
                <p className="font-semibold text-ink mt-1">
                  {d.location_name ?? 'Lieu à confirmer'}
                </p>
                {d.city && (
                  <p className="text-sm text-ink-muted">
                    <MapPin size={12} className="inline -mt-0.5 mr-1" aria-hidden />
                    {d.postal_code} {d.city}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 text-center">
          <Link to="/organiser" className="btn-primary">
            Organiser ma distribution
          </Link>
        </div>
      </div>
    </section>
  );
}

function renderPopup(d: PublicDistribution) {
  const dateStr = format(parseISO(d.date), 'EEEE d MMMM yyyy', { locale: fr });
  return `<div style="font-family:Inter,sans-serif;color:#1A1A1A;padding:4px;min-width:200px;">
    <p style="margin:0 0 4px;font-size:12px;color:#E76F4A;font-weight:600;">${dateStr}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#666;">${(d.start_time ?? '').slice(0, 5)} → ${(d.end_time ?? '').slice(0, 5)}</p>
    <p style="margin:6px 0 4px;font-weight:600;">${(d.location_name ?? 'Lieu à confirmer').replace(/</g, '&lt;')}</p>
    ${d.city ? `<p style="margin:0;font-size:13px;color:#666;">${d.postal_code ?? ''} ${(d.city ?? '').replace(/</g, '&lt;')}</p>` : ''}
  </div>`;
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-block w-3 h-3 rounded-full border border-white" style={{ background: color }} />
    {label}
  </span>
);

function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex flex-wrap gap-1 bg-white rounded-full p-1 border border-bca-green-dark/10">
      {options.map(([k, lbl]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === k
              ? 'bg-bca-green-dark text-bca-cream'
              : 'text-ink hover:bg-bca-cream'
          }`}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}
