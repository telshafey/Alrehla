export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      additional_services: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          created_at: string
          history: Json | null
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          history?: Json | null
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          history?: Json | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_posts: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: number
          image_url: string | null
          published_at: string | null
          slug: string
          status: "draft" | "published"
          title: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: number
          image_url?: string | null
          published_at?: string | null
          slug: string
          status: "draft" | "published"
          title: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: number
          image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: "draft" | "published"
          title?: string
        }
        Relationships: []
      }
      child_profiles: {
        Row: {
          age: number
          avatar_url: string | null
          created_at: string
          gender: "ذكر" | "أنثى"
          id: number
          interests: string[] | null
          name: string
          strengths: string[] | null
          student_user_id: string | null
          user_id: string
        }
        Insert: {
          age: number
          avatar_url?: string | null
          created_at?: string
          gender: "ذكر" | "أنثى"
          id?: number
          interests?: string[] | null
          name: string
          strengths?: string[] | null
          student_user_id?: string | null
          user_id: string
        }
        Update: {
          age?: number
          avatar_url?: string | null
          created_at?: string
          gender?: "ذكر" | "أنثى"
          id?: number
          interests?: string[] | null
          name?: string
          strengths?: string[] | null
          student_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_student_user_id_fkey"
            columns: ["student_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      creative_writing_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          child_id: number
          created_at: string
          id: string
          instructor_id: number
          package_id: number
          package_name: string
          progress_notes: string | null
          receipt_url: string | null
          session_id: string | null
          status:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "مؤكد"
            | "مكتمل"
            | "ملغي"
          total: number
          user_id: string
          user_name: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          child_id: number
          created_at?: string
          id: string
          instructor_id: number
          package_id: number
          package_name: string
          progress_notes?: string | null
          receipt_url?: string | null
          session_id?: string | null
          status:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "مؤكد"
            | "مكتمل"
            | "ملغي"
          total: number
          user_id: string
          user_name: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          child_id?: number
          created_at?: string
          id?: string
          instructor_id?: number
          package_id?: number
          package_name?: string
          progress_notes?: string | null
          receipt_url?: string | null
          session_id?: string | null
          status?:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "مؤكد"
            | "مكتمل"
            | "ملغي"
          total?: number
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_writing_bookings_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_writing_bookings_instructor_id_fkey"
            columns: ["instructor_id"]
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_writing_bookings_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "creative_writing_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_writing_bookings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      creative_writing_packages: {
        Row: {
          created_at: string
          features: string[]
          id: number
          name: string
          popular: boolean | null
          price: number
          sessions: string
        }
        Insert: {
          created_at?: string
          features: string[]
          id?: number
          name: string
          popular?: boolean | null
          price: number
          sessions: string
        }
        Update: {
          created_at?: string
          features?: string[]
          id?: number
          name?: string
          popular?: boolean | null
          price?: number
          sessions?: string
        }
        Relationships: []
      }
      instructor_reviews: {
        Row: {
          comment: string
          created_at: string
          id: number
          instructor_id: number
          rating: number
          student_name: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: number
          instructor_id: number
          rating: number
          student_name: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: number
          instructor_id?: number
          rating?: number
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_reviews_instructor_id_fkey"
            columns: ["instructor_id"]
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructor_reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      instructors: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: number
          name: string
          schedule_status: "approved" | "pending" | "rejected" | null
          slug: string
          specialty: string
          user_id: string | null
          weekly_schedule: Json | null
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: number
          name: string
          schedule_status?: "approved" | "pending" | "rejected" | null
          slug: string
          specialty: string
          user_id?: string | null
          weekly_schedule?: Json | null
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: number
          name?: string
          schedule_status?: "approved" | "pending" | "rejected" | null
          slug?: string
          specialty?: string
          user_id?: string | null
          weekly_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      join_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          portfolio_url: string | null
          role: string
          status: "جديد" | "تمت المراجعة" | "مقبول" | "مرفوض"
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          message: string
          name: string
          portfolio_url?: string | null
          role: string
          status: "جديد" | "تمت المراجعة" | "مقبول" | "مرفوض"
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          portfolio_url?: string | null
          role?: string
          status?: "جديد" | "تمت المراجعة" | "مقبول" | "مرفوض"
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_comment: string | null
          child_id: number
          created_at: string
          customer_name: string
          details: Json | null
          id: string
          item_summary: string
          order_date: string
          receipt_url: string | null
          status:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "قيد التجهيز"
            | "يحتاج مراجعة"
            | "تم الشحن"
            | "تم التسليم"
            | "ملغي"
          total: number
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          child_id: number
          created_at?: string
          customer_name: string
          details?: Json | null
          id: string
          item_summary: string
          order_date: string
          receipt_url?: string | null
          status:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "قيد التجهيز"
            | "يحتاج مراجعة"
            | "تم الشحن"
            | "تم التسليم"
            | "ملغي"
          total: number
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          child_id?: number
          created_at?: string
          customer_name?: string
          details?: Json | null
          id?: string
          item_summary?: string
          order_date?: string
          receipt_url?: string | null
          status?:
            | "بانتظار الدفع"
            | "بانتظار المراجعة"
            | "قيد التجهيز"
            | "يحتاج مراجعة"
            | "تم الشحن"
            | "تم التسليم"
            | "ملغي"
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      personalized_products: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: number
          image_url: string | null
          key: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: number
          image_url?: string | null
          key: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: number
          image_url?: string | null
          key?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json | null
          id: string
          last_updated: string
        }
        Insert: {
          content?: Json | null
          id: string
          last_updated?: string
        }
        Update: {
          content?: Json | null
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          prices: Json | null
          shipping_costs: Json | null
          site_branding: Json | null
        }
        Insert: {
          id?: number
          prices?: Json | null
          shipping_costs?: Json | null
          site_branding?: Json | null
        }
        Update: {
          id?: number
          prices?: Json | null
          shipping_costs?: Json | null
          site_branding?: Json | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          facebook_url: string | null
          id: number
          instagram_url: string | null
          twitter_url: string | null
        }
        Insert: {
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          twitter_url?: string | null
        }
        Update: {
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          twitter_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          child_id: number
          child_name: string
          created_at: string
          details: Json | null
          id: string
          next_renewal_date: string
          price: number
          start_date: string
          status: "active" | "paused" | "cancelled" | "pending_payment"
          user_id: string
          user_name: string
        }
        Insert: {
          child_id: number
          child_name: string
          created_at?: string
          details?: Json | null
          id: string
          next_renewal_date: string
          price: number
          start_date: string
          status: "active" | "paused" | "cancelled" | "pending_payment"
          user_id: string
          user_name: string
        }
        Update: {
          child_id?: number
          child_name?: string
          created_at?: string
          details?: Json | null
          id?: string
          next_renewal_date?: string
          price?: number
          start_date?: string
          status?: "active" | "paused" | "cancelled" | "pending_payment"
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: "جديدة" | "تمت المراجعة" | "مغلقة"
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          message: string
          name: string
          status: "جديدة" | "تمت المراجعة" | "مغلقة"
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: "جديدة" | "تمت المراجعة" | "مغلقة"
          subject?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role:
            | "user"
            | "guardian"
            | "super_admin"
            | "enha_lak_supervisor"
            | "creative_writing_supervisor"
            | "instructor"
            | "content_editor"
            | "support_agent"
            | "student"
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?:
            | "user"
            | "guardian"
            | "super_admin"
            | "enha_lak_supervisor"
            | "creative_writing_supervisor"
            | "instructor"
            | "content_editor"
            | "support_agent"
            | "student"
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?:
            | "user"
            | "guardian"
            | "super_admin"
            | "enha_lak_supervisor"
            | "creative_writing_supervisor"
            | "instructor"
            | "content_editor"
            | "support_agent"
            | "student"
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type UserRole = Database["public"]["Tables"]["users"]["Row"]["role"];
// Re-export specific types for convenience
export type Order = Database['public']['Tables']['orders']['Row'];
export type ChildProfile = Database['public']['Tables']['child_profiles']['Row'];
export type Instructor = Database['public']['Tables']['instructors']['Row'];
export type PersonalizedProduct = Database['public']['Tables']['personalized_products']['Row'];
export type SocialLinks = Database['public']['Tables']['social_links']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type CreativeWritingPackage = Database['public']['Tables']['creative_writing_packages']['Row'];
export type AdditionalService = Database['public']['Tables']['additional_services']['Row'];
export type CreativeWritingBooking = Database['public']['Tables']['creative_writing_bookings']['Row'];
export type InstructorReview = Database['public']['Tables']['instructor_reviews']['Row'];
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
export type JoinRequest = Database['public']['Tables']['join_requests']['Row'];
export type AiChatHistory = Database['public']['Tables']['ai_chat_history']['Row'];
export type AvailableSlots = { [day: string]: string[] };
export type WeeklySchedule = { [day in 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday']?: string[] };
export type OrderDetailsJson = {
    childName: string;
    childAge: string;
    childGender: 'ذكر' | 'أنثى';
    familyNames?: string;
    friendNames?: string;
    childTraits?: string;
    storyValue?: string;
    customGoal?: string;
    deliveryType?: 'printed' | 'electronic';
    shippingOption?: 'my_address' | 'gift';
    governorate?: string;
    giftDetails?: {
        name: string;
        address: string;
        phone: string;
    };
    images?: { [key: string]: string };
    products?: string;
    shipping?: any;
};

export type UserOrder = Order & { child_profiles: { name: string } | null };