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
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          file_path: string | null
          file_size: number | null
          id: string
          status: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          created_at: string
          currency: string | null
          date_format: string | null
          id: string
          language: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          created_at?: string
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          created_at?: string
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contractors: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          specialization: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          specialization?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      extracts: {
        Row: {
          amount: number
          attached_file_name: string | null
          attached_file_url: string | null
          contractor_name: string
          created_at: string
          current_amount: number | null
          description: string | null
          extract_date: string
          extract_number: string
          id: string
          percentage_completed: number | null
          previous_amount: number | null
          project_id: string | null
          project_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          attached_file_name?: string | null
          attached_file_url?: string | null
          contractor_name: string
          created_at?: string
          current_amount?: number | null
          description?: string | null
          extract_date?: string
          extract_number: string
          id?: string
          percentage_completed?: number | null
          previous_amount?: number | null
          project_id?: string | null
          project_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attached_file_name?: string | null
          attached_file_url?: string | null
          contractor_name?: string
          created_at?: string
          current_amount?: number | null
          description?: string | null
          extract_date?: string
          extract_number?: string
          id?: string
          percentage_completed?: number | null
          previous_amount?: number | null
          project_id?: string | null
          project_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string
          created_by: string
          id: string
          report_data: Json
          report_name: string
          report_period_end: string
          report_period_start: string
          report_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          report_data: Json
          report_name: string
          report_period_end: string
          report_period_start: string
          report_type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          report_data?: Json
          report_name?: string
          report_period_end?: string
          report_period_start?: string
          report_type?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          attached_file_name: string | null
          attached_file_url: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          project_id: string | null
          status: string
          supplier_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          attached_file_name?: string | null
          attached_file_url?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          project_id?: string | null
          status?: string
          supplier_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attached_file_name?: string | null
          attached_file_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          project_id?: string | null
          status?: string
          supplier_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string
          description: string
          entry_number: string
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string
          total_credit: number
          total_debit: number
          transaction_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          entry_number: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          total_credit?: number
          total_debit?: number
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          entry_number?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          total_credit?: number
          total_debit?: number
          transaction_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          building_name: string
          created_at: string
          description: string | null
          estimated_cost: number
          id: string
          issue_type: string
          priority: string
          reported_date: string
          status: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          building_name: string
          created_at?: string
          description?: string | null
          estimated_cost?: number
          id?: string
          issue_type: string
          priority?: string
          reported_date?: string
          status?: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          building_name?: string
          created_at?: string
          description?: string | null
          estimated_cost?: number
          id?: string
          issue_type?: string
          priority?: string
          reported_date?: string
          status?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          daily_summary: boolean
          email_notifications: boolean
          id: string
          push_notifications: boolean
          sms_notifications: boolean
          updated_at: string
          user_id: string
          weekly_report: boolean
        }
        Insert: {
          created_at?: string
          daily_summary?: boolean
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
          weekly_report?: boolean
        }
        Update: {
          created_at?: string
          daily_summary?: boolean
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
          weekly_report?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          expected_completion: string
          id: string
          location: string
          name: string
          progress: number
          sold_units: number
          start_date: string
          status: string
          total_cost: number
          total_units: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_completion: string
          id?: string
          location: string
          name: string
          progress?: number
          sold_units?: number
          start_date: string
          status?: string
          total_cost?: number
          total_units?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_completion?: string
          id?: string
          location?: string
          name?: string
          progress?: number
          sold_units?: number
          start_date?: string
          status?: string
          total_cost?: number
          total_units?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string
          id: string
          name: string
          purchase_id: string
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          purchase_id: string
          quantity: number
          unit: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          purchase_id?: string
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          approved_by: string | null
          attached_file_name: string | null
          attached_file_url: string | null
          created_at: string
          delivery_status: string
          expected_delivery: string
          id: string
          order_date: string
          order_number: string
          project_id: string | null
          project_name: string
          requested_by: string
          status: string
          supplier_name: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          attached_file_name?: string | null
          attached_file_url?: string | null
          created_at?: string
          delivery_status?: string
          expected_delivery: string
          id?: string
          order_date: string
          order_number: string
          project_id?: string | null
          project_name: string
          requested_by: string
          status?: string
          supplier_name: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          attached_file_name?: string | null
          attached_file_url?: string | null
          created_at?: string
          delivery_status?: string
          expected_delivery?: string
          id?: string
          order_date?: string
          order_number?: string
          project_id?: string | null
          project_name?: string
          requested_by?: string
          status?: string
          supplier_name?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          area: number
          created_at: string
          customer_name: string
          customer_phone: string | null
          id: string
          installment_plan: string | null
          price: number
          project_name: string
          remaining_amount: number | null
          sale_date: string | null
          status: string
          unit_number: string
          unit_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: number
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          installment_plan?: string | null
          price: number
          project_name: string
          remaining_amount?: number | null
          sale_date?: string | null
          status?: string
          unit_number: string
          unit_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          installment_plan?: string | null
          price?: number
          project_name?: string
          remaining_amount?: number | null
          sale_date?: string | null
          status?: string
          unit_number?: string
          unit_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          id: string
          max_login_attempts: number
          password_min_length: number
          require_lowercase: boolean
          require_numbers: boolean
          require_special_chars: boolean
          require_uppercase: boolean
          session_timeout: number
          two_factor_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_login_attempts?: number
          password_min_length?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special_chars?: boolean
          require_uppercase?: boolean
          session_timeout?: number
          two_factor_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_login_attempts?: number
          password_min_length?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special_chars?: boolean
          require_uppercase?: boolean
          session_timeout?: number
          two_factor_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          category: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_reports: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          report_date: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          report_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          report_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          created_at: string
          department: string
          description: string | null
          due_date: string
          id: string
          priority: string
          progress: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          department: string
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          progress?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          department?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          progress?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_extract_journal_entry: {
        Args: {
          contractor_name: string
          extract_amount: number
          extract_id: string
          project_id?: string
        }
        Returns: string
      }
      create_invoice_journal_entry: {
        Args: {
          invoice_amount: number
          invoice_id: string
          supplier_name: string
        }
        Returns: string
      }
      create_sale_journal_entry: {
        Args: { customer_name: string; sale_amount: number; sale_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_manager_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "مدير النظام" | "مدير" | "موظف مبيعات" | "محاسب" | "موظف"
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
      user_role: ["مدير النظام", "مدير", "موظف مبيعات", "محاسب", "موظف"],
    },
  },
} as const
