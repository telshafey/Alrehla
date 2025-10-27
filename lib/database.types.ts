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
      // This is a simplified mock. A real Supabase schema would be much more detailed.
      profiles: {
        Row: UserProfile
        Insert: any
        Update: any
      }
      child_profiles: {
        Row: ChildProfile
        Insert: any
        Update: any
      }
      orders: {
        Row: Order
        Insert: any
        Update: any
      }
      creative_writing_bookings: {
        Row: CreativeWritingBooking
        Insert: any
        Update: any
      }
      personalized_products: {
        Row: PersonalizedProduct
        Insert: any
        Update: any
      },
      instructors: {
        Row: Instructor
        Insert: any
        Update: any
      },
      support_tickets: {
        Row: SupportTicket
        Insert: any
        Update: any
      },
      join_requests: {
        Row: JoinRequest
        Insert: any
        Update: any
      },
      blog_posts: {
        Row: BlogPost
        Insert: any
        Update: any
      },
      subscriptions: {
        Row: Subscription
        Insert: any
        Update: any
      },
      site_settings: {
        Row: any
        Insert: any
        Update: any
      }
      creative_writing_packages: {
        Row: CreativeWritingPackage
        Insert: any
        Update: any
      },
      additional_services: {
        Row: AdditionalService
        Insert: any
        Update: any
      },
      scheduled_sessions: {
        Row: ScheduledSession
        Insert: any
        Update: any
      },
      session_messages: {
        Row: SessionMessage
        Insert: any
        Update: any
      },
      session_attachments: {
        Row: SessionAttachment
        Insert: any
        Update: any
      },
      support_session_requests: {
        Row: SupportSessionRequest
        Insert: any
        Update: any
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      order_status: OrderStatus
      booking_status: BookingStatus
      ticket_status: TicketStatus
      request_status: RequestStatus
      schedule_status: 'pending' | 'approved' | 'rejected'
      post_status: 'draft' | 'published'
      subscription_status: 'active' | 'paused' | 'cancelled' | 'pending_payment'
      session_status: SessionStatus
      support_session_request_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type UserRole =
  | 'user'
  | 'parent'
  | 'student'
  | 'super_admin'
  | 'general_supervisor'
  | 'enha_lak_supervisor'
  | 'creative_writing_supervisor'
  | 'instructor'
  | 'content_editor'
  | 'support_agent';

export type OrderStatus = "بانتظار الدفع" | "بانتظار المراجعة" | "قيد التجهيز" | "يحتاج مراجعة" | "تم الشحن" | "تم التسليم" | "ملغي";
export type BookingStatus = "بانتظار الدفع" | "مؤكد" | "مكتمل" | "ملغي";
export type TicketStatus = "جديدة" | "تمت المراجعة" | "مغلقة";
export type RequestStatus = "جديد" | "تمت المراجعة" | "مقبول" | "مرفوض";
export type SessionStatus = 'upcoming' | 'completed' | 'missed';


export interface UserProfile {
  id: string
  name: string
  email: string
  created_at: string
  role: UserRole
}
export interface UserProfileWithRelations extends UserProfile {
  children: ChildProfile[];
}

export interface ChildProfile {
  id: number
  user_id: string
  name: string
  age: number
  gender: 'ذكر' | 'أنثى'
  avatar_url: string | null
  interests: string[] | null
  strengths: string[] | null
  created_at: string
  student_user_id: string | null;
}

export interface PersonalizedProduct {
    id: number;
    key: string;
    title: string;
    description: string | null;
    image_url: string | null;
    features: string[];
    sort_order: number | null;
}

export interface Order {
    id: string;
    user_id: string;
    child_id: number | null;
    order_date: string;
    status: OrderStatus;
    total: number;
    item_summary: string;
    details: Json;
    admin_comment: string | null;
    receipt_url: string | null;
}

export interface OrderWithRelations extends Order {
  child_profiles: { name: string } | null;
  users: { name: string; email: string } | null;
}

export interface CreativeWritingBooking {
  id: string;
  user_id: string;
  user_name: string;
  child_id: number;
  instructor_id: number | null;
  package_name: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  total: number;
  receipt_url: string | null;
  progress_notes: string | null;
  session_id: string;
  created_at: string;
}

export type BookingWithRelations = CreativeWritingBooking & {
    child_profiles: { name: string } | null;
    instructors: { name: string } | null;
};

export type AvailableSlots = { [day: string]: string[] };
export type WeeklySchedule = { [day in 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday']?: string[] };


export interface Instructor {
  id: number;
  user_id: string | null;
  name: string;
  slug: string;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
  availability: Json | null; // AvailableSlots
  weekly_schedule: Json | null; // WeeklySchedule
  schedule_status: 'pending' | 'approved' | 'rejected' | null;
  rate_per_session: number | null;
  pending_profile_data: Json | null;
  profile_update_status: 'pending' | 'approved' | null;
}

export interface Prices {
    story: {
        printed: number;
        electronic: number;
    };
    coloringBook: number;
    duaBooklet: number;
    valuesStory: number;
    skillsStory: number;
    voiceOver: number;
    giftBox: number;
    subscriptionBox: number;
}

export interface SiteBranding {
    logoUrl: string | null;
    creativeWritingLogoUrl: string | null;
    heroImageUrl: string | null;
    aboutImageUrl: string | null;
    creativeWritingPortalImageUrl: string | null;
}

export interface SocialLinks {
    id: number;
    facebook_url: string | null;
    twitter_url: string | null;
    instagram_url: string | null;
}

export interface ShippingCosts {
  [governorate: string]: number;
}

export interface SupportTicket {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: TicketStatus;
    created_at: string;
}

export interface JoinRequest {
    id: string;
    name: string;
    email: string;
    role: string;
    message: string;
    status: RequestStatus;
    portfolio_url: string | null;
    created_at: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    author_name: string;
    image_url: string | null;
    status: 'draft' | 'published';
    published_at: string | null;
    created_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    user_name: string;
    child_id: number;
    child_name: string;
    start_date: string;
    next_renewal_date: string;
    status: 'active' | 'paused' | 'cancelled' | 'pending_payment';
}

export interface CreativeWritingPackage {
    id: number;
    name: string;
    sessions: string;
    price: number;
    features: string[];
    popular: boolean;
    goal_description: string | null;
    final_product_description: string | null;
}

export interface AdditionalService {
    id: number;
    name: string;
    price: number;
    description: string | null;
}

// --- NEW SESSION MANAGEMENT SYSTEM TYPES ---

export interface ScheduledSession {
  id: string;
  subscription_id: string | null;
  booking_id: string | null;
  child_id: number;
  instructor_id: number;
  session_date: string; // ISO string for date and time
  status: SessionStatus;
  created_at: string;
}

export interface SessionMessage {
  id: string;
  booking_id: string; // Linked to the journey/booking
  sender_id: string;
  sender_role: 'student' | 'instructor';
  message_text: string;
  created_at: string; // Using created_at for timestamp
}

export interface SessionAttachment {
  id: string;
  booking_id: string; // Linked to the journey/booking
  uploader_id: string;
  uploader_role: 'student' | 'instructor';
  file_name: string;
  file_url: string;
  created_at: string; // Using created_at for timestamp
}

export interface SupportSessionRequest {
  id: string;
  instructor_id: number;
  child_id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}