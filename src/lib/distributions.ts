import { supabase } from './supabase';

export type PublicDistribution = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  establishment_uai: string | null;
  location_name: string | null;
  establishment_type: string | null;
  postal_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  is_organizer_contactable: boolean;
};

export async function fetchPublicDistributions(): Promise<PublicDistribution[]> {
  const { data, error } = await supabase
    .from('public_distributions')
    .select(
      'id, date, start_time, end_time, establishment_uai, location_name, establishment_type, postal_code, city, latitude, longitude, is_organizer_contactable',
    )
    .order('date', { ascending: true });
  if (error) {
    console.error('[distributions] fetch failed', error);
    return [];
  }
  return (data ?? []) as PublicDistribution[];
}

export type DistributionStatus = 'past' | 'soon' | 'upcoming';

export function statusForDate(dateStr: string): DistributionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diff = (target.getTime() - today.getTime()) / 86_400_000;
  if (diff < 0) return 'past';
  if (diff <= 1) return 'soon';
  return 'upcoming';
}
