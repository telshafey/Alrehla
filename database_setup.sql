-- =============================================
-- مخطط قاعدة بيانات منصة الرحلة (Supabase PostgreSQL)
-- Database Schema for Alrehla Platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- جدول 1: المستخدمين (Users)
-- يعتمد على Supabase Auth، هذا الجدول للبيانات الإضافية
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'EG',
    governorate VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'Africa/Cairo',
    currency VARCHAR(10) DEFAULT 'EGP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN (
        'user', 'parent', 'student', 'instructor', 
        'super_admin', 'general_supervisor', 'enha_lak_supervisor', 
        'creative_writing_supervisor', 'content_editor', 'support_agent', 'publisher'
    ))
);

-- =============================================
-- جدول 2: ملفات الأطفال (Child Profiles)
-- =============================================
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('ذكر', 'أنثى')),
    avatar_url TEXT,
    interests TEXT[],
    strengths TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 3: المدربين (Instructors)
-- =============================================
CREATE TABLE IF NOT EXISTS public.instructors (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    specialty VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    intro_video_url TEXT,
    teaching_philosophy TEXT,
    expertise_areas TEXT[],
    rate_per_session DECIMAL(10, 2),
    weekly_schedule JSONB DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    schedule_status VARCHAR(50) DEFAULT 'approved',
    profile_update_status VARCHAR(50) DEFAULT 'approved',
    pending_profile_data JSONB,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 4: المنتجات المخصصة (Personalized Products)
-- =============================================
CREATE TABLE IF NOT EXISTS public.personalized_products (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('hero_story', 'library_book', 'subscription_box', 'addon')),
    description TEXT,
    image_url TEXT,
    features TEXT[],
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_addon BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    has_printed_version BOOLEAN DEFAULT FALSE,
    price_printed DECIMAL(10, 2),
    price_digital DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 5: باقات الكتابة الإبداعية (Creative Writing Packages)
-- =============================================
CREATE TABLE IF NOT EXISTS public.creative_writing_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sessions INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    price_per_session DECIMAL(10, 2),
    features JSONB DEFAULT '[]',
    popular BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 6: الخدمات المستقلة (Standalone Services)
-- =============================================
CREATE TABLE IF NOT EXISTS public.standalone_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon_name VARCHAR(100),
    requires_file_upload BOOLEAN DEFAULT FALSE,
    provider_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 7: خطط الاشتراك (Subscription Plans)
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration_months INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    price_per_month DECIMAL(10, 2),
    savings_text VARCHAR(255),
    is_best_value BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 8: الطلبات (Orders)
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id INTEGER REFERENCES public.child_profiles(id) ON DELETE SET NULL,
    order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('product', 'service', 'subscription')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EGP',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_receipt_url TEXT,
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 9: الاشتراكات (Subscriptions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id INTEGER REFERENCES public.child_profiles(id) ON DELETE SET NULL,
    plan_id INTEGER NOT NULL REFERENCES public.subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_delivery_date DATE,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EGP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 10: حجز الكتابة الإبداعية (Creative Writing Bookings)
-- =============================================
CREATE TABLE IF NOT EXISTS public.creative_writing_bookings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id INTEGER REFERENCES public.child_profiles(id) ON DELETE SET NULL,
    package_id INTEGER REFERENCES public.creative_writing_packages(id),
    service_id INTEGER REFERENCES public.standalone_services(id),
    instructor_id INTEGER REFERENCES public.instructors(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EGP',
    scheduled_sessions JSONB DEFAULT '[]',
    progress_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 11: الجلسات المجدولة (Scheduled Sessions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.scheduled_sessions (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES public.creative_writing_bookings(id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES public.instructors(id),
    session_date DATE NOT NULL,
    session_time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    jitsi_room_name VARCHAR(255),
    session_notes TEXT,
    instructor_report TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 12: رسائل الجلسات (Session Messages)
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id INTEGER NOT NULL REFERENCES public.creative_writing_bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 13: مرفقات الجلسات (Session Attachments)
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id INTEGER NOT NULL REFERENCES public.creative_writing_bookings(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 14: البطاقات (Badges)
-- =============================================
CREATE TABLE IF NOT EXISTS public.badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 15: بطاقات الأطفال (Child Badges)
-- =============================================
CREATE TABLE IF NOT EXISTS public.child_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id INTEGER NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, badge_id)
);

-- =============================================
-- جدول 16: مقالات المدونة (Blog Posts)
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 17: تذاكر الدعم (Support Tickets)
-- =============================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 18: طلبات الانضمام (Join Requests)
-- =============================================
CREATE TABLE IF NOT EXISTS public.join_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100) NOT NULL,
    message TEXT,
    portfolio_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 19: إعدادات الموقع (Site Settings)
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 20: سجل النشاطات (Audit Logs)
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action VARCHAR(255) NOT NULL,
    target_description VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 21: دفعات المدربين (Instructor Payouts)
-- =============================================
CREATE TABLE IF NOT EXISTS public.instructor_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id INTEGER NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payout_date DATE NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 22: عناصر المقارنة (Comparison Items)
-- =============================================
CREATE TABLE IF NOT EXISTS public.comparison_items (
    id VARCHAR(255) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'boolean')),
    sort_order INTEGER DEFAULT 0
);

-- =============================================
-- جدول 23: إشعارات المستخدمين (Notifications)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- جدول 24: محتوى الموقع (Site Content/CMS)
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_content (
    id SERIAL PRIMARY KEY,
    section VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    language VARCHAR(10) DEFAULT 'ar',
    UNIQUE(section, key, language)
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON public.child_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.creative_writing_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.creative_writing_bookings(status);
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON public.scheduled_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- =============================================
-- Enable Row Level Security (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_writing_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_payouts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies (Basic)
-- =============================================

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'general_supervisor')
    ));

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Child Profiles: Parents can manage their children's profiles
CREATE POLICY "Parents can manage own children" 
    ON public.child_profiles FOR ALL 
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'general_supervisor')
    ));

-- Orders: Users can see their own orders
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'general_supervisor', 'enha_lak_supervisor', 'creative_writing_supervisor')
    ));

-- Notifications: Users can see their own notifications
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

-- Notifications: Users can update read status
CREATE POLICY "Users can update own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- Blog Posts: Everyone can read published posts
CREATE POLICY "Everyone can read published posts" 
    ON public.blog_posts FOR SELECT 
    USING (status = 'published' OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'content_editor')
    ));

-- Instructors: Everyone can read instructor profiles
CREATE POLICY "Everyone can read instructors" 
    ON public.instructors FOR SELECT 
    USING (deleted_at IS NULL);

-- Products: Everyone can read active products
CREATE POLICY "Everyone can read active products" 
    ON public.personalized_products FOR SELECT 
    USING (is_active = TRUE);

-- Packages: Everyone can read active packages
CREATE POLICY "Everyone can read active packages" 
    ON public.creative_writing_packages FOR SELECT 
    USING (is_active = TRUE);

-- Services: Everyone can read active services
CREATE POLICY "Everyone can read active services" 
    ON public.standalone_services FOR SELECT 
    USING (is_active = TRUE);

-- Subscription Plans: Everyone can read active plans
CREATE POLICY "Everyone can read active plans" 
    ON public.subscription_plans FOR SELECT 
    USING (is_active = TRUE);

-- Site Settings: Everyone can read
CREATE POLICY "Everyone can read site settings" 
    ON public.site_settings FOR SELECT 
    USING (TRUE);

-- Site Content: Everyone can read
CREATE POLICY "Everyone can read site content" 
    ON public.site_content FOR SELECT 
    USING (TRUE);

-- =============================================
-- Functions
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON public.child_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON public.instructors 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.personalized_products 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.creative_writing_packages 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.standalone_services 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.creative_writing_bookings 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Insert default data
-- =============================================

-- Default comparison items
INSERT INTO public.comparison_items (id, label, type, sort_order) VALUES
('level_compare', 'المستوى التعليمي', 'text', 1),
('target_age_compare', 'الفئة العمرية', 'text', 2),
('digital_portfolio', 'محفظة رقمية للأعمال', 'boolean', 3),
('certificate', 'شهادة إتمام', 'boolean', 4),
('publication', 'نشر عمل في المجلة', 'boolean', 5),
('mentoring', 'جلسات إرشاد إضافية', 'boolean', 6)
ON CONFLICT (id) DO NOTHING;

-- Default badges
INSERT INTO public.badges (name, description, icon_name) VALUES
('المبدع الصغير', 'أتم الطالب رحلته الأولى في الكتابة الإبداعية', 'star'),
('البطل القصصي', 'ظهر الطالب كبطل في قصة مخصصة', 'book-open'),
('المحفز المستمر', 'أكمل 5 جلسات كتابة إبداعية', 'flame')
ON CONFLICT DO NOTHING;

-- Default site settings
INSERT INTO public.site_settings (key, value) VALUES
('branding', '{"site_name": "منصة الرحلة", "tagline": "رحلة طفلك من البطل إلى المبدع"}'::jsonb),
('prices', '{"currency": "EGP", "tax_rate": 0.14}'::jsonb),
('global_content', '{"contact_email": "support@alrehlah.com", "whatsapp": "+201000000000"}'::jsonb)
ON CONFLICT (key) DO NOTHING;