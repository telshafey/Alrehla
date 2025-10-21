import type { UserProfile } from '../contexts/AuthContext.tsx';
// FIX: Imported Prices, ShippingCosts, and SiteBranding from ProductContext.tsx
import type { Prices, ShippingCosts, SiteBranding } from '../contexts/ProductContext.tsx';
import type { Order, PersonalizedProduct, CreativeWritingPackage, Instructor, BlogPost, SocialLinks, Subscription, CreativeWritingBooking, JoinRequest, SupportTicket, ChildProfile, OrderDetailsJson } from '../lib/database.types.ts';
import { staffRoles, roleNames } from '../lib/roles.ts';

// --- MOCK DATA ---

export const mockUsers: UserProfile[] = [
  { id: 'user-1', name: 'علياء محمد', email: 'guardian@alrehlah.com', created_at: '2024-01-15T10:00:00Z', role: 'guardian' },
  { id: 'user-2', name: 'أحمد المصري', email: 'instructor@alrehlah.com', created_at: '2024-01-16T11:00:00Z', role: 'instructor' },
  { id: 'user-3', name: 'فريق الإدارة', email: 'admin@alrehlah.com', created_at: '2024-01-10T09:00:00Z', role: 'super_admin' },
  { id: 'user-4', name: 'سارة خالد', email: 'student@alrehlah.com', created_at: '2024-02-01T14:00:00Z', role: 'student' },
  { id: 'user-5', name: 'نور ياسين', email: 'user@alrehlah.com', created_at: '2024-03-10T18:00:00Z', role: 'user' },
];

export const mockChildProfiles: ChildProfile[] = [
    { id: 1, user_id: 'user-1', name: 'يوسف علي', age: 7, gender: 'ذكر', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', created_at: '2024-01-15T10:05:00Z', interests: ['الديناصورات', 'الرسم'], strengths: ['شجاع', 'خياله واسع'], student_user_id: null },
    { id: 2, user_id: 'user-1', name: 'سارة علي', age: 5, gender: 'أنثى', avatar_url: 'https://i.ibb.co/ynRhp8S/female-avatar.png', created_at: '2024-02-01T14:05:00Z', interests: ['الحيوانات', 'الغناء'], strengths: ['لطيفة', 'تحب مساعدة الآخرين'], student_user_id: 'user-4' }
];


export const mockPrices: Prices = {
    story: { printed: 200, electronic: 100 },
    coloringBook: 50,
    duaBooklet: 40,
    valuesStory: 150,
    skillsStory: 150,
    giftBox: 400,
    subscriptionBox: 250,
};

export const mockShippingCosts: ShippingCosts = {
    "القاهرة": 0,
    "الجيزة": 30,
    "الإسكندرية": 40,
};

export const mockSiteBranding: SiteBranding = {
    logoUrl: "https://i.ibb.co/hHk9vL9/Alrehlah-Logo-Primary.png",
    creativeWritingLogoUrl: "https://i.ibb.co/bF9gYq2/Bidayat-Alrehla-Logo.png",
    heroImageUrl: "https://i.ibb.co/RzJzQhL/hero-image-new.jpg",
    aboutImageUrl: "https://i.ibb.co/8XYt2s5/about-us-image.jpg",
    creativeWritingPortalImageUrl: "https://i.ibb.co/n7ZJv9V/child-learning-online.jpg",
};

export const mockPersonalizedProducts: PersonalizedProduct[] = [
    { id: 1, key: 'custom_story', title: 'قصة مخصصة', description: 'قصة فريدة من نوعها يكون فيها طفلك هو البطل، معززة بالصور والتفاصيل الشخصية.', features: ['تخصيص كامل', 'طباعة فاخرة', 'نسخة إلكترونية مجانية'], image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', sort_order: 1, created_at: '2024-01-01T00:00:00Z' },
    { id: 2, key: 'gift_box', title: 'بوكس الهدية', description: 'مجموعة متكاملة تضم القصة المخصصة مع منتجات إضافية مميزة.', features: ['قصة مخصصة', 'دفتر تلوين', 'كتيب أذكار', 'صندوق هدايا أنيق'], image_url: 'https://i.ibb.co/hHk9vL9/Alrehlah-Logo-Primary.png', sort_order: 2, created_at: '2024-01-01T00:00:00Z' },
    { id: 3, key: 'coloring_book', title: 'دفتر تلوين', description: 'دفتر تلوين بشخصيات من قصة طفلك.', features: [], image_url: 'https://i.ibb.co/hHk9vL9/Alrehlah-Logo-Primary.png', sort_order: 3, created_at: '2024-01-01T00:00:00Z' },
    { id: 4, key: 'dua_booklet', title: 'كتيب الأذكار', description: 'كتيب أدعية وأذكار مصمم خصيصًا للأطفال.', features: [], image_url: 'https://i.ibb.co/hHk9vL9/Alrehlah-Logo-Primary.png', sort_order: 4, created_at: '2024-01-01T00:00:00Z' }
];

export const mockCreativeWritingPackages: CreativeWritingPackage[] = [
    { id: 1, name: 'باقة الانطلاق', sessions: '4 جلسات', price: 800, features: ['جلسات فردية', 'محفظة رقمية', 'شهادة إتمام'], popular: true, created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'باقة الإبداع', sessions: '8 جلسات', price: 1500, features: ['كل مزايا باقة الانطلاق', 'تقرير تقدم مفصل'], popular: false, created_at: '2024-01-01T00:00:00Z' }
];

export const mockInstructors: Instructor[] = [
    { id: 1, user_id: 'user-2', name: 'أحمد المصري', specialty: 'متخصص في كتابة القصة القصيرة', slug: 'ahmed-masri', bio: 'كاتب وشاعر، أؤمن أن بداخل كل طفل حكاية تنتظر من يكتشفها.', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', availability: { "25": ["10:00", "11:00"], "26": ["14:00"] }, weekly_schedule: {}, schedule_status: 'approved', created_at: '2024-01-01T00:00:00Z' },
    { id: 2, user_id: null, name: 'هبة سالم', specialty: 'خبيرة في تنمية الخيال والإبداع', slug: 'heba-salem', bio: 'أساعد الأطفال على تحويل أفكارهم إلى عوالم ساحرة من خلال الكلمات.', avatar_url: 'https://i.ibb.co/ynRhp8S/female-avatar.png', availability: {}, weekly_schedule: {}, schedule_status: 'approved', created_at: '2024-01-01T00:00:00Z' }
];

export const mockOrders: (Order & { child_profiles: { name: string } | null, users: { name: string, email: string } | null })[] = [
    { id: 'ord_123', user_id: 'user-1', child_id: 1, customer_name: 'علياء محمد', item_summary: 'قصة مخصصة', total: 230, order_date: '2024-07-20T10:00:00Z', status: 'تم التسليم', details: { childName: 'يوسف علي', childAge: '7' } as OrderDetailsJson, admin_comment: null, receipt_url: null, created_at: '2024-07-20T10:00:00Z', child_profiles: { name: 'يوسف علي' }, users: { name: 'علياء محمد', email: 'guardian@alrehlah.com' } },
    { id: 'ord_124', user_id: 'user-5', child_id: 2, customer_name: 'نور ياسين', item_summary: 'بوكس الهدية', total: 400, order_date: '2024-07-22T15:00:00Z', status: 'بانتظار الدفع', details: { childName: 'سارة علي', childAge: '5' } as OrderDetailsJson, admin_comment: null, receipt_url: null, created_at: '2024-07-22T15:00:00Z', child_profiles: { name: 'سارة علي' }, users: { name: 'نور ياسين', email: 'user@alrehlah.com' } }
];

export const mockBookings: (CreativeWritingBooking & { child_profiles: { id: number, name: string } | null, instructors: { name: string } | null })[] = [
    { id: 'book_456', user_id: 'user-1', child_id: 2, user_name: 'علياء محمد', package_id: 1, package_name: 'باقة الانطلاق', instructor_id: 1, total: 800, booking_date: '2024-08-01', booking_time: '10:00', status: 'مؤكد', session_id: 'xyz-abc-123', progress_notes: 'أظهرت سارة خيالاً واسعاً في الجلسة الأولى.', created_at: '2024-07-21T12:00:00Z', receipt_url: null, child_profiles: { id: 2, name: 'سارة علي' }, instructors: { name: 'أحمد المصري' } },
    { id: 'book_457', user_id: 'user-1', child_id: 2, user_name: 'علياء محمد', package_id: 1, package_name: 'باقة الانطلاق', instructor_id: 1, total: 800, booking_date: '2024-07-15', booking_time: '11:00', status: 'مكتمل', session_id: 'def-ghi-456', progress_notes: 'أكملنا المسودة الأولى للقصة.', created_at: '2024-07-10T12:00:00Z', receipt_url: null, child_profiles: { id: 2, name: 'سارة علي' }, instructors: { name: 'أحمد المصري' } }
];

export const mockSubscriptions: Subscription[] = [
    { id: 'sub_789', user_id: 'user-1', child_id: 1, user_name: 'علياء محمد', child_name: 'يوسف علي', price: 250, start_date: '2024-07-01', next_renewal_date: '2024-08-01', status: 'active', details: {}, created_at: '2024-07-01T00:00:00Z' }
];

export const mockBlogPosts: BlogPost[] = [
    { id: 1, title: '5 طرق لتشجيع طفلك على القراءة', slug: '5-ways-to-encourage-reading', content: 'القراءة هي بوابة العوالم...', author_name: 'فريق المنصة', status: 'published', image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', created_at: '2024-06-01T00:00:00Z', published_at: '2024-06-01T00:00:00Z' },
    { id: 2, title: 'كيف تحول وقت القصة إلى مغامرة؟', slug: 'story-time-adventure', content: 'لا تجعل وقت القصة روتينياً...', author_name: 'أحمد المصري', status: 'published', image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg', created_at: '2024-06-15T00:00:00Z', published_at: '2024-06-15T00:00:00Z' },
    { id: 3, title: 'أهمية الهوية في قصص الأطفال (مسودة)', slug: 'identity-in-children-stories', content: 'الهوية هي...', author_name: 'فريق المنصة', status: 'draft', image_url: null, created_at: '2024-07-01T00:00:00Z', published_at: null },
];

export const mockSocialLinks: SocialLinks = {
    id: 1,
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
};

export const mockSiteContent = {
    about: {
        intro_text: 'بدأت رحلتنا من سؤال بسيط: كيف نجعل أطفالنا يحبون اللغة العربية وينتمون لقصصها؟ فكان الجواب في إنشاء منصة لا تقدم محتوىً تعليمياً فحسب، بل تصنع تجارب سحرية تبقى في ذاكرة الطفل وتساهم في بناء شخصيته.',
        hero_title: 'رحلة كل طفل تبدأ بقصة',
        hero_subtitle: 'نؤمن في منصة الرحلة أن كل طفل هو بطل حكايته. لذلك، نصنع بحب وشغف قصصاً ومنتجات تربوية مخصصة، تكون مرآةً تعكس شخصية الطفل، وتعزز هويته، وتغرس فيه أسمى القيم.'
    }
};

export const mockSupportTickets: SupportTicket[] = [
    { id: 'tkt_001', name: 'خالد إبراهيم', email: 'khaled@example.com', subject: 'مشكلة في الطلب', message: 'لم أستلم النسخة الإلكترونية من قصتي.', status: 'جديدة', created_at: '2024-07-23T10:00:00Z' }
];

export const mockJoinRequests: JoinRequest[] = [
    { id: 'join_001', name: 'منى شريف', email: 'mona@example.com', role: 'رسام قصص أطفال', message: 'أنا رسامة شغوفة بعالم الأطفال وأود الانضمام لفريقكم.', portfolio_url: 'https://behance.net/mona', status: 'جديد', created_at: '2024-07-22T18:00:00Z' }
];
