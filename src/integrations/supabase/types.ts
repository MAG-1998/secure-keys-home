export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      halal_finance_doc_requests: {
        Row: {
          communication_id: string | null
          created_at: string | null
          deadline_at: string | null
          description: string | null
          document_type: string
          file_url: string | null
          halal_financing_request_id: string
          id: string
          priority: string | null
          requested_by: string
          response_notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          communication_id?: string | null
          created_at?: string | null
          deadline_at?: string | null
          description?: string | null
          document_type: string
          file_url?: string | null
          halal_financing_request_id: string
          id?: string
          priority?: string | null
          requested_by: string
          response_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          communication_id?: string | null
          created_at?: string | null
          deadline_at?: string | null
          description?: string | null
          document_type?: string
          file_url?: string | null
          halal_financing_request_id?: string
          id?: string
          priority?: string | null
          requested_by?: string
          response_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "halal_finance_doc_requests_halal_financing_request_id_fkey"
            columns: ["halal_financing_request_id"]
            isOneToOne: false
            referencedRelation: "halal_financing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      halal_financing_activity_log: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string | null
          details: Json | null
          halal_financing_request_id: string
          id: string
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string | null
          details?: Json | null
          halal_financing_request_id: string
          id?: string
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string | null
          details?: Json | null
          halal_financing_request_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "halal_financing_activity_log_halal_financing_request_id_fkey"
            columns: ["halal_financing_request_id"]
            isOneToOne: false
            referencedRelation: "halal_financing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      halal_financing_communications: {
        Row: {
          content: string | null
          created_at: string | null
          file_urls: Json | null
          halal_financing_request_id: string
          id: string
          is_internal: boolean | null
          message_type: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_urls?: Json | null
          halal_financing_request_id: string
          id?: string
          is_internal?: boolean | null
          message_type?: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_urls?: Json | null
          halal_financing_request_id?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "halal_financing_communications_halal_financing_request_id_fkey"
            columns: ["halal_financing_request_id"]
            isOneToOne: false
            referencedRelation: "halal_financing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      halal_financing_requests: {
        Row: {
          admin_notes: string | null
          attachments: Json
          cash_available: number | null
          created_at: string | null
          id: string
          moderator_notes: string | null
          period_months: number | null
          property_id: string
          request_notes: string | null
          requested_amount: number | null
          responsible_person_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          stage: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json
          cash_available?: number | null
          created_at?: string | null
          id?: string
          moderator_notes?: string | null
          period_months?: number | null
          property_id: string
          request_notes?: string | null
          requested_amount?: number | null
          responsible_person_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json
          cash_available?: number | null
          created_at?: string | null
          id?: string
          moderator_notes?: string | null
          period_months?: number | null
          property_id?: string
          request_notes?: string | null
          requested_amount?: number | null
          responsible_person_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "halal_financing_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          property_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          ticket_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          property_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          ticket_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          property_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_audit_log: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          ip_address: unknown | null
          order_id: string | null
          payment_method: string
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          payment_method: string
          status: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          payment_method?: string
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          language: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          cash_min_percent: number | null
          created_at: string
          description: string | null
          display_name: string
          district: string | null
          documents: Json | null
          halal_approved_at: string | null
          halal_approved_by: string | null
          halal_approved_once: boolean | null
          halal_financing_requested: boolean | null
          halal_financing_status: string | null
          halal_status: string | null
          id: string
          image_url: string | null
          is_halal_available: boolean | null
          is_halal_financed: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          moderator_notes: string | null
          period_options: Json | null
          photos: Json | null
          price: number
          property_type: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          virtual_tour: boolean | null
          visit_hours: Json | null
        }
        Insert: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cash_min_percent?: number | null
          created_at?: string
          description?: string | null
          display_name: string
          district?: string | null
          documents?: Json | null
          halal_approved_at?: string | null
          halal_approved_by?: string | null
          halal_approved_once?: boolean | null
          halal_financing_requested?: boolean | null
          halal_financing_status?: string | null
          halal_status?: string | null
          id?: string
          image_url?: string | null
          is_halal_available?: boolean | null
          is_halal_financed?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          moderator_notes?: string | null
          period_options?: Json | null
          photos?: Json | null
          price: number
          property_type?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          virtual_tour?: boolean | null
          visit_hours?: Json | null
        }
        Update: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cash_min_percent?: number | null
          created_at?: string
          description?: string | null
          display_name?: string
          district?: string | null
          documents?: Json | null
          halal_approved_at?: string | null
          halal_approved_by?: string | null
          halal_approved_once?: boolean | null
          halal_financing_requested?: boolean | null
          halal_financing_status?: string | null
          halal_status?: string | null
          id?: string
          image_url?: string | null
          is_halal_available?: boolean | null
          is_halal_financed?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          moderator_notes?: string | null
          period_options?: Json | null
          photos?: Json | null
          price?: number
          property_type?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          virtual_tour?: boolean | null
          visit_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      property_photos: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          property_id: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number
          property_id: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          property_id?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          id: string
          ip_address: unknown | null
          property_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          property_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          property_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      property_visits: {
        Row: {
          created_at: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          id: string
          is_custom_time: boolean | null
          is_paid_visit: boolean | null
          notes: string | null
          owner_review: string | null
          payment_amount: number | null
          payment_status: string | null
          property_id: string
          review_submitted_at: string | null
          status: string | null
          updated_at: string
          visit_date: string
          visitor_id: string
          visitor_showed_up: boolean | null
        }
        Insert: {
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          is_custom_time?: boolean | null
          is_paid_visit?: boolean | null
          notes?: string | null
          owner_review?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          property_id: string
          review_submitted_at?: string | null
          status?: string | null
          updated_at?: string
          visit_date: string
          visitor_id: string
          visitor_showed_up?: boolean | null
        }
        Update: {
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          is_custom_time?: boolean | null
          is_paid_visit?: boolean | null
          notes?: string | null
          owner_review?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          property_id?: string
          review_submitted_at?: string | null
          status?: string | null
          updated_at?: string
          visit_date?: string
          visitor_id?: string
          visitor_showed_up?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "property_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_visits_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      red_list: {
        Row: {
          banned_by: string
          created_at: string
          email: string | null
          id: string
          phone: string | null
          reason: string | null
        }
        Insert: {
          banned_by: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reason?: string | null
        }
        Update: {
          banned_by?: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      rejected_properties: {
        Row: {
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string | null
          documents: Json
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          photos: Json
          previous_status: string | null
          price: number | null
          property_id: string
          property_type: string | null
          reject_reason: string | null
          rejected_at: string
          rejected_by: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          documents?: Json
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          photos?: Json
          previous_status?: string | null
          price?: number | null
          property_id: string
          property_type?: string | null
          reject_reason?: string | null
          rejected_at?: string
          rejected_by?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          documents?: Json
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          photos?: Json
          previous_status?: string | null
          price?: number | null
          property_id?: string
          property_type?: string | null
          reject_reason?: string | null
          rejected_at?: string
          rejected_by?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      role_audit_log: {
        Row: {
          action: string
          changed_by: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_role: string
          old_role: string | null
          target_user_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          changed_by: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_role: string
          old_role?: string | null
          target_user_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_role?: string
          old_role?: string | null
          target_user_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          id: string
          property_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          property_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          property_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          auto_tags: string[]
          closed_at: string | null
          created_at: string
          escalation_level: number
          first_response_at: string | null
          id: string
          initial_message: string | null
          last_agent_message_at: string | null
          last_user_message_at: string | null
          next_escalation_at: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          property_id: string | null
          sla_response_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string | null
          type: Database["public"]["Enums"]["ticket_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          auto_tags?: string[]
          closed_at?: string | null
          created_at?: string
          escalation_level?: number
          first_response_at?: string | null
          id?: string
          initial_message?: string | null
          last_agent_message_at?: string | null
          last_user_message_at?: string | null
          next_escalation_at?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          property_id?: string | null
          sla_response_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          auto_tags?: string[]
          closed_at?: string | null
          created_at?: string
          escalation_level?: number
          first_response_at?: string | null
          id?: string
          initial_message?: string | null
          last_agent_message_at?: string | null
          last_user_message_at?: string | null
          next_escalation_at?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          property_id?: string | null
          sla_response_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          decision: string | null
          id: string
          message_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          decision?: string | null
          id?: string
          message_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          decision?: string | null
          id?: string
          message_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      visit_restrictions: {
        Row: {
          created_at: string
          id: string
          is_permanent: boolean | null
          reason: string | null
          restricted_by: string
          restricted_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_permanent?: boolean | null
          reason?: string | null
          restricted_by: string
          restricted_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_permanent?: boolean | null
          reason?: string | null
          restricted_by?: string
          restricted_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: {
          changed_by_user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      auto_expire_visits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      can_user_create_visit_request: {
        Args: { user_id_param: string }
        Returns: {
          can_create: boolean
          free_visits_used: number
          is_restricted: boolean
          reason: string
        }[]
      }
      create_property_from_application: {
        Args: { application_id: string }
        Returns: string
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      fn_escalate_tickets: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_least_loaded_moderator: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_safe_profile_for_messaging: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          display_name: string
          user_id: string
          user_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_payment_request: {
        Args: {
          amount_param: number
          currency_param: string
          ip_addr?: unknown
          method_param: string
          user_agent_str?: string
          user_id_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
      ticket_priority: "low" | "medium" | "high"
      ticket_status: "open" | "in_progress" | "escalated" | "closed"
      ticket_type: "general" | "financing" | "complaint"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "moderator", "admin"],
      ticket_priority: ["low", "medium", "high"],
      ticket_status: ["open", "in_progress", "escalated", "closed"],
      ticket_type: ["general", "financing", "complaint"],
    },
  },
} as const
