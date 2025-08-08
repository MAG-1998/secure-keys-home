export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      halal_financing_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          property_id: string
          request_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          property_id: string
          request_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          property_id?: string
          request_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
          created_at: string
          description: string | null
          documents: Json | null
          halal_financing_requested: boolean | null
          halal_financing_status: string | null
          id: string
          image_url: string | null
          is_halal_financed: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          moderator_notes: string | null
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
          created_at?: string
          description?: string | null
          documents?: Json | null
          halal_financing_requested?: boolean | null
          halal_financing_status?: string | null
          id?: string
          image_url?: string | null
          is_halal_financed?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          moderator_notes?: string | null
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
          created_at?: string
          description?: string | null
          documents?: Json | null
          halal_financing_requested?: boolean | null
          halal_financing_status?: string | null
          id?: string
          image_url?: string | null
          is_halal_financed?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          moderator_notes?: string | null
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
          notes: string | null
          property_id: string
          status: string | null
          updated_at: string
          visit_date: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          is_custom_time?: boolean | null
          notes?: string | null
          property_id: string
          status?: string | null
          updated_at?: string
          visit_date: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          is_custom_time?: boolean | null
          notes?: string | null
          property_id?: string
          status?: string | null
          updated_at?: string
          visit_date?: string
          visitor_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["app_role"]
          changed_by_user_id: string
        }
        Returns: boolean
      }
      create_property_from_application: {
        Args: { application_id: string }
        Returns: string
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_payment_request: {
        Args: {
          user_id_param: string
          amount_param: number
          currency_param: string
          method_param: string
          ip_addr?: unknown
          user_agent_str?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
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
    },
  },
} as const
