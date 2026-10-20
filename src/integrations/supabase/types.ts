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
    PostgrestVersion: "12.2.3"
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
      article_topics_queue: {
        Row: {
          category: string
          created_at: string
          error_message: string | null
          generated_article_id: string | null
          id: string
          scheduled_for: string | null
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          error_message?: string | null
          generated_article_id?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          topic: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          error_message?: string | null
          generated_article_id?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_topics_queue_generated_article_id_fkey"
            columns: ["generated_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
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
      badges: {
        Row: {
          badge_type: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          requirement_type: string | null
          requirement_value: number | null
        }
        Insert: {
          badge_type?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Update: {
          badge_type?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Relationships: []
      }
      button_links: {
        Row: {
          button_key: string
          created_at: string | null
          id: string
          label: string
          updated_at: string | null
          url: string
        }
        Insert: {
          button_key: string
          created_at?: string | null
          id?: string
          label: string
          updated_at?: string | null
          url?: string
        }
        Update: {
          button_key?: string
          created_at?: string | null
          id?: string
          label?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      challenge_communities: {
        Row: {
          challenge_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_communities_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: true
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_daily_logs: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          log_date: string
          notes: string | null
          user_challenge_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          user_challenge_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          user_challenge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_daily_logs_user_challenge_id_fkey"
            columns: ["user_challenge_id"]
            isOneToOne: false
            referencedRelation: "user_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_post_likes: {
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
            foreignKeyName: "challenge_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "challenge_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          challenge_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_flagged: boolean | null
          likes_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          challenge_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_flagged?: boolean | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          challenge_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_flagged?: boolean | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string | null
          created_at: string
          description: string | null
          duration_days: number
          id: string
          reward_badge_id: string | null
          reward_points: number | null
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
          reward_badge_id?: string | null
          reward_points?: number | null
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
          reward_badge_id?: string | null
          reward_points?: number | null
          target_unit?: string | null
          target_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_reward_badge_id_fkey"
            columns: ["reward_badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
      community_guidelines_acceptance: {
        Row: {
          accepted_at: string
          id: string
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          user_id: string
          version?: string
        }
        Update: {
          accepted_at?: string
          id?: string
          user_id?: string
          version?: string
        }
        Relationships: []
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
      course_access: {
        Row: {
          created_at: string
          granted_at: string
          jvzoo_email: string | null
          jvzoo_order_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          jvzoo_email?: string | null
          jvzoo_order_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          jvzoo_email?: string | null
          jvzoo_order_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_sec: number
          id: string
          is_preview: boolean
          is_published: boolean
          module_id: string
          resources: Json
          slug: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_sec?: number
          id?: string
          is_preview?: boolean
          is_published?: boolean
          module_id: string
          resources?: Json
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_sec?: number
          id?: string
          is_preview?: boolean
          is_published?: boolean
          module_id?: string
          resources?: Json
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_food_logs: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          log_date: string
          logged_at: string
          meal_type: string
          name: string
          protein: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          log_date: string
          logged_at?: string
          meal_type: string
          name: string
          protein?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          log_date?: string
          logged_at?: string
          meal_type?: string
          name?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
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
      food_listing_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_listing_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "food_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      food_listings: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string
          city: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          country: string | null
          created_at: string
          delivery_radius_km: number | null
          delivery_type: string
          description: string | null
          fat: number | null
          food_tag: string
          google_maps_link: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean | null
          is_sold_out: boolean | null
          is_vegetarian: boolean | null
          is_verified: boolean | null
          keto_certified: boolean | null
          latitude: number | null
          longitude: number | null
          min_order_amount: number | null
          price: number
          protein: number | null
          quantity: number
          seller_id: string
          state: string | null
          title: string
          town: string | null
          updated_at: string
          view_count: number | null
          views_count: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string
          city?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          delivery_radius_km?: number | null
          delivery_type?: string
          description?: string | null
          fat?: number | null
          food_tag?: string
          google_maps_link?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          is_sold_out?: boolean | null
          is_vegetarian?: boolean | null
          is_verified?: boolean | null
          keto_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_order_amount?: number | null
          price?: number
          protein?: number | null
          quantity?: number
          seller_id: string
          state?: string | null
          title: string
          town?: string | null
          updated_at?: string
          view_count?: number | null
          views_count?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string
          city?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          delivery_radius_km?: number | null
          delivery_type?: string
          description?: string | null
          fat?: number | null
          food_tag?: string
          google_maps_link?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          is_sold_out?: boolean | null
          is_vegetarian?: boolean | null
          is_verified?: boolean | null
          keto_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_order_amount?: number | null
          price?: number
          protein?: number | null
          quantity?: number
          seller_id?: string
          state?: string | null
          title?: string
          town?: string | null
          updated_at?: string
          view_count?: number | null
          views_count?: number | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          metadata: Json | null
          page: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      group_invites: {
        Row: {
          created_at: string
          group_id: string
          id: string
          invitee_id: string
          inviter_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          invitee_id: string
          inviter_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      jvzoo_webhook_logs: {
        Row: {
          amount: number | null
          created_at: string
          customer_email: string | null
          duplicate: boolean
          error_message: string | null
          id: string
          processed: boolean
          product_id: string | null
          raw_payload: Json
          response_body: string | null
          response_status: number | null
          signature_valid: boolean
          transaction_receipt: string | null
          transaction_type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_email?: string | null
          duplicate?: boolean
          error_message?: string | null
          id?: string
          processed?: boolean
          product_id?: string | null
          raw_payload: Json
          response_body?: string | null
          response_status?: number | null
          signature_valid?: boolean
          transaction_receipt?: string | null
          transaction_type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_email?: string | null
          duplicate?: boolean
          error_message?: string | null
          id?: string
          processed?: boolean
          product_id?: string | null
          raw_payload?: Json
          response_body?: string | null
          response_status?: number | null
          signature_valid?: boolean
          transaction_receipt?: string | null
          transaction_type?: string | null
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
      listing_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "food_listings"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "macro_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      message_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          link: string | null
          message: string
          notification_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          link?: string | null
          message: string
          notification_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          link?: string | null
          message?: string
          notification_type?: string | null
          title?: string
          type?: string
          user_id?: string
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
      post_comments: {
        Row: {
          author_avatar: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          description: string | null
          faqs: Json | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_active: boolean | null
          original_price: number | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          faqs?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          original_price?: number | null
          price?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          faqs?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          original_price?: number | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          budget_preference: string | null
          city: string | null
          country: string | null
          created_at: string
          current_weight: number | null
          diet_preference: string | null
          diet_type: string | null
          display_name: string | null
          email: string | null
          follower_count: number | null
          following_count: number | null
          goal_weight: number | null
          height: number | null
          id: string
          share_progress_publicly: boolean
          state: string | null
          town: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          budget_preference?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_weight?: number | null
          diet_preference?: string | null
          diet_type?: string | null
          display_name?: string | null
          email?: string | null
          follower_count?: number | null
          following_count?: number | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          share_progress_publicly?: boolean
          state?: string | null
          town?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          budget_preference?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_weight?: number | null
          diet_preference?: string | null
          diet_type?: string | null
          display_name?: string | null
          email?: string | null
          follower_count?: number | null
          following_count?: number | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          share_progress_publicly?: boolean
          state?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
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
          {
            foreignKeyName: "recipe_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      recipe_of_the_day: {
        Row: {
          created_at: string | null
          featured_date: string
          id: string
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          featured_date?: string
          id?: string
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          featured_date?: string
          id?: string
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_of_the_day_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
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
          cost_tier: string
          created_at: string
          description: string | null
          diet_category: string
          diet_type: string | null
          difficulty: string | null
          fat: number | null
          id: string
          image_url: string | null
          ingredients: string[]
          instructions: string[]
          is_keto_friendly: boolean | null
          prep_time: number | null
          protein: number | null
          servings: number | null
          slug: string
          social_shares: number | null
          title: string
          updated_at: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          cost_tier?: string
          created_at?: string
          description?: string | null
          diet_category?: string
          diet_type?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients: string[]
          instructions: string[]
          is_keto_friendly?: boolean | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          slug: string
          social_shares?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          cook_time?: number | null
          cost_tier?: string
          created_at?: string
          description?: string | null
          diet_category?: string
          diet_type?: string | null
          difficulty?: string | null
          fat?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string[]
          is_keto_friendly?: boolean | null
          prep_time?: number | null
          protein?: number | null
          servings?: number | null
          slug?: string
          social_shares?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string | null
          reward_granted: boolean | null
          status: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string | null
          reward_granted?: boolean | null
          status?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string | null
          reward_granted?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
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
      support_chats: {
        Row: {
          created_at: string
          id: string
          is_from_support: boolean | null
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_from_support?: boolean | null
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_from_support?: boolean | null
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          ban_type: string
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          lifted_at: string | null
          reason: string
          user_id: string
        }
        Insert: {
          ban_type?: string
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          reason: string
          user_id: string
        }
        Update: {
          ban_type?: string
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
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
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_public: boolean
          member_count: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          member_count?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          slug: string
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
          video_url: string | null
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
          slug: string
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          video_url?: string | null
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
          slug?: string
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          id: string
          post_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
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
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          order_id: string | null
          payment_status: string | null
          payment_type: string | null
          plan_type: string
          product_id: string | null
          refunded_at: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          order_id?: string | null
          payment_status?: string | null
          payment_type?: string | null
          plan_type?: string
          product_id?: string | null
          refunded_at?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          order_id?: string | null
          payment_status?: string | null
          payment_type?: string | null
          plan_type?: string
          product_id?: string | null
          refunded_at?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_survey_responses: {
        Row: {
          activity_level: string | null
          age: number | null
          budget_preference: string | null
          completed_at: string | null
          created_at: string | null
          current_weight: number | null
          daily_calorie_target: number | null
          daily_carb_target: number | null
          daily_fat_target: number | null
          daily_protein_target: number | null
          diet_experience: string | null
          diet_preference: string | null
          exercise_frequency: string | null
          gender: string | null
          goal_weight: number | null
          health_conditions: string[] | null
          height: number | null
          id: string
          motivation: string | null
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          budget_preference?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_weight?: number | null
          daily_calorie_target?: number | null
          daily_carb_target?: number | null
          daily_fat_target?: number | null
          daily_protein_target?: number | null
          diet_experience?: string | null
          diet_preference?: string | null
          exercise_frequency?: string | null
          gender?: string | null
          goal_weight?: number | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          motivation?: string | null
          user_id: string
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          budget_preference?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_weight?: number | null
          daily_calorie_target?: number | null
          daily_carb_target?: number | null
          daily_fat_target?: number | null
          daily_protein_target?: number | null
          diet_experience?: string | null
          diet_preference?: string | null
          exercise_frequency?: string | null
          gender?: string | null
          goal_weight?: number | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          motivation?: string | null
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
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      public_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          current_weight: number | null
          diet_preference: string | null
          diet_type: string | null
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          share_progress_publicly: boolean | null
          state: string | null
          town: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_weight?: never
          diet_preference?: string | null
          diet_type?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          share_progress_publicly?: boolean | null
          state?: string | null
          town?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_weight?: never
          diet_preference?: string | null
          diet_type?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          share_progress_publicly?: boolean | null
          state?: string | null
          town?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_points: { Args: { points_to_add: number }; Returns: undefined }
      decrement_recipe_upvotes: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      ensure_recipe_of_the_day: { Args: never; Returns: Json }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_user_plan: { Args: { p_user_id: string }; Returns: string }
      grant_course_access: {
        Args: { p_email: string; p_order_id?: string }
        Returns: Json
      }
      grant_ketopia_subscription: {
        Args: {
          p_amount?: number
          p_email: string
          p_order_id?: string
          p_plan: string
          p_product_id?: string
        }
        Returns: Json
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
      user_has_course_access: { Args: { p_user_id: string }; Returns: boolean }
      user_has_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
