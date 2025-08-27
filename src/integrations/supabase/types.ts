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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: number
          metadata: Json | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: number
          metadata?: Json | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      earnings_transcripts: {
        Row: {
          content: string | null
          created_at: string | null
          date: string
          highlights: Json | null
          id: number
          quarter: string
          symbol: string
          title: string | null
          url: string | null
          year: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          date: string
          highlights?: Json | null
          id?: number
          quarter: string
          symbol: string
          title?: string | null
          url?: string | null
          year: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          date?: string
          highlights?: Json | null
          id?: number
          quarter?: string
          symbol?: string
          title?: string | null
          url?: string | null
          year?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          firm_name: string | null
          first_name: string | null
          id: string
          industry: string | null
          job_role: string | null
          last_name: string | null
          location: string | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          firm_name?: string | null
          first_name?: string | null
          id: string
          industry?: string | null
          job_role?: string | null
          last_name?: string | null
          location?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          firm_name?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          job_role?: string | null
          last_name?: string | null
          location?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      saved_analyses: {
        Row: {
          analysis_data: Json
          analysis_type: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_data: Json
          analysis_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sec_filings: {
        Row: {
          cik: string | null
          content: string | null
          created_at: string | null
          filing_date: string
          filing_number: string | null
          form: string
          id: number
          last_accessed: string | null
          report_date: string | null
          symbol: string
          type: string
          url: string | null
        }
        Insert: {
          cik?: string | null
          content?: string | null
          created_at?: string | null
          filing_date: string
          filing_number?: string | null
          form: string
          id?: number
          last_accessed?: string | null
          report_date?: string | null
          symbol: string
          type: string
          url?: string | null
        }
        Update: {
          cik?: string | null
          content?: string | null
          created_at?: string | null
          filing_date?: string
          filing_number?: string | null
          form?: string
          id?: number
          last_accessed?: string | null
          report_date?: string | null
          symbol?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      stock_prediction_history: {
        Row: {
          confidence_level: number | null
          current_price: number
          id: string
          key_drivers: Json | null
          metadata: Json | null
          one_month_price: number
          one_year_price: number
          prediction_date: string | null
          risks: Json | null
          sentiment_analysis: string | null
          six_month_price: number
          symbol: string
          three_month_price: number
        }
        Insert: {
          confidence_level?: number | null
          current_price: number
          id?: string
          key_drivers?: Json | null
          metadata?: Json | null
          one_month_price: number
          one_year_price: number
          prediction_date?: string | null
          risks?: Json | null
          sentiment_analysis?: string | null
          six_month_price: number
          symbol: string
          three_month_price: number
        }
        Update: {
          confidence_level?: number | null
          current_price?: number
          id?: string
          key_drivers?: Json | null
          metadata?: Json | null
          one_month_price?: number
          one_year_price?: number
          prediction_date?: string | null
          risks?: Json | null
          sentiment_analysis?: string | null
          six_month_price?: number
          symbol?: string
          three_month_price?: number
        }
        Relationships: []
      }
      user_activity_summary: {
        Row: {
          created_at: string | null
          favorite_symbols: string[] | null
          id: string
          last_activity: string | null
          prediction_accuracy: number | null
          report_success_rate: number | null
          total_predictions: number | null
          total_reports: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorite_symbols?: string[] | null
          id?: string
          last_activity?: string | null
          prediction_accuracy?: number | null
          report_success_rate?: number | null
          total_predictions?: number | null
          total_reports?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorite_symbols?: string[] | null
          id?: string
          last_activity?: string | null
          prediction_accuracy?: number | null
          report_success_rate?: number | null
          total_predictions?: number | null
          total_reports?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          access_count: number | null
          action: string
          category: string
          created_at: string
          id: string
          label: string | null
          last_accessed: string | null
          metadata: Json | null
          session_id: string
          timestamp: string
          user_id: string | null
          value: number | null
        }
        Insert: {
          access_count?: number | null
          action: string
          category: string
          created_at?: string
          id?: string
          label?: string | null
          last_accessed?: string | null
          metadata?: Json | null
          session_id: string
          timestamp?: string
          user_id?: string | null
          value?: number | null
        }
        Update: {
          access_count?: number | null
          action?: string
          category?: string
          created_at?: string
          id?: string
          label?: string | null
          last_accessed?: string | null
          metadata?: Json | null
          session_id?: string
          timestamp?: string
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          default_view: string | null
          id: string
          preferred_metrics: string[] | null
          theme: string | null
          updated_at: string | null
          user_id: string
          watched_symbols: string[] | null
        }
        Insert: {
          created_at?: string | null
          default_view?: string | null
          id?: string
          preferred_metrics?: string[] | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          watched_symbols?: string[] | null
        }
        Update: {
          created_at?: string | null
          default_view?: string | null
          id?: string
          preferred_metrics?: string[] | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          watched_symbols?: string[] | null
        }
        Relationships: []
      }
      user_price_predictions: {
        Row: {
          company_name: string
          created_at: string
          expires_at: string
          id: string
          prediction_data: Json
          symbol: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          expires_at?: string
          id?: string
          prediction_data: Json
          symbol: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          expires_at?: string
          id?: string
          prediction_data?: Json
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      user_research_reports: {
        Row: {
          company_name: string
          created_at: string
          expires_at: string
          html_content: string | null
          id: string
          report_data: Json
          symbol: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          expires_at?: string
          html_content?: string | null
          id?: string
          report_data: Json
          symbol: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          expires_at?: string
          html_content?: string | null
          id?: string
          report_data?: Json
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_analytics_data: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      execute_sql: {
        Args: { sql_statement: string }
        Returns: Json
      }
      extract_financial_metrics: {
        Args: { p_doc_id: number; p_doc_type: string }
        Returns: Json
      }
      get_analytics_insights: {
        Args: { timeframe?: string }
        Returns: Json
      }
      get_or_create_cache: {
        Args:
          | { p_cache_key: string; p_default_data?: Json; p_expires_at: string }
          | {
              p_cache_key: string
              p_default_data?: Json
              p_expires_at: string
              p_user_id: string
            }
        Returns: Json
      }
      get_related_documents: {
        Args: { p_doc_id: number; p_doc_type: string; p_limit?: number }
        Returns: {
          date: string
          doc_id: number
          doc_type: string
          similarity: number
          symbol: string
          title: string
        }[]
      }
      get_service_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_active_content: {
        Args: { expires_at: string }
        Returns: boolean
      }
      schedule_cache_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      semantic_document_search: {
        Args: {
          p_doc_type?: string
          p_limit?: number
          p_search_term: string
          p_symbol?: string
        }
        Returns: {
          content_snippet: string
          date: string
          doc_id: number
          doc_type: string
          relevance: number
          symbol: string
          title: string
        }[]
      }
      set_cache: {
        Args: { p_cache_key: string; p_data: Json; p_ttl_minutes?: number }
        Returns: boolean
      }
      table_exists: {
        Args: { schema_name: string; table_name: string }
        Returns: boolean
      }
      update_user_portfolio: {
        Args: { p_portfolio_data: Json; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
