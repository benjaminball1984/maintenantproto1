import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const HIDE_THRESHOLD = 100;

export default function SignatureCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('public_signature_count')
          .select('total')
          .single();
        if (!cancelled && !error && data) {
          setCount(Number((data as { total: number }).total));
        }
      } catch {
        // pas grave : compteur masqué
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null || count <= HIDE_THRESHOLD) return null;

  return (
    <p className="mt-4 text-bca-cream/95 text-base md:text-lg font-medium">
      <span className="font-display text-2xl md:text-3xl text-bca-yellow">
        {count.toLocaleString('fr-FR')}
      </span>{' '}
      signataires nous rejoignent déjà
    </p>
  );
}
