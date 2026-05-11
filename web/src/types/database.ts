// =====================================================================================
// AUTO-GENERATED — do not edit manually.
// Source : db/schema.sql appliqué à un Postgres local, introspection via db/gen-types.mjs.
// Compatible avec `import type { Database } from '@/types/database'` côté front.
// Régénérer après chaque migration : `node db/gen-types.mjs > web/src/types/database.ts`.
// =====================================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      adhesions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'gratuit' | 'soutien' | 'engage';
          status: 'active' | 'cancelled' | 'expired' | 'pending';
          amount_eur: number;
          stripe_subscription_id: string | null;
          starts_on: string;
          ends_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: 'gratuit' | 'soutien' | 'engage';
          status?: 'active' | 'cancelled' | 'expired' | 'pending';
          amount_eur?: number;
          stripe_subscription_id?: string | null;
          starts_on?: string;
          ends_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'gratuit' | 'soutien' | 'engage';
          status?: 'active' | 'cancelled' | 'expired' | 'pending';
          amount_eur?: number;
          stripe_subscription_id?: string | null;
          starts_on?: string;
          ends_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'adhesions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          target_table: string | null;
          target_id: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          target_table?: string | null;
          target_id?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          target_table?: string | null;
          target_id?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_logs_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      articles: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          cover_url: string | null;
          format: string;
          status: 'draft' | 'published' | 'archived' | 'flagged';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          cover_url?: string | null;
          format: string;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          body?: string;
          cover_url?: string | null;
          format?: string;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'articles_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      campaign_actions: {
        Row: {
          id: string;
          campaign_id: string;
          petition_id: string | null;
          mobilization_id: string | null;
          poll_id: string | null;
          crowdfunding_id: string | null;
          label: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          petition_id?: string | null;
          mobilization_id?: string | null;
          poll_id?: string | null;
          crowdfunding_id?: string | null;
          label?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          petition_id?: string | null;
          mobilization_id?: string | null;
          poll_id?: string | null;
          crowdfunding_id?: string | null;
          label?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaign_actions_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_actions_crowdfunding_id_fkey';
            columns: ['crowdfunding_id'];
            isOneToOne: false;
            referencedRelation: 'crowdfunding_campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_actions_mobilization_id_fkey';
            columns: ['mobilization_id'];
            isOneToOne: false;
            referencedRelation: 'mobilizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_actions_petition_id_fkey';
            columns: ['petition_id'];
            isOneToOne: false;
            referencedRelation: 'petitions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaign_actions_poll_id_fkey';
            columns: ['poll_id'];
            isOneToOne: false;
            referencedRelation: 'polls';
            referencedColumns: ['id'];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string | null;
          cover_url: string | null;
          status: 'draft' | 'published' | 'archived' | 'flagged';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          summary: string;
          body?: string | null;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          body?: string | null;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaigns_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      carpooling: {
        Row: {
          id: string;
          driver_id: string;
          origin_city: string;
          destination_city: string;
          departs_at: string;
          seats: number;
          price_eur: number;
          notes: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          origin_city: string;
          destination_city: string;
          departs_at: string;
          seats: number;
          price_eur?: number;
          notes?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          origin_city?: string;
          destination_city?: string;
          departs_at?: string;
          seats?: number;
          price_eur?: number;
          notes?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'carpooling_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          article_id: string;
          author_id: string;
          body: string;
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          author_id: string;
          body: string;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          author_id?: string;
          body?: string;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      commune_members: {
        Row: {
          id: string;
          commune_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          commune_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          commune_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'commune_members_commune_id_fkey';
            columns: ['commune_id'];
            isOneToOne: false;
            referencedRelation: 'communes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'commune_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      communes: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string;
          description: string | null;
          treasurer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          city: string;
          description?: string | null;
          treasurer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          city?: string;
          description?: string | null;
          treasurer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'communes_treasurer_id_fkey';
            columns: ['treasurer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      contributions: {
        Row: {
          id: string;
          campaign_id: string;
          contributor_id: string;
          amount_eur: number;
          stripe_payment_intent: string | null;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          contributor_id: string;
          amount_eur: number;
          stripe_payment_intent?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          contributor_id?: string;
          amount_eur?: number;
          stripe_payment_intent?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contributions_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'crowdfunding_campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contributions_contributor_id_fkey';
            columns: ['contributor_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          user_a: string;
          user_b: string;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a: string;
          user_b: string;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_a?: string;
          user_b?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_user_a_fkey';
            columns: ['user_a'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_user_b_fkey';
            columns: ['user_b'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      crowdfunding_campaigns: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string | null;
          goal_eur: number;
          raised_eur: number;
          cover_url: string | null;
          status: 'draft' | 'published' | 'archived' | 'flagged';
          starts_at: string;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          slug: string;
          summary: string;
          body?: string | null;
          goal_eur: number;
          raised_eur?: number;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          body?: string | null;
          goal_eur?: number;
          raised_eur?: number;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'crowdfunding_campaigns_organizer_id_fkey';
            columns: ['organizer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      email_campaigns: {
        Row: {
          id: string;
          author_id: string;
          subject: string;
          body_html: string;
          audience: string;
          status: string;
          scheduled_for: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          subject: string;
          body_html: string;
          audience: string;
          status?: string;
          scheduled_for?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          subject?: string;
          body_html?: string;
          audience?: string;
          status?: string;
          scheduled_for?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'email_campaigns_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      garden_plots: {
        Row: {
          id: string;
          manager_id: string;
          name: string;
          description: string | null;
          city: string;
          size_sqm: number | null;
          available_spots: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          manager_id: string;
          name: string;
          description?: string | null;
          city: string;
          size_sqm?: number | null;
          available_spots?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          manager_id?: string;
          name?: string;
          description?: string | null;
          city?: string;
          size_sqm?: number | null;
          available_spots?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'garden_plots_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      housing: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string;
          city: string;
          capacity: number;
          available_from: string | null;
          available_to: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description: string;
          city: string;
          capacity: number;
          available_from?: string | null;
          available_to?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string;
          city?: string;
          capacity?: number;
          available_from?: string | null;
          available_to?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'housing_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      housing_requests: {
        Row: {
          id: string;
          housing_id: string;
          requester_id: string;
          message: string;
          starts_on: string;
          ends_on: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          housing_id: string;
          requester_id: string;
          message: string;
          starts_on: string;
          ends_on: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          housing_id?: string;
          requester_id?: string;
          message?: string;
          starts_on?: string;
          ends_on?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'housing_requests_housing_id_fkey';
            columns: ['housing_id'];
            isOneToOne: false;
            referencedRelation: 'housing';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'housing_requests_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      lending: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          category: string;
          city: string;
          t99cp_cost: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          category: string;
          city: string;
          t99cp_cost?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          city?: string;
          t99cp_cost?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lending_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      marketplace_items: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string | null;
          category: string;
          city: string;
          price_eur: number | null;
          t99cp_cost: number | null;
          is_sold: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description?: string | null;
          category: string;
          city: string;
          price_eur?: number | null;
          t99cp_cost?: number | null;
          is_sold?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          city?: string;
          price_eur?: number | null;
          t99cp_cost?: number | null;
          is_sold?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'marketplace_items_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          member_number: string | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          member_number?: string | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          member_number?: string | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      mobilizations: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string | null;
          starts_at: string;
          ends_at: string | null;
          city: string;
          address: string | null;
          cover_url: string | null;
          status: 'draft' | 'published' | 'archived' | 'flagged';
          participation_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          slug: string;
          summary: string;
          body?: string | null;
          starts_at: string;
          ends_at?: string | null;
          city: string;
          address?: string | null;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          participation_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          body?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          city?: string;
          address?: string | null;
          cover_url?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          participation_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mobilizations_organizer_id_fkey';
            columns: ['organizer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          kind:
            | 'petition_signed'
            | 'mobilization_rsvp'
            | 'message'
            | 'comment'
            | 'reaction'
            | 'campaign'
            | 'system'
            | 'admin';
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          kind:
            | 'petition_signed'
            | 'mobilization_rsvp'
            | 'message'
            | 'comment'
            | 'reaction'
            | 'campaign'
            | 'system'
            | 'admin';
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          kind?:
            | 'petition_signed'
            | 'mobilization_rsvp'
            | 'message'
            | 'comment'
            | 'reaction'
            | 'campaign'
            | 'system'
            | 'admin';
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      participations: {
        Row: {
          id: string;
          mobilization_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          mobilization_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          mobilization_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'participations_mobilization_id_fkey';
            columns: ['mobilization_id'];
            isOneToOne: false;
            referencedRelation: 'mobilizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'participations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      petitions: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          target_count: number;
          cover_url: string | null;
          category: string;
          status: 'draft' | 'published' | 'archived' | 'flagged';
          signature_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          target_count?: number;
          cover_url?: string | null;
          category: string;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          signature_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          body?: string;
          target_count?: number;
          cover_url?: string | null;
          category?: string;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          signature_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'petitions_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          label: string;
          position: number;
          vote_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          label: string;
          position?: number;
          vote_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          label?: string;
          position?: number;
          vote_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'poll_options_poll_id_fkey';
            columns: ['poll_id'];
            isOneToOne: false;
            referencedRelation: 'polls';
            referencedColumns: ['id'];
          },
        ];
      };
      polls: {
        Row: {
          id: string;
          author_id: string;
          slug: string;
          question: string;
          description: string | null;
          members_only: boolean;
          closes_at: string | null;
          status: 'draft' | 'published' | 'archived' | 'flagged';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          slug: string;
          question: string;
          description?: string | null;
          members_only?: boolean;
          closes_at?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          slug?: string;
          question?: string;
          description?: string | null;
          members_only?: boolean;
          closes_at?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'flagged';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'polls_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          body?: string;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          body: string;
          media_urls: Json;
          visibility: 'public' | 'members' | 'private';
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          body: string;
          media_urls?: Json;
          visibility?: 'public' | 'members' | 'private';
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          body?: string;
          media_urls?: Json;
          visibility?: 'public' | 'members' | 'private';
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      reactions: {
        Row: {
          id: string;
          article_id: string;
          user_id: string;
          kind: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_id: string;
          kind: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_id?: string;
          kind?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reactions_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sel_demands: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          city: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          city: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          city?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sel_demands_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sel_offers: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          city: string;
          t99cp_rate: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          city: string;
          t99cp_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          city?: string;
          t99cp_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sel_offers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      signatures: {
        Row: {
          id: string;
          petition_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          petition_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          petition_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'signatures_petition_id_fkey';
            columns: ['petition_id'];
            isOneToOne: false;
            referencedRelation: 'petitions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'signatures_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      t99cp_transactions: {
        Row: {
          id: string;
          user_id: string;
          kind: 'credit' | 'debit';
          amount: number;
          reason: string;
          related_table: string | null;
          related_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: 'credit' | 'debit';
          amount: number;
          reason: string;
          related_table?: string | null;
          related_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: 'credit' | 'debit';
          amount?: number;
          reason?: string;
          related_table?: string | null;
          related_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 't99cp_transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          postal_code: string | null;
          is_admin: boolean;
          t99cp_balance: number;
          badges: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          postal_code?: string | null;
          is_admin?: boolean;
          t99cp_balance?: number;
          badges?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          postal_code?: string | null;
          is_admin?: boolean;
          t99cp_balance?: number;
          badges?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'poll_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_poll_id_fkey';
            columns: ['poll_id'];
            isOneToOne: false;
            referencedRelation: 'polls';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      credit_t99cp: {
        Args: { p_user: string; p_amount: number; p_reason: string };
        Returns: void;
      };
      debit_t99cp: {
        Args: { p_user: string; p_amount: number; p_reason: string };
        Returns: void;
      };
      slugify: {
        Args: { input: string };
        Returns: string;
      };
    };
    Enums: {
      adhesion_status: 'active' | 'cancelled' | 'expired' | 'pending';
      adhesion_tier: 'gratuit' | 'soutien' | 'engage';
      content_status: 'draft' | 'published' | 'archived' | 'flagged';
      notification_kind:
        | 'petition_signed'
        | 'mobilization_rsvp'
        | 'message'
        | 'comment'
        | 'reaction'
        | 'campaign'
        | 'system'
        | 'admin';
      post_visibility: 'public' | 'members' | 'private';
      t99cp_kind: 'credit' | 'debit';
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
