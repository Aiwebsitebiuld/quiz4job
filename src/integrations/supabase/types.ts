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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          icon: string | null
          id: string
          name_bn: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      daily_quiz_counters: {
        Row: {
          count: number
          day: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          user_id?: string
        }
        Relationships: []
      }
      job_saves: {
        Row: {
          created_at: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_saves_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_url: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description_bn: string | null
          description_en: string | null
          id: string
          location: string | null
          organization: string
          posted_at: string
          published: boolean
          salary_range: string | null
          sector: Database["public"]["Enums"]["job_sector"]
          source_url: string | null
          title_bn: string
          title_en: string | null
          updated_at: string
          vacancies: number | null
        }
        Insert: {
          apply_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description_bn?: string | null
          description_en?: string | null
          id?: string
          location?: string | null
          organization: string
          posted_at?: string
          published?: boolean
          salary_range?: string | null
          sector: Database["public"]["Enums"]["job_sector"]
          source_url?: string | null
          title_bn: string
          title_en?: string | null
          updated_at?: string
          vacancies?: number | null
        }
        Update: {
          apply_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description_bn?: string | null
          description_en?: string | null
          id?: string
          location?: string | null
          organization?: string
          posted_at?: string
          published?: boolean
          salary_range?: string | null
          sector?: Database["public"]["Enums"]["job_sector"]
          source_url?: string | null
          title_bn?: string
          title_en?: string | null
          updated_at?: string
          vacancies?: number | null
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          reviewed_at: string | null
          reviewed_by: string | null
          sender_number: string
          status: Database["public"]["Enums"]["payment_status"]
          trx_id: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_number: string
          status?: Database["public"]["Enums"]["payment_status"]
          trx_id: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_number?: string
          status?: Database["public"]["Enums"]["payment_status"]
          trx_id?: string
          user_id?: string
        }
        Relationships: []
      }
      prize_winners: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string
          payout_status: Database["public"]["Enums"]["payout_status"]
          payout_trx: string | null
          rank: number
          total_score: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month: string
          payout_status?: Database["public"]["Enums"]["payout_status"]
          payout_trx?: string | null
          rank: number
          total_score?: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string
          payout_status?: Database["public"]["Enums"]["payout_status"]
          payout_trx?: string | null
          rank?: number
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          district: string | null
          full_name: string | null
          id: string
          language: string
          phone: string | null
          total_xp: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id: string
          language?: string
          phone?: string | null
          total_xp?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          approved: boolean
          category_id: string
          correct_index: number
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation_bn: string | null
          explanation_en: string | null
          id: string
          options: Json
          question_bn: string
          question_en: string | null
          source: string | null
        }
        Insert: {
          approved?: boolean
          category_id: string
          correct_index: number
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation_bn?: string | null
          explanation_en?: string | null
          id?: string
          options: Json
          question_bn: string
          question_en?: string | null
          source?: string | null
        }
        Update: {
          approved?: boolean
          category_id?: string
          correct_index?: number
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation_bn?: string | null
          explanation_en?: string | null
          id?: string
          options?: Json
          question_bn?: string
          question_en?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          quiz_id: string
          selected_index: number | null
          time_ms: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id: string
          quiz_id: string
          selected_index?: number | null
          time_ms?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          quiz_id?: string
          selected_index?: number | null
          time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category_id: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          finished_at: string | null
          id: string
          is_premium_attempt: boolean
          score: number
          started_at: string
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          category_id: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          finished_at?: string | null
          id?: string
          is_premium_attempt?: boolean
          score?: number
          started_at?: string
          time_taken_seconds?: number | null
          total_questions?: number
          user_id: string
        }
        Update: {
          category_id?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          finished_at?: string | null
          id?: string
          is_premium_attempt?: boolean
          score?: number
          started_at?: string
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          expires_at: string | null
          last_trx_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["sub_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          expires_at?: string | null
          last_trx_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          expires_at?: string | null
          last_trx_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_payment: { Args: { _payment_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      start_quiz: {
        Args: {
          _category_id: string
          _difficulty: Database["public"]["Enums"]["difficulty_level"]
          _total: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      difficulty_level: "easy" | "medium" | "hard"
      job_sector: "govt" | "bank" | "ngo" | "private"
      payment_method: "bkash" | "nagad"
      payment_status: "pending" | "approved" | "rejected"
      payout_status: "pending" | "paid"
      sub_status: "free" | "pending" | "active" | "expired"
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
      app_role: ["admin", "user"],
      difficulty_level: ["easy", "medium", "hard"],
      job_sector: ["govt", "bank", "ngo", "private"],
      payment_method: ["bkash", "nagad"],
      payment_status: ["pending", "approved", "rejected"],
      payout_status: ["pending", "paid"],
      sub_status: ["free", "pending", "active", "expired"],
    },
  },
} as const
