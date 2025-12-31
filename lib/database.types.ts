
export type Database = {};

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

export interface UserProfileWithRelations extends UserProfile {
    children?: ChildProfile[];
    childrenCount?: number;
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
  age?: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_name: string; 
}

export interface ChildBadge {
    id: number;
    child_id: number;
    badge_id: number;
    earned_at: string;
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

export interface OrderWithRelations extends Order {
    users: { name: string; email: string } | null;
    child_profiles: { name: string } | null;
}

export interface ServiceOrder {
  id: string;
  created_at: string;
  user_id: string;
  child_id: number;
  service_id: number;
  status: OrderStatus;
  details: any;
  total: number;
  assigned_instructor_id: number | null;
}

export interface ServiceOrderWithRelations extends ServiceOrder {
    users: { name: string; email: string } | null;
    child_profiles: { name: string } | null;
    standalone_services: { name: string } | null;
    instructors: { name: string } | null;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'pending_payment';

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
  deleted_at?: string | null;
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

export interface BookingWithRelations extends CreativeWritingBooking {
    child_profiles: { name: string } | null;
    instructors: { name: string } | null;
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

export type GoalConfig = 'none' | 'predefined' | 'custom' | 'predefined_and_custom';

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
    component_keys?: string[];
    deleted_at?: string | null;
}

export interface ComparisonItem {
    id: string;
    label: string;
    type: 'boolean' | 'text'; 
    sort_order: number;
}

export interface CreativeWritingPackage {
    id: number;
    name: string;
    sessions: string;
    price: number;
    features: string[];
    popular: boolean;
    description: string; 
    detailed_description?: string; 
    target_age?: string; 
    level?: string; 
    icon_name?: string; 
    comparison_values: Record<string, boolean | string>;
}

export interface StandaloneService {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    icon_name: string;
    requires_file_upload: boolean;
    provider_type: 'company' | 'instructor';
}

export type WeeklySchedule = { [day: string]: string[] };
export type AvailableSlots = { [date: string]: string[] };

export interface PublishedWork {
    title: string;
    cover_url: string;
}

export interface Instructor {
    id: number;
    user_id: string | null;
    name: string;
    email?: string; 
    specialty: string;
    bio: string;
    avatar_url: string | null;
    slug: string;
    weekly_schedule: WeeklySchedule;
    availability: AvailableSlots;
    intro_availability: AvailableSlots;
    rate_per_session: number;
    service_rates?: { [serviceId: number]: number };
    package_rates?: { [packageId: number]: number };
    schedule_status: 'approved' | 'pending' | 'rejected';
    profile_update_status: 'approved' | 'pending' | 'rejected';
    pending_profile_data: any;
    teaching_philosophy: string;
    expertise_areas: string[];
    intro_video_url: string | null;
    published_works: PublishedWork[];
    deleted_at?: string | null;
}

export interface SiteBranding {
    logoUrl: string;
    heroImageUrl: string;
    aboutHeroImageUrl: string; 
    aboutPortalImageUrl: string; 
    joinUsImageUrl: string;
    creativeWritingPortalImageUrl: string;
    enhaLakPortalImageUrl: string;
}

export type Prices = { [key: string]: number };
export type ShippingCosts = { [country: string]: { [region: string]: number } };

export interface SocialLinks {
    id: number;
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
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
    status: 'draft' | 'published';
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
    phone: string;
    role: string;
    message: string;
    portfolio_url?: string;
    status: RequestStatus;
}

export interface AdditionalService {
    id: number;
    name: string;
    price: number;
    description: string;
}

export interface TeamMember {
    name: string;
    role: string;
    imageUrl: string;
}

export interface FAQItem {
    category: string;
    question: string;
    answer: string;
}

export interface SiteContent {
    portalPage: {
        heroTitle: string;
        heroSubtitle: string;
        heroButtonText1?: string;
        heroButtonText2?: string;
        projectsTitle: string;
        projectsSubtitle: string;
        enhaLakTitle: string;
        enhaLakDescription: string;
        enhaLakBtnText?: string;
        creativeWritingTitle: string;
        creativeWritingDescription: string;
        creativeWritingBtnText?: string;
        valuePropositionTitle: string;
        socialProofTitle?: string;
        aboutSectionTitle?: string;
        aboutSectionContent?: string;
        aboutBtnText?: string;
        testimonialsTitle: string;
        testimonialsSubtitle: string;
        blogTitle: string;
        blogSubtitle: string;
        finalCtaTitle: string;
        finalCtaSubtitle: string;
        finalCtaBtn1?: string;
        finalCtaBtn2?: string;
        showProjectsSection?: boolean;
        showStepsSection?: boolean;
        showAboutSection?: boolean;
        showTestimonialsSection?: boolean;
        showBlogSection?: boolean;
        showFinalCtaSection?: boolean;
        steps?: { title: string; description: string }[];
    };
    aboutPage: {
        heroTitle: string;
        missionStatement: string;
        ourStory: string;
        ourVision: string;
        valuesTitle: string;
        teamMembers: TeamMember[];
        teamTitle?: string;
        showTeamSection?: boolean;
    };
    enhaLakPage: {
        main: {
            heroTitle: string;
            heroSubtitle: string;
            heroBtnText?: string;
            productsTitle: string;
            howItWorksTitle: string;
            galleryTitle?: string;
            gallerySubtitle?: string;
            testimonialsTitle: string;
            testimonialsSubtitle: string;
            finalCtaTitle: string;
            finalCtaSubtitle: string;
            customStoryImageUrl: string;
            subscriptionBoxImageUrl: string;
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
            transformationSubtitle?: string;
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
            heroImageUrl: string;
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
    supportPage: {
        heroTitle: string;
        heroSubtitle: string;
        faqs: FAQItem[];
    };
}

export type SessionStatus = 'upcoming' | 'completed' | 'missed';

export interface ScheduledSession {
    id: string;
    booking_id: string;
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

export interface InstructorPayout {
    id: string;
    instructor_id: number;
    payout_date: string;
    amount: number;
    details: string;
    created_at?: string;
    created_by?: string;
}

export interface PricingSettings {
    id: number;
    company_percentage: number;
    fixed_fee: number;
}

export interface CommunicationSettings {
    support_email: string;
    join_us_email: string;
    whatsapp_number: string;
    whatsapp_default_message: string;
    instapay_url?: string;
    instapay_qr_url?: string;
    instapay_number?: string;
}

export interface JitsiSettings {
    id: number;
    domain: string;
    room_prefix: string;
    join_minutes_before: number;
    expire_minutes_after: number;
    start_with_audio_muted: boolean;
    start_with_video_muted: boolean;
}

export interface PublicData {
    instructors: Instructor[];
    blogPosts: BlogPost[];
    personalizedProducts: PersonalizedProduct[];
    creativeWritingPackages: CreativeWritingPackage[];
    siteContent: SiteContent;
    socialLinks: SocialLinks;
    publicHolidays: string[];
    subscriptionPlans: SubscriptionPlan[];
    standaloneServices: StandaloneService[];
    communicationSettings: CommunicationSettings;
    badges: Badge[];
    comparisonItems: ComparisonItem[];
}
