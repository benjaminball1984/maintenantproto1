import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ESTABLISHMENT_TYPE_LABEL,
  loadEstablishments,
  searchEstablishments,
  type Establishment,
  type EstablishmentTuple,
} from '@/lib/establishments';
import { Search, MapPin, Loader2 } from 'lucide-react';

type Props = {
  value: Establishment | null;
  onChange: (e: Establishment | null) => void;
  onUseCustom: () => void;
};

export default function EstablishmentAutocomplete({ value, onChange, onUseCustom }: Props) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EstablishmentTuple[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2 || data) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadEstablishments()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("Impossible de charger l'annuaire des établissements.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, data]);

  const results = useMemo(() => {
    if (!data) return [] as Establishment[];
    return searchEstablishments(data, query, 10);
  }, [data, query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={inputId} className="block text-sm font-medium text-ink mb-1">
        Établissement <span className="text-alert">*</span>
      </label>

      {value ? (
        <div className="rounded-xl border border-bca-green-dark/30 bg-bca-cream px-4 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-bca-green-dark truncate">{value.name}</p>
            <p className="text-sm text-ink-muted">
              {ESTABLISHMENT_TYPE_LABEL[value.type]} · {value.postalCode} {value.city}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery('');
              setOpen(true);
            }}
            className="text-sm underline text-bca-green-dark whitespace-nowrap hover:text-alert"
          >
            Changer
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
              aria-hidden
            />
            <input
              id={inputId}
              type="search"
              autoComplete="off"
              placeholder="Nom, code postal ou commune…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="w-full rounded-xl border border-ink/15 bg-white pl-10 pr-4 py-3 text-base outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20"
            />
            {loading && (
              <Loader2
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-bca-green-dark"
                aria-hidden
              />
            )}
          </div>

          {open && query.length >= 2 && (
            <div
              role="listbox"
              className="absolute z-20 mt-1 w-full rounded-xl border border-bca-green-dark/15 bg-white shadow-lg max-h-80 overflow-auto"
            >
              {error ? (
                <p className="p-4 text-sm text-alert">{error}</p>
              ) : results.length === 0 && !loading ? (
                <div className="p-3">
                  <p className="text-sm text-ink-muted px-2 py-2">
                    Aucun établissement trouvé pour « {query} ».
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onUseCustom();
                      setOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-bca-cream text-sm font-medium text-bca-green-dark"
                  >
                    <MapPin size={14} className="inline mr-2 -mt-0.5" /> Utiliser un autre lieu (marché, place, etc.)
                  </button>
                </div>
              ) : (
                <ul>
                  {results.map((e) => (
                    <li key={e.uai} role="option">
                      <button
                        type="button"
                        onClick={() => {
                          onChange(e);
                          setOpen(false);
                          setQuery('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-bca-cream border-b border-bca-green-dark/5 last:border-b-0"
                      >
                        <p className="font-medium text-ink truncate">{e.name}</p>
                        <p className="text-sm text-ink-muted">
                          {ESTABLISHMENT_TYPE_LABEL[e.type]} · {e.postalCode} {e.city}
                        </p>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onUseCustom();
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-bca-green-dark hover:bg-bca-cream border-t border-bca-green-dark/10"
                    >
                      <MapPin size={14} className="inline mr-2 -mt-0.5" /> Aucun ne convient — autre lieu
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
