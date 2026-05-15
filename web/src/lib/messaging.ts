import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ConversationRow = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

/**
 * Messagerie 1-1. Toutes les requêtes ci-dessous reposent sur la RLS stricte
 * définie dans db/schema.sql §15 (RGPD : DM = données perso) :
 *   - `conv_select_party` / `conv_insert_party` : seules les deux parties
 *     (user_a / user_b) accèdent à la conversation.
 *   - `messages_select_party` / `messages_insert_party` : seules les deux
 *     parties lisent / écrivent dans la conversation.
 *   - `messages_update_sender` : les utilisateurs ne peuvent pas modifier
 *     le `body` d'un message — la mise à jour est restreinte aux admins
 *     (modération). Le marquage `read_at` du destinataire passe par une
 *     mise à jour du champ `read_at` ; côté front on persiste néanmoins le
 *     « last_read_at » côté conversation pour éviter un round-trip massif.
 *
 * Côté front, on n'expose AUCUNE fonction de lecture de DM d'un tiers : tout
 * appel passe par auth.uid() implicite. Si la RLS échoue, l'appel renvoie
 * simplement `data: []` (les rows sont filtrées avant d'arriver).
 */
export const MESSAGE_BODY_MIN = 1;
export const MESSAGE_BODY_MAX = 4000;

export interface ConversationResult {
  data: ConversationRow | null;
  error: PostgrestError | null;
}

export interface ConversationListResult {
  data: ConversationRow[];
  error: PostgrestError | null;
}

export interface MessageResult {
  data: MessageRow | null;
  error: PostgrestError | null;
}

export interface MessageListResult {
  data: MessageRow[];
  error: PostgrestError | null;
}

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  body: string;
}

export type SendMessageField = 'body';

export interface MessageValidationIssue {
  field: SendMessageField;
  message: string;
}

export function validateMessageInput(input: SendMessageInput): MessageValidationIssue[] {
  const issues: MessageValidationIssue[] = [];
  const body = input.body.trim();
  if (body.length < MESSAGE_BODY_MIN || body.length > MESSAGE_BODY_MAX) {
    issues.push({
      field: 'body',
      message: `Le message doit faire entre ${MESSAGE_BODY_MIN} et ${MESSAGE_BODY_MAX} caractères.`,
    });
  }
  return issues;
}

/**
 * Liste les conversations de `userId`. Tri par `last_message_at DESC` puis
 * `created_at DESC` (les conversations sans message remontent en queue). La
 * RLS filtre déjà : seules les conversations où auth.uid() = user_a/user_b
 * sont retournées.
 */
export async function listConversations(userId: string): Promise<ConversationListResult> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

/** Lit une conversation par ID. RLS filtre. */
export async function getConversation(id: string): Promise<ConversationResult> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/**
 * Trouve la conversation 1-1 entre deux utilisateurs (peu importe l'ordre)
 * ou la crée si elle n'existe pas. Le pair `(least, greatest)` est unique
 * côté DB — voir db/schema.sql §15.
 */
export async function findOrCreateConversation(
  userA: string,
  userB: string,
): Promise<ConversationResult> {
  if (userA === userB) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Impossible d’ouvrir une conversation avec vous-même.',
        details: '',
        hint: 'userB',
        code: 'CONVERSATION_SELF',
      }),
    };
  }
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`,
    )
    .maybeSingle();
  if (findError) {
    return { data: null, error: findError };
  }
  if (existing) {
    return { data: existing, error: null };
  }
  const insert: ConversationInsert = { user_a: userA, user_b: userB };
  const { data, error } = await supabase
    .from('conversations')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

export interface GetOrCreateConversationResult {
  data: { id: string } | null;
  error: PostgrestError | null;
}

/**
 * Wrapper « bouton Contacter » : résout l'utilisateur authentifié via
 * `supabase.auth.getUser()` puis délègue à `findOrCreateConversation`.
 * Renvoie un objet `{ id }` minimaliste pour faciliter la navigation
 * vers `/messaging/:id`. Si l'utilisateur n'est pas authentifié·e, un
 * code d'erreur `AUTH_REQUIRED` est retourné (la RLS aurait de toute
 * façon rejeté l'INSERT côté DB).
 */
export async function getOrCreateConversationWith(
  targetUserId: string,
): Promise<GetOrCreateConversationResult> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Vous devez être connecté·e pour contacter cette personne.',
        details: '',
        hint: '',
        code: 'AUTH_REQUIRED',
      }),
    };
  }
  const { data, error } = await findOrCreateConversation(userData.user.id, targetUserId);
  if (error) {
    return { data: null, error };
  }
  if (!data) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Conversation introuvable.',
        details: '',
        hint: '',
        code: 'CONVERSATION_NOT_FOUND',
      }),
    };
  }
  return { data: { id: data.id }, error: null };
}

/**
 * Liste les messages d'une conversation. Tri ASC pour affichage chronologique.
 * RLS filtre : seules les deux parties accèdent aux messages. Si l'utilisateur
 * courant n'est pas partie de la conversation, `data` sera vide.
 */
export async function listMessages(
  conversationId: string,
  limit = 200,
): Promise<MessageListResult> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return { data: data ?? [], error };
}

/**
 * Envoie un message dans une conversation existante. RLS impose
 * `auth.uid() = sender_id` ET appartenance à la conversation.
 * Côté DB, le trigger touch_conversation_last_message_at met à jour le
 * timestamp ; côté front on rafraîchit ensuite la liste des conversations.
 */
export async function sendMessage(input: SendMessageInput): Promise<MessageResult> {
  const issues = validateMessageInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'MESSAGE_VALIDATION',
      }),
    };
  }
  const insert: MessageInsert = {
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    body: input.body.trim(),
  };
  const { data, error } = await supabase
    .from('messages')
    .insert(insert)
    .select('*')
    .maybeSingle();
  if (data && !error) {
    await supabase
      .from('conversations')
      .update({ last_message_at: data.created_at })
      .eq('id', input.conversationId);
  }
  return { data, error };
}

/**
 * Renvoie l'identifiant de l'« autre » membre d'une conversation 1-1 du
 * point de vue de `viewerId`. Utile pour afficher le nom du correspondant.
 */
export function otherParty(conversation: ConversationRow, viewerId: string): string {
  return conversation.user_a === viewerId ? conversation.user_b : conversation.user_a;
}
