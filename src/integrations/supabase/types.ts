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
      advertisements: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          redirect_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          redirect_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          redirect_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string | null
          created_at: string
          description: string | null
          duration_days: number
          id: string
          target_unit: string | null
          target_value: number | null
          title: string
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string
          description?: string | null
          duration_days: number
          id?: string
          target_unit?: string | null
          target_value?: number | null
          title: string
        }
        Update: {
          challenge_type?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          target_unit?: string | null
          target_value?: number | null
          title?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          member_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          member_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          member_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_challenges: {
        Row: {
          community_id: string
          created_at: string
          description: string | null
          duration_days: number
          id: string
          participants_count: number | null
          target_unit: string | null
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          description?: string | null
          duration_days: number
          id?: string
          participants_count?: number | null
          target_unit?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          participants_count?: number | null
          target_unit?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          author_avatar: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          chart_data: Json | null
          comments_count: number | null
          community_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          tags: string[] | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          chart_data?: Json | null
          comments_count?: number | null
          community_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          chart_data?: Json | null
          comments_count?: number | null
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      fasting_sessions: {
        Row: {
          completed: boolean
          created_at: string
          end_time: string | null
          id: string
          start_time: string
          target_duration_hours: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          end_time?: string | null
          id?: string
          start_time: string
          target_duration_hours: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          target_duration_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      keto_streaks: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ketodiet: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      macro_logs: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          date: string
          fat: number | null
          id: string
          protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "macro_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          created_at: string
          day_of_week: number | null
          id: string
          meal_id: string
          meal_plan_id: string
          meal_type: string
          planned_date: string | null
          servings: number | null
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          id?: string
          meal_id: string
          meal_plan_id: string
          meal_type: string
          planned_date?: string | null
          servings?: number | null
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          id?: string
          meal_id?: string
          meal_plan_id?: string
          meal_type?: string
          planned_date?: string | null
          servings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          plan_type: string
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_type: string
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          carbs: number | null
          cook_time: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          fat: number | null
          id: string
          image_url: string | null
          ingredients: string[]
          instructions: string[]
          is_quick_meal: boolean | null
          meal_type: string | null
          prep_time: number | null
          protein: number | null
          servings: number | null
          social_shares: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_quick_meal?: boolean | null
          meal_type?: string | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          social_shares?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_quick_meal?: boolean | null
          meal_type?: string | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          social_shares?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      period_logs: {
        Row: {
          created_at: string | null
          end_date: string | null
          flow_intensity: string | null
          id: string
          notes: string | null
          start_date: string
          symptoms: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          flow_intensity?: string | null
          id?: string
          notes?: string | null
          start_date: string
          symptoms?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          flow_intensity?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          symptoms?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          created_at: string
          current_weight: number | null
          diet_type: string | null
          display_name: string | null
          email: string | null
          goal_weight: number | null
          height: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_weight?: number | null
          diet_type?: string | null
          display_name?: string | null
          email?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_weight?: number | null
          diet_type?: string | null
          display_name?: string | null
          email?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_favorites: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      recipe_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          image_url: string | null
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          image_url?: string | null
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          image_url?: string | null
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_votes: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_votes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "user_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string | null
          cook_time: number | null
          created_at: string
          description: string | null
          diet_type: string | null
          difficulty: string | null
          fat: number | null
          id: string
          ingredients: string[]
          instructions: string[]
          is_keto_friendly: boolean | null
          prep_time: number | null
          protein: number | null
          servings: number | null
          social_shares: number | null
          title: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          diet_type?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          ingredients: string[]
          instructions: string[]
          is_keto_friendly?: boolean | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          social_shares?: number | null
          title: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          diet_type?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          ingredients?: string[]
          instructions?: string[]
          is_keto_friendly?: boolean | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          social_shares?: number | null
          title?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          created_at: string
          duration_months: number | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          story: string
          title: string
          updated_at: string
          user_id: string
          weight_lost: number | null
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          created_at?: string
          duration_months?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          story: string
          title: string
          updated_at?: string
          user_id: string
          weight_lost?: number | null
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          created_at?: string
          duration_months?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          story?: string
          title?: string
          updated_at?: string
          user_id?: string
          weight_lost?: number | null
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          created_at: string
          current_progress: number | null
          end_date: string | null
          id: string
          is_completed: boolean | null
          start_date: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          current_progress?: number | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          start_date?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          current_progress?: number | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          current_level: number
          id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recipes: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string | null
          cook_time: number | null
          created_at: string | null
          description: string | null
          diet_type: string | null
          difficulty: string | null
          fat: number | null
          id: string
          image_url: string | null
          ingredients: string[]
          instructions: string[]
          is_approved: boolean | null
          prep_time: number | null
          protein: number | null
          servings: number | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          diet_type?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients: string[]
          instructions: string[]
          is_approved?: boolean | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          diet_type?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_approved?: boolean | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
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
      water_logs: {
        Row: {
          created_at: string
          cups_consumed: number
          daily_goal: number
          date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cups_consumed?: number
          daily_goal?: number
          date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cups_consumed?: number
          daily_goal?: number
          date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          logged_at: string
          notes: string | null
          unit: string | null
          user_id: string
          weight: number
        }
        Insert: {
          id?: string
          logged_at?: string
          notes?: string | null
          unit?: string | null
          user_id: string
          weight: number
        }
        Update: {
          id?: string
          logged_at?: string
          notes?: string | null
          unit?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number
          id: string
          notes: string | null
          user_id: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          date?: string
          duration_minutes: number
          id?: string
          notes?: string | null
          user_id: string
          workout_type: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          user_id?: string
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: { Args: { points_to_add: number }; Returns: undefined }
      decrement_recipe_upvotes: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_recipe_upvotes: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
