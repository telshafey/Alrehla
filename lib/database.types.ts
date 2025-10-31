export type Database = {};

export type UserRole =
  | 'user'
  | 'student'
  | 'super_admin'
  | 'general_supervisor'
  | 'enha_lak_supervisor'
  | 'creative_writing_supervisor'
  | 'instructor'
  | 'content_editor'
  | 'support_agent';

export interface UserProfile {
  id: string;
  created_at: string;
  last_sign_in_at?: string | null;
  name: string;
  email: string;
  role: UserRole;
  address?: string | null;
  governorate?: string | null;
  phone?: string | null;
}

export interface ChildProfile {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  birth_date: string;
  gender: 'أنثى' | 'ذكر';
  avatar_url: string | null;
  interests: string[] | null;
  strengths: string[] | null;
  student_user_id: string | null;
}

export interface Notification {
  id: number;
  user_id: string;
  created_at: string;
  message: string;
  link: string;
  read: boolean;
  type: 'order' | 'booking' | string;
}

export type OrderStatus =
  | 'بانتظار الدفع'
  | 'بانتظار المراجعة'
  | 'قيد التجهيز'
  | 'يحتاج مراجعة'
  | 'تم الشحن'
  | 'تم التسليم'
  | 'ملغي'
  | 'قيد التنفيذ'
  | 'مكتمل';

export interface Order {
  id: string;
  order_date: string;
  user_id: string;
  child_id: number;
  item_summary: string;
  total: number;
  status: OrderStatus;
  details: any;
  admin_comment: string | null;
  receipt_url: string | null;
}

export interface ServiceOrder {
  id: string;
  created_at: string;
  user_id: string;
  child_id: number;
  service_id: number;
  status: OrderStatus;
  details: any; // e.g., { fileUrl: '...', userNotes: '...' }
  total: number;
  assigned_instructor_id: number | null;
}

export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'pending_payment';

export interface Subscription {
  id: string;
  user_id: string;
  child_id: number;
  start_date: string;
  next_renewal_date: string;
  status: SubscriptionStatus;
  user_name: string;
  child_name: string;
  plan_name: string;
  total: number;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  duration_months: number;
  price: number;
  price_per_month: number;
  savings_text: string;
  is_best_value?: boolean;
}

export type BookingStatus = 'بانتظار الدفع' | 'مؤكد' | 'مكتمل' | 'ملغي';

export interface CreativeWritingBooking {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  child_id: number;
  package_name: string;
  instructor_id: number;
  booking_date: string;
  booking_time: string;
  total: number;
  status: BookingStatus;
  progress_notes: string | null;
  receipt_url: string | null;
  session_id: string;
}

export interface ImageSlotConfig {
  id: string;
  label: string;
  required: boolean;
}

export interface TextFieldConfig {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'textarea' | 'input';
}

export interface StoryGoal {
  key: string;
  title: string;
}

export type GoalConfig =
  | 'none'
  | 'predefined'
  | 'custom'
  | 'predefined_and_custom';

export interface PersonalizedProduct {
  id: number;
  created_at: string;
  key: string;
  title: string;
  description: string;
  image_url: string | null;
  features: string[];
  sort_order: number;
  is_featured: boolean;
  is_addon: boolean;
  has_printed_version: boolean;
  price_printed: number | null;
  price_electronic: number | null;
  goal_config: GoalConfig;
  story_goals: StoryGoal[];
  image_slots: ImageSlotConfig[];
  text_fields: TextFieldConfig[];
}

export interface CreativeWritingPackage {
  id: number;
  name: string;
  sessions: string;
  price: number;
  features: string[];
  popular: boolean;
  description: string;
}

export interface AdditionalService {
  id: number;
  name: string;
  price: number;
  description: string | null;
}

export interface StandaloneService {
  id: number;
  name: string;
  price: number;
  description: string;
  category: 'استشارات' | 'مراجعات' | 'نشر';
  icon_name: string; // e.g., 'MessageSquare', 'FileCheck2'
  requires_file_upload: boolean;
  provider_type: 'company' | 'instructor';
}

export type WeeklySchedule = {
  [day in
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday']?: string[];
};

export type AvailableSlots = {
  [date: string]: string[]; // date is 'YYYY-MM-DD'
};

export interface Instructor {
  id: number;
  user_id: string | null;
  name: string;
  specialty: string;
  bio: string;
  avatar_url: string | null;
  slug: string;
  weekly_schedule: WeeklySchedule | {};
  availability: AvailableSlots | {};
  intro_availability: AvailableSlots | {};
  rate_per_session: number;
  service_rates?: { [key: string]: number } | null;
  package_rates?: { [key: string]: number } | null;
  schedule_status: 'approved' | 'pending' | 'rejected';
  profile_update_status: 'approved' | 'pending' | 'rejected';
  pending_profile_data: any | null;
}

export interface InstructorPayout {
  id: string;
  instructor_id: number;
  payout_date: string;
  amount: number;
  details: string; // e.g., "Payout for August 2024"
}

export interface SiteBranding {
  logoUrl: string;
  heroImageUrl: string;
  aboutImageUrl: string;
  creativeWritingPortalImageUrl: string;
  enhaLakPortalImageUrl: string;
}

export type Prices = { [key: string]: number };

export type ShippingCosts = { [country: string]: { [region: string]: number } };

export interface SocialLinks {
  id: number;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
}

export interface AiSettings {
  id: number;
  enable_story_ideas: boolean;
  story_ideas_prompt: string;
}

export interface BlogPost {
  id: number;
  created_at: string;
  published_at: string | null;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  author_name: string;
  status: 'published' | 'draft';
}

export type TicketStatus = 'جديدة' | 'تمت المراجعة' | 'مغلقة';

export interface SupportTicket {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: TicketStatus;
}

export type RequestStatus = 'جديد' | 'تمت المراجعة' | 'مقبول' | 'مرفوض';

export interface JoinRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  role: string;
  message: string;
  status: RequestStatus;
  portfolio_url: string | null;
}

export interface SiteContent {
  portalPage: {
    heroTitle: string;
    heroSubtitle: string;
    projectsTitle: string;
    projectsSubtitle: string;
    enhaLakTitle: string;
    enhaLakDescription: string;
    creativeWritingTitle: string;
    creativeWritingDescription: string;
    valuePropositionTitle: string;
    socialProofTitle: string; // Not currently used, but good to have
    aboutSectionTitle: string;
    aboutSectionContent: string;
    testimonialsTitle: string;
    testimonialsSubtitle: string;
    blogTitle: string;
    blogSubtitle: string;
    finalCtaTitle: string;
    finalCtaSubtitle: string;
  };
  aboutPage: {
    heroTitle: string;
    missionStatement: string;
    ourStory: string;
    ourVision: string;
    valuesTitle: string;
  };
  enhaLakPage: {
    main: {
      heroTitle: string;
      heroSubtitle: string;
      productsTitle: string;
      howItWorksTitle: string;
      galleryTitle: string;
      gallerySubtitle: string;
      testimonialsTitle: string;
      testimonialsSubtitle: string;
      finalCtaTitle: string;
      finalCtaSubtitle: string;
    };
    store: {
      heroTitle: string;
      heroSubtitle: string;
      subscriptionBannerTitle: string;
      featuredProductsTitle: string;
      coreProductsTitle: string;
      addonProductsTitle: string;
    };
    subscription: {
      heroTitle: string;
      heroSubtitle: string;
      features: string[];
    };
  };
  creativeWritingPage: {
    main: {
      heroTitle: string;
      heroSubtitle: string;
      methodologyTitle: string;
      methodologySubtitle: string;
      transformationTitle: string;
      transformationSubtitle: string;
      packagesTitle: string;
      packagesSubtitle: string;
      servicesTitle: string;
      servicesSubtitle: string;
      instructorsTitle: string;
      instructorsSubtitle: string;
      testimonialsTitle: string;
      testimonialsSubtitle: string;
      finalCtaTitle: string;
      finalCtaSubtitle: string;
    };
    about: {
      heroTitle: string;
      heroSubtitle: string;
      mainTitle: string;
      mainContent: string;
      philosophyTitle: string;
    };
    curriculum: {
      heroTitle: string;
      heroSubtitle: string;
      treasuresTitle: string;
      treasuresSubtitle: string;
    };
    instructors: {
      heroTitle: string;
      heroSubtitle: string;
    };
  };
}


export type SessionStatus = 'upcoming' | 'completed' | 'missed';

export interface ScheduledSession {
  id: string;
  booking_id: string | null;
  subscription_id: string | null;
  child_id: number;
  instructor_id: number;
  session_date: string;
  status: SessionStatus;
}

export interface SessionMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: 'instructor' | 'student' | 'user';
  message_text: string;
  created_at: string;
}

export interface SessionAttachment {
  id: string;
  booking_id: string;
  uploader_id: string;
  uploader_role: 'instructor' | 'student' | 'user';
  file_name: string;
  file_url: string;
  created_at: string;
}

export interface SupportSessionRequest {
  id: string;
  instructor_id: number;
  child_id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

export interface PricingSettings {
  id: number;
  company_percentage: number; // Markup multiplier, e.g., 1.2 for 20%
  fixed_fee: number; // A fixed fee added to the price
}

// Helper types for enriched data
export type UserProfileWithRelations = UserProfile & {
  children: ChildProfile[];
  childrenCount: number;
};

export type OrderWithRelations = Order & {
  users: { name: string; email: string } | null;
  child_profiles: { name: string } | null;
};

export type BookingWithRelations = CreativeWritingBooking & {
  users: { name: string; email: string } | null;
  child_profiles: { name: string } | null;
  instructors: { name: string } | null;
};

export type ServiceOrderWithRelations = ServiceOrder & {
  users: { name: string; email: string } | null;
  child_profiles: { name: string } | null;
  instructors: { name: string } | null;
  standalone_services: { name: string } | null;
};