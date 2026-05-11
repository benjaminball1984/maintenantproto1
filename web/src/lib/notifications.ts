import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type NotificationKind = NotificationRow['kind'];

export interface ListNotificationsParams {
  unreadOnly?: boolean | undefined;
  limit?: number | undefined;
}

export interface ListNotificationsResult {
  data: NotificationRow[];
  error: PostgrestError | null;
}

export interface NotificationResult {
  data: NotificationRow | null;
  error: PostgrestError | null;
}

/**
 * Liste les notifications de l'utilisateur courant. RLS impose
 * `auth.uid() = recipient_id` (cf. db/schema.sql §15 — privé : seul le
 * destinataire lit ses notifications). On filtre côté serveur sur
 * `recipient_id` pour ne pas dépendre uniquement de la RLS (défense en
 * profondeur).
 */
export async function listNotifications(
  recipientId: string,
  params: ListNotificationsParams = {},
): Promise<ListNotificationsResult> {
  const limit = params.limit ?? 100;
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.unreadOnly) {
    query = query.is('read_at', null);
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Compte le nombre de notifications non lues. */
export async function countUnread(
  recipientId: string,
): Promise<{ count: number; error: PostgrestError | null }> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .is('read_at', null);
  return { count: count ?? 0, error };
}

/**
 * Marque une notification comme lue. RLS update : `auth.uid() = recipient_id`.
 * Renvoie la ligne mise à jour pour permettre au front d'actualiser l'état
 * local sans refetch complet.
 */
export async function markNotificationRead(id: string): Promise<NotificationResult> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Repasse une notification en non-lue (réinitialise read_at). */
export async function markNotificationUnread(id: string): Promise<NotificationResult> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: null })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/**
 * Marque toutes les notifications de `recipientId` comme lues. Pratique pour
 * le bouton « tout marquer comme lu » de la page notifications.
 */
export async function markAllNotificationsRead(
  recipientId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', recipientId)
    .is('read_at', null);
  return { error };
}

/** Supprime une notification. RLS delete : recipient lui-même ou admin. */
export async function deleteNotification(
  id: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  return { error };
}
