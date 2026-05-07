import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Calendar, Share2, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LeafIcon, FlagIcon } from '@/components/decor/Decor';
import { supabase } from '@/lib/supabase';

type DistributionView = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string | null;
  city: string | null;
  postal_code: string | null;
};

export default function OrganizeConfirmationPage() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [info, setInfo] = useState<DistributionView | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Distribution enregistrée — Pas de pesticides pour nos enfants';
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('public_distributions')
        .select('id, date, start_time, end_time, location_name, city, postal_code')
        .eq('id', id)
        .single();
      if (!cancelled && data) setInfo(data as DistributionView);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const dateText = useMemo(() => {
    if (!info?.date) return null;
    try {
      return format(parseISO(info.date), 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return info.date;
    }
  }, [info?.date]);

  const shareUrl = `${window.location.origin}/`;
  const shareText = "Signez la pétition « Pas de pesticides pour nos enfants » :";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <section className="bg-bca-cream min-h-[60vh] py-16 relative overflow-hidden">
      <LeafIcon className="absolute top-10 left-6 w-20 h-20 md:w-28 md:h-28 opacity-50" aria-hidden />
      <FlagIcon className="absolute bottom-10 right-6 w-16 h-16 md:w-24 md:h-24 opacity-50" aria-hidden />

      <div className="container mx-auto px-4 max-w-2xl relative">
        <div className="text-center mb-8">
          <CheckCircle2 size={56} className="mx-auto text-bca-green-light" aria-hidden />
          <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-4">
            Ta distribution est enregistrée !
          </h1>
        </div>

        {info && (
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6 mb-8 text-base">
            <p className="flex items-center gap-2 text-lg">
              <Calendar size={18} className="text-bca-orange" aria-hidden />
              <strong>{dateText}</strong> — {info.start_time?.slice(0, 5)} → {info.end_time?.slice(0, 5)}
            </p>
            <p className="flex items-center gap-2 mt-2 text-lg">
              <MapPin size={18} className="text-bca-orange" aria-hidden />
              <strong>{info.location_name}</strong>
              {info.city && (
                <span className="text-ink-muted text-base">
                  · {info.postal_code} {info.city}
                </span>
              )}
            </p>
          </div>
        )}

        <p className="text-ink mb-2">
          Vous allez recevoir un mail récapitulatif et un rappel la veille.
        </p>
        <p className="text-ink-muted mb-8">
          Encore merci pour votre engagement.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <Link to={`/carte${info ? `?focus=${info.id}` : ''}`} className="btn-secondary">
            <MapPin size={18} aria-hidden /> Voir sur la carte
          </Link>
          <Link to="/comment-distribuer" className="btn-ghost">
            Fiche pratique
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-white border border-bca-green-dark/10 p-6">
          <h2 className="font-display text-xl text-bca-green-dark mb-3 flex items-center gap-2">
            <Share2 size={20} aria-hidden /> Inviter des proches à signer
          </h2>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary !py-2 !px-4 !text-sm"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Pas de pesticides pour nos enfants')}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              className="btn-secondary !py-2 !px-4 !text-sm"
            >
              Email
            </a>
            <button
              type="button"
              onClick={onCopy}
              className="btn-ghost !py-2 !px-4 !text-sm"
            >
              <Copy size={14} /> {copied ? 'Copié !' : 'Copier le lien'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
