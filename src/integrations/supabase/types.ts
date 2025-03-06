export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      dcf_assumptions: {
        Row: {
          assumptions: Json
          created_at: string
          expires_at: string
          id: string
          is_mock: boolean | null
          symbol: string
        }
        Insert: {
          assumptions: Json
          created_at?: string
          expires_at: string
          id?: string
          is_mock?: boolean | null
          symbol: string
        }
        Update: {
          assumptions?: Json
          created_at?: string
          expires_at?: string
          id?: string
          is_mock?: boolean | null
          symbol?: string
        }
        Relationships: []
      }
      dcf_calculations: {
        Row: {
          created_at: string
          id: string
          is_mock: boolean | null
          parameters: Json | null
          result: Json
          symbol: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mock?: boolean | null
          parameters?: Json | null
          result: Json
          symbol: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mock?: boolean | null
          parameters?: Json | null
          result?: Json
          symbol?: string
          type?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_sql: {
        Args: {
          sql_statement: string
        }
        Returns: Json
      }
      extract_financial_metrics: {
        Args: {
          p_doc_id: number
          p_doc_type: string
        }
        Returns: Json
      }
      get_or_create_cache:
        | {
            Args: {
              p_cache_key: string
              p_expires_at: string
              p_default_data?: Json
            }
            Returns: Json
          }
        | {
            Args: {
              p_user_id: string
              p_cache_key: string
              p_expires_at: string
              p_default_data?: Json
            }
            Returns: Json
          }
      get_related_documents: {
        Args: {
          p_doc_id: number
          p_doc_type: string
          p_limit?: number
        }
        Returns: {
          doc_id: number
          doc_type: string
          symbol: string
          date: string
          title: string
          similarity: number
        }[]
      }
      schedule_cache_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      semantic_document_search: {
        Args: {
          p_search_term: string
          p_symbol?: string
          p_doc_type?: string
          p_limit?: number
        }
        Returns: {
          doc_id: number
          doc_type: string
          symbol: string
          date: string
          title: string
          relevance: number
          content_snippet: string
        }[]
      }
      table_exists: {
        Args: {
          schema_name: string
          table_name: string
        }
        Returns: boolean
      }
      update_user_portfolio: {
        Args: {
          p_user_id: string
          p_portfolio_data: Json
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
