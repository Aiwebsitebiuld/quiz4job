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
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content_bn: string | null
          content_en: string | null
          created_at: string | null
          excerpt_bn: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          seo_desc_bn: string | null
          seo_title_bn: string | null
          slug: string
          title_bn: string
          title_en: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string | null
          excerpt_bn?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_desc_bn?: string | null
          seo_title_bn?: string | null
          slug: string
          title_bn: string
          title_en?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string | null
          excerpt_bn?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_desc_bn?: string | null
          seo_title_bn?: string | null
          slug?: string
          title_bn?: string
          title_en?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          created_at: string | null
          description_bn: string | null
          description_en: string | null
          district: string | null
          education_required: string | null
          experience_required: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          job_type: string | null
          location_bn: string | null
          location_en: string | null
          organization_logo: string | null
          organization_name: string
          organization_type: string | null
          posted_by: string | null
          published_date: string | null
          salary_max: number | null
          salary_min: number | null
          salary_text: string | null
          slug: string
          source_url: string | null
          title_bn: string
          title_en: string | null
          updated_at: string | null
          vacancy_count: number | null
          views_count: number | null
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          district?: string | null
          education_required?: string | null
          experience_required?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          job_type?: string | null
          location_bn?: string | null
          location_en?: string | null
          organization_logo?: string | null
          organization_name: string
          organization_type?: string | null
          posted_by?: string | null
          published_date?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_text?: string | null
          slug: string
          source_url?: string | null
          title_bn: string
          title_en?: string | null
          updated_at?: string | null
          vacancy_count?: number | null
          views_count?: number | null
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          created_at?: string | null
          description_bn?: string | null
          description_en?: string | null
          district?: string | null
          education_required?: string | null
          experience_required?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          job_type?: string | null
          location_bn?: string | null
          location_en?: string | null
          organization_logo?: string | null
          organization_name?: string
          organization_type?: string | null
          posted_by?: string | null
          published_date?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_text?: string | null
          slug?: string
          source_url?: string | null
          title_bn?: string
          title_en?: string | null
          updated_at?: string | null
          vacancy_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_leaderboard: {
        Row: {
          avg_percentage: number | null
          correct_answers: number | null
          created_at: string | null
          facebook_liked: boolean | null
          id: string
          is_premium: boolean | null
          is_prize_eligible: boolean | null
          month: number
          prize_amount: number | null
          prize_paid: boolean | null
          prize_paid_at: string | null
          prize_payment_method: string | null
          prize_position: string | null
          prize_transaction_id: string | null
          profile_shared: boolean | null
          quizzes_taken: number | null
          rank: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          avg_percentage?: number | null
          correct_answers?: number | null
          created_at?: string | null
          facebook_liked?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_prize_eligible?: boolean | null
          month: number
          prize_amount?: number | null
          prize_paid?: boolean | null
          prize_paid_at?: string | null
          prize_payment_method?: string | null
          prize_position?: string | null
          prize_transaction_id?: string | null
          profile_shared?: boolean | null
          quizzes_taken?: number | null
          rank?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          avg_percentage?: number | null
          correct_answers?: number | null
          created_at?: string | null
          facebook_liked?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_prize_eligible?: boolean | null
          month?: number
          prize_amount?: number | null
          prize_paid?: boolean | null
          prize_paid_at?: string | null
          prize_payment_method?: string | null
          prize_position?: string | null
          prize_transaction_id?: string | null
          profile_shared?: boolean | null
          quizzes_taken?: number | null
          rank?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message_bn: string
          title_bn: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message_bn: string
          title_bn: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message_bn?: string
          title_bn?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_records: {
        Row: {
          created_at: string | null
          id: string
          month: number
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          payment_method: string | null
          payment_number: string | null
          position: number
          prize_amount: number
          status: string | null
          transaction_id: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_method?: string | null
          payment_number?: string | null
          position: number
          prize_amount: number
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_method?: string | null
          payment_number?: string | null
          position?: number
          prize_amount?: number
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "prize_records_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_records_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_month_quizzes: number | null
          current_month_score: number | null
          district: string | null
          email: string | null
          email_notifications: boolean | null
          facebook_liked: boolean | null
          free_quizzes_today: number | null
          free_quota_reset_date: string | null
          full_name: string
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          phone: string | null
          preferred_language: string | null
          premium_expires_at: string | null
          premium_started_at: string | null
          profile_shared: boolean | null
          role: string | null
          total_correct_answers: number | null
          total_prize_amount: number | null
          total_prizes_won: number | null
          total_quizzes_taken: number | null
          total_score: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_month_quizzes?: number | null
          current_month_score?: number | null
          district?: string | null
          email?: string | null
          email_notifications?: boolean | null
          facebook_liked?: boolean | null
          free_quizzes_today?: number | null
          free_quota_reset_date?: string | null
          full_name?: string
          id: string
          is_active?: boolean | null
          is_premium?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          premium_expires_at?: string | null
          premium_started_at?: string | null
          profile_shared?: boolean | null
          role?: string | null
          total_correct_answers?: number | null
          total_prize_amount?: number | null
          total_prizes_won?: number | null
          total_quizzes_taken?: number | null
          total_score?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_month_quizzes?: number | null
          current_month_score?: number | null
          district?: string | null
          email?: string | null
          email_notifications?: boolean | null
          facebook_liked?: boolean | null
          free_quizzes_today?: number | null
          free_quota_reset_date?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          premium_expires_at?: string | null
          premium_started_at?: string | null
          profile_shared?: boolean | null
          role?: string | null
          total_correct_answers?: number | null
          total_prize_amount?: number | null
          total_prizes_won?: number | null
          total_quizzes_taken?: number | null
          total_score?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category_id: string | null
          correct_option: string
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          exam_type: string | null
          explanation_bn: string | null
          explanation_en: string | null
          id: string
          is_active: boolean | null
          option_a_bn: string
          option_a_en: string | null
          option_b_bn: string
          option_b_en: string | null
          option_c_bn: string
          option_c_en: string | null
          option_d_bn: string
          option_d_en: string | null
          question_text_bn: string
          question_text_en: string | null
          times_appeared: number | null
          times_correct: number | null
          updated_at: string | null
          year_appeared: string | null
        }
        Insert: {
          category_id?: string | null
          correct_option: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          exam_type?: string | null
          explanation_bn?: string | null
          explanation_en?: string | null
          id?: string
          is_active?: boolean | null
          option_a_bn: string
          option_a_en?: string | null
          option_b_bn: string
          option_b_en?: string | null
          option_c_bn: string
          option_c_en?: string | null
          option_d_bn: string
          option_d_en?: string | null
          question_text_bn: string
          question_text_en?: string | null
          times_appeared?: number | null
          times_correct?: number | null
          updated_at?: string | null
          year_appeared?: string | null
        }
        Update: {
          category_id?: string | null
          correct_option?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          exam_type?: string | null
          explanation_bn?: string | null
          explanation_en?: string | null
          id?: string
          is_active?: boolean | null
          option_a_bn?: string
          option_a_en?: string | null
          option_b_bn?: string
          option_b_en?: string | null
          option_c_bn?: string
          option_c_en?: string | null
          option_d_bn?: string
          option_d_en?: string | null
          question_text_bn?: string
          question_text_en?: string | null
          times_appeared?: number | null
          times_correct?: number | null
          updated_at?: string | null
          year_appeared?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string | null
          selected_option: string | null
          session_id: string | null
          time_taken_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          selected_option?: string | null
          session_id?: string | null
          time_taken_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          selected_option?: string | null
          session_id?: string | null
          time_taken_seconds?: number | null
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
            foreignKeyName: "quiz_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description_bn: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_premium_only: boolean | null
          name_bn: string
          name_en: string
          parent_category: string | null
          question_count: number | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium_only?: boolean | null
          name_bn: string
          name_en: string
          parent_category?: string | null
          question_count?: number | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description_bn?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium_only?: boolean | null
          name_bn?: string
          name_en?: string
          parent_category?: string | null
          question_count?: number | null
          slug?: string
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          category_id: string | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          id: string
          is_ranked: boolean | null
          language: string | null
          max_possible_score: number | null
          percentage: number | null
          questions_attempted: number | null
          score: number | null
          session_type: string | null
          skipped: number | null
          started_at: string | null
          status: string | null
          time_limit_seconds: number | null
          time_taken_seconds: number | null
          total_questions: number | null
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          category_id?: string | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          is_ranked?: boolean | null
          language?: string | null
          max_possible_score?: number | null
          percentage?: number | null
          questions_attempted?: number | null
          score?: number | null
          session_type?: string | null
          skipped?: number | null
          started_at?: string | null
          status?: string | null
          time_limit_seconds?: number | null
          time_taken_seconds?: number | null
          total_questions?: number | null
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          category_id?: string | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          is_ranked?: boolean | null
          language?: string | null
          max_possible_score?: number | null
          percentage?: number | null
          questions_attempted?: number | null
          score?: number | null
          session_type?: string | null
          skipped?: number | null
          started_at?: string | null
          status?: string | null
          time_limit_seconds?: number | null
          time_taken_seconds?: number | null
          total_questions?: number | null
          user_id?: string
          wrong_answers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "quiz_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          admin_notes: string | null
          amount: number
          bkash_number: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          payment_month: number
          payment_screenshot_url: string | null
          payment_year: number
          premium_expires: string | null
          premium_starts: string | null
          status: string | null
          transaction_id: string
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          bkash_number?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_month: number
          payment_screenshot_url?: string | null
          payment_year: number
          premium_expires?: string | null
          premium_starts?: string | null
          status?: string | null
          transaction_id: string
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bkash_number?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_month?: number
          payment_screenshot_url?: string | null
          payment_year?: number
          premium_expires?: string | null
          premium_starts?: string | null
          status?: string | null
          transaction_id?: string
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_month_quizzes: number | null
          current_month_score: number | null
          district: string | null
          facebook_liked: boolean | null
          full_name: string | null
          id: string | null
          is_premium: boolean | null
          premium_expires_at: string | null
          role: string | null
          total_correct_answers: number | null
          total_prize_amount: number | null
          total_prizes_won: number | null
          total_quizzes_taken: number | null
          total_score: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_month_quizzes?: number | null
          current_month_score?: number | null
          district?: string | null
          facebook_liked?: boolean | null
          full_name?: string | null
          id?: string | null
          is_premium?: boolean | null
          premium_expires_at?: string | null
          role?: string | null
          total_correct_answers?: number | null
          total_prize_amount?: number | null
          total_prizes_won?: number | null
          total_quizzes_taken?: number | null
          total_score?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_month_quizzes?: number | null
          current_month_score?: number | null
          district?: string | null
          facebook_liked?: boolean | null
          full_name?: string | null
          id?: string | null
          is_premium?: boolean | null
          premium_expires_at?: string | null
          role?: string | null
          total_correct_answers?: number | null
          total_prize_amount?: number | null
          total_prizes_won?: number | null
          total_quizzes_taken?: number | null
          total_score?: number | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_take_quiz: { Args: { user_uuid?: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_premium: { Args: { user_uuid?: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      job_sector: "govt" | "bank" | "ngo" | "private"
      payment_method: "bkash" | "nagad"
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
      job_sector: ["govt", "bank", "ngo", "private"],
      payment_method: ["bkash", "nagad"],
      payout_status: ["pending", "paid"],
      sub_status: ["free", "pending", "active", "expired"],
    },
  },
} as const
