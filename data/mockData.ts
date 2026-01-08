
import type { 
    UserProfile, ChildProfile, Notification, Order, Subscription, CreativeWritingBooking, 
    PersonalizedProduct, CreativeWritingPackage, Instructor, SiteBranding, Prices, ShippingCosts, 
    SocialLinks, BlogPost, SupportTicket, JoinRequest, AdditionalService, SiteContent, ScheduledSession, SessionMessage, SessionAttachment, SupportSessionRequest,
    SubscriptionPlan,
    StandaloneService,
    ServiceOrder,
    InstructorPayout,
    PricingSettings,
    Badge,
    ChildBadge,
    CommunicationSettings,
    JitsiSettings,
    UserRole,
    ComparisonItem
} from '../lib/database.types';
import { permissionsByRole } from '../lib/roles';

// New Comparison Criteria Data (Removed num_sessions)
export const mockComparisonItems: ComparisonItem[] = [
    { id: 'level_compare', label: 'المستوى التعليمي', type: 'text', sort_order: 1 },
    { id: 'target_age_compare', label: 'الفئة العمرية', type: 'text', sort_order: 2 },
    { id: 'digital_portfolio', label: 'محفظة رقمية للأعمال', type: 'boolean', sort_order: 3 },
    { id: 'certificate', label: 'شهادة إتمام', type: 'boolean', sort_order: 4 },
    { id: 'publication', label: 'نشر عمل في المجلة', type: 'boolean', sort_order: 5 },
    { id: 'mentoring', label: 'جلسات إرشاد إضافية', type: 'boolean', sort_order: 6 },
];

export const mockUsers: UserProfile[] = [
    { id: 'usr_parent', created_at: '2023-08-01T10:00:00Z', last_sign_in_at: '2024-08-10T12:00:00Z', name: 'أحمد عبدالله', email: 'parent@alrehlah.com', role: 'user', address: '123 شارع المثال، مدينة نصر', governorate: 'القاهرة', phone: '01234567890' },
    { id: 'usr_user', created_at: '2024-01-02T10:00:00Z', last_sign_in_at: '2024-08-09T11:00:00Z', name: 'سارة خالد', email: 'user@alrehlah.com', role: 'user' },
    { id: 'usr_student', created_at: '2024-02-03T10:00:00Z', last_sign_in_at: '2024-08-10T09:30:00Z', name: 'علي أحمد', email: 'student@alrehlah.com', role: 'student' },
    { id: 'usr_new_demo', created_at: new Date().toISOString(), last_sign_in_at: null, name: 'ماجد وليد', email: 'majed@test.com', role: 'user', phone: '01011122233', governorate: 'الجيزة', address: '6 أكتوبر, الحي الثاني' },
    { id: 'usr_admin', created_at: '2023-01-04T10:00:00Z', last_sign_in_at: '2024-08-10T15:00:00Z', name: 'مدير النظام', email: 'admin@alrehlah.com', role: 'super_admin' },
    { id: 'usr_supervisor', created_at: '2023-01-05T10:00:00Z', last_sign_in_at: '2024-08-08T14:00:00Z', name: 'مشرف عام', email: 'supervisor@alrehlah.com', role: 'general_supervisor' },
    { id: 'usr_cws', created_at: '2023-05-06T10:00:00Z', last_sign_in_at: null, name: 'مشرف بداية الرحلة', email: 'cws@alrehlah.com', role: 'creative_writing_supervisor' },
    { id: 'usr_instructor_1', created_at: '2023-06-07T10:00:00Z', last_sign_in_at: '2024-08-10T13:00:00Z', name: 'أ. أحمد المصري', email: 'instructor@alrehlah.com', role: 'instructor' },
    { id: 'usr_support', created_at: '2023-07-08T10:00:00Z', last_sign_in_at: '2024-08-07T10:00:00Z', name: 'وكيل دعم', email: 'support@alrehlah.com', role: 'support_agent' },
    { id: 'usr_editor', created_at: '2024-06-09T10:00:00Z', last_sign_in_at: '2024-08-05T18:00:00Z', name: 'محرر محتوى', email: 'editor@alrehlah.com', role: 'content_editor' },
    { id: 'usr_els', created_at: '2024-07-10T10:00:00Z', last_sign_in_at: '2024-08-09T16:00:00Z', name: 'مشرف إنها لك', email: 'enhalak@alrehlah.com', role: 'enha_lak_supervisor' },
];

export const mockChildProfiles: ChildProfile[] = [
    { id: 1, created_at: '2023-01-10T10:00:00Z', user_id: 'usr_parent', name: 'فاطمة أحمد', birth_date: '2016-05-10', gender: 'أنثى', avatar_url: 'https://placehold.co/400x400?text=Fatima', interests: ['الرسم', 'الفضاء'], strengths: ['مبدعة', 'فضولية'], student_user_id: 'usr_student', age: 7 },
    { id: 2, created_at: '2023-02-15T10:00:00Z', user_id: 'usr_parent', name: 'عمر أحمد', birth_date: '2018-03-22', gender: 'ذكر', avatar_url: 'https://placehold.co/400x400?text=Omar', interests: ['الديناصورات', 'السيارات'], strengths: ['شجاع'], student_user_id: null, age: 5 },
    { id: 99, created_at: '2024-01-01T10:00:00Z', user_id: 'usr_new_demo', name: 'ياسين ماجد', birth_date: '2019-01-01', gender: 'ذكر', avatar_url: 'https://placehold.co/400x400?text=Yassin', interests: ['القصص', 'الحيوانات'], strengths: ['مستمع جيد'], student_user_id: null, age: 5 },
];

export const mockBadges: Badge[] = [
    { id: 1, name: 'الكاتب الناشئ', description: 'أكملت أول قصة قصيرة لك!', icon_name: 'Feather' },
    { id: 2, name: 'صانع العوالم', description: 'أتممت رحلة تدريبية كاملة!', icon_name: 'Globe2' },
    { id: 3, name: 'البطل الملتزم', description: 'حضرت 5 جلسات متتالية.', icon_name: 'Trophy' },
    { id: 4, name: 'مستكشف الكلمات', description: 'استخدمت 10 كلمات جديدة ومميزة.', icon_name: 'Search' },
    { id: 5, name: 'نجم الإلقاء', description: 'قرأت قصتك بصوت عالٍ وبثقة.', icon_name: 'Mic' },
];

export const mockChildBadges: ChildBadge[] = [
    { id: 1, child_id: 1, badge_id: 1, earned_at: '2023-07-25T10:00:00Z' },
    { id: 2, child_id: 1, badge_id: 2, earned_at: '2023-08-10T10:00:00Z' },
];

export const mockNotifications: Notification[] = [
    { id: 1, user_id: 'usr_parent', created_at: new Date().toISOString(), message: 'تم تحديث حالة طلبك #ORD-123 إلى "تم الشحن".', link: '/account', read: false, type: 'order' },
    { id: 2, user_id: 'usr_parent', created_at: new Date(Date.now() - 86400000).toISOString(), message: 'موعد جلستك القادمة بعد 24 ساعة.', link: '/account', read: true, type: 'booking' },
];

export const mockOrders: Order[] = [
    { id: 'ord_123', order_date: new Date(Date.now() - 86400000 * 2).toISOString(), user_id: 'usr_parent', child_id: 1, item_summary: 'قصة مخصصة لـ فاطمة', total: 450, status: 'تم التسليم', details: { childName: 'فاطمة', childBirthDate: '2016-05-10', productKey: 'custom_story' }, admin_comment: null, receipt_url: null },
    { id: 'ord_124', order_date: new Date().toISOString(), user_id: 'usr_parent', child_id: 2, item_summary: 'بوكس الهدية لـ عمر', total: 750, status: 'بانتظار الدفع', details: { childName: 'عمر', childBirthDate: '2018-03-22', productKey: 'gift_box' }, admin_comment: null, receipt_url: null },
];

export const mockSubscriptions: Subscription[] = [
    { id: 'sub_xyz', user_id: 'usr_parent', child_id: 1, start_date: '2023-08-01T10:00:00Z', next_renewal_date: '2024-08-01T10:00:00Z', status: 'active', user_name: 'أحمد عبدالله', child_name: 'فاطمة أحمد', plan_name: 'اشتراك سنوي', total: 3000 },
    { id: 'sub_demo_1', user_id: 'usr_new_demo', child_id: 99, start_date: '2024-02-01T10:00:00Z', next_renewal_date: '2024-03-01T10:00:00Z', status: 'active', user_name: 'ماجد وليد', child_name: 'ياسين ماجد', plan_name: 'اشتراك ربع سنوي', total: 850 },
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: 1, name: 'اشتراك ربع سنوي', duration_months: 3, price: 850, price_per_month: 283, savings_text: 'وفر 5%' },
  { id: 2, name: 'اشتراك نصف سنوي', duration_months: 6, price: 1600, price_per_month: 267, savings_text: 'وفر 10%' },
  { id: 3, name: 'اشتراك سنوي', duration_months: 12, price: 3000, price_per_month: 250, savings_text: 'وفر 15%', is_best_value: true },
];

export const mockBookings: CreativeWritingBooking[] = [
    { id: 'bk_abc', created_at: '2023-07-20T10:00:00Z', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 1, package_name: 'باقة الانطلاق', instructor_id: 1, booking_date: '2023-08-10T17:00:00Z', booking_time: '17:00', total: 1200, status: 'مؤكد', progress_notes: 'أظهرت فاطمة تقدماً ملحوظاً في بناء الشخصيات.', receipt_url: 'https://example.com/receipt.jpg', session_id: 'ses_2' },
    { id: 'bk_def', created_at: '2023-08-01T11:00:00Z', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 2, package_name: 'الجلسة التعريفية', instructor_id: 1, booking_date: '2023-08-15T14:00:00Z', booking_time: '14:00', total: 0, status: 'مؤكد', progress_notes: null, receipt_url: null, session_id: 'ses_6' }
];

export const mockPersonalizedProducts: PersonalizedProduct[] = [
    { 
        id: 99, 
        created_at: '2023-01-01', 
        key: 'subscription_box', 
        title: 'صندوق الرحلة الشهري', 
        description: 'اشتراك شهري متجدد يحتوي على قصة مخصصة وأنشطة وهدايا.', 
        image_url: 'https://placehold.co/800x800?text=Subscription+Box', 
        features: ['قصة مخصصة جديدة كل شهر', 'أنشطة تفاعلية وألعاب', 'هدية إضافية مختارة بعناية'], 
        sort_order: -1,
        is_featured: false, 
        is_addon: false, 
        has_printed_version: true,
        price_printed: null,
        price_electronic: null,
        goal_config: 'none',
        story_goals: [],
        image_slots: [],
        text_fields: []
    },
    { 
        id: 8, 
        created_at: '2023-09-01', 
        key: 'emotion_story', 
        title: 'القصة المميزة', 
        description: 'قصة علاجية مخصصة لمساعدة طفلك على فهم مشاعره والتعبير عنها بطريقة صحية، بناءً على مواقف من حياته الواقعية.', 
        image_url: 'https://placehold.co/800x800?text=Emotion+Story',
        features: ['تخصيص نفسى وسلوكي عميق', 'معالجة مشاعر محددة', 'بناء على مواقف واقعية', 'حلول تربوية إيجابية'], 
        sort_order: 0, 
        is_featured: true, 
        is_addon: false, 
        has_printed_version: true,
        price_printed: 600,
        price_electronic: 350,
        goal_config: 'predefined_and_custom',
        story_goals: [
            { key: 'anger', title: 'الغضب' },
            { key: 'fear', title: 'الخوف' },
            { key: 'jealousy', title: 'الغيرة' },
            { key: 'frustration', title: 'الإحباط' },
            { key: 'anxiety', title: 'القلق' },
            { key: 'sadness', title: 'الحزن' },
        ],
        image_slots: [
            { id: 'child_photo_1', label: 'صورة وجه الطفل (إلزامي)', required: true },
        ],
        text_fields: [
            { id: 'homeEnvironment', label: 'البيئة المنزلية (الأشخاص)', placeholder: 'أسماء الوالدين، الإخوة (مع أعمارهم التقريبية). هل يشارك في القصة أجداد أو مربية؟', required: true, type: 'textarea' },
            { id: 'friendsAndSchool', label: 'بيئة الأصدقاء والمدرسة', placeholder: 'اسم أفضل صديق أو صديقين. اسم المدرسة أو الروضة.', required: false, type: 'textarea' },
            { id: 'physicalDescription', label: 'الوصف الجسدي (البصري)', placeholder: 'وصف بسيط (لون الشعر، لون العينين، ملابس مفضلة) لوصف البطل في النص.', required: true, type: 'textarea' },
            { id: 'petInfo', label: 'الحيوان الأليف (إن وجد)', placeholder: 'الاسم ونوع الحيوان (قطة، كلب، عصفور).', required: false, type: 'textarea' },
            { id: 'triggerSituation', label: 'الموقف المُحفز للمشاعر', placeholder: 'صف لنا موقفاً واقعياً ومحدداً حدث مؤخراً أثار هذا الشعور بقوة لدى الطفل. (مثلاً: عندما يخسر لعبة فيديو).', required: true, type: 'textarea' },
            { id: 'childReaction', label: 'رد فعل الطفل النموذجي', placeholder: 'كيف يتصرف الطفل عندما يشعر بذلك؟ (مثلاً: الصراخ، العزلة، رمي الأشياء، البكاء الشديد).', required: true, type: 'textarea' },
            { id: 'calmingMethod', label: 'أسلوب التهدئة المُتبع حالياً', placeholder: 'ما هي الاستراتيجية التي تستخدمونها حالياً لتهدئة الطفل (العد، الحضن، التنفس العميق)؟', required: true, type: 'textarea' },
            { id: 'positiveBehavior', label: 'التحول الإيجابي المطلوب', placeholder: 'ما هو السلوك الإيجابي الذي تتمنى أن يعبر عنه طفلك بدلاً من ذلك؟', required: true, type: 'textarea' },
            { id: 'favoriteHobby', label: 'هواية/اهتمام مفضل', placeholder: 'ما هو الشيء الذي يحبه الطفل أكثر؟ (مثل: كرة القدم، الرسم، بناء الليغو).', required: true, type: 'input' },
            { id: 'favoritePhrase', label: 'كلمة/جملة مفضلة', placeholder: 'هل لديه كلمة أو عبارة يتكرر استخدامها كثيراً؟', required: false, type: 'input' },
            { id: 'interactiveElementChoice', label: 'هل ترغب في عنصر بحث بصري؟*', placeholder: 'نعم / لا. مثال: نعم، أرغب في إيجاد دمية محددة مخبأة في الرسومات.', required: true, type: 'input' },
        ]
    },
    { 
        id: 1, 
        created_at: '2023-01-01', 
        key: 'custom_story', 
        title: 'القصة المخصصة', 
        description: 'قصة فريدة بطلها طفلك، باسمه وصورته وهواياته.', 
        image_url: 'https://placehold.co/800x800?text=Custom+Story', 
        features: ['تخصيص كامل', 'اختيار الهدف التربوي', 'رسومات احترافية'], 
        sort_order: 1, 
        is_featured: true, 
        is_addon: false, 
        has_printed_version: true, 
        price_printed: 450,
        price_electronic: 200,
        goal_config: 'predefined_and_custom',
        story_goals: [
            { key: 'respect', title: 'الاستئذان والاحترام' },
            { key: 'cooperation', title: 'التعاون والمشاركة' },
            { key: 'honesty', title: 'الصدق والأمانة' },
        ],
        image_slots: [
            { id: 'child_photo_1', label: 'صورة وجه الطفل (إلزامي)', required: true },
            { id: 'child_photo_2', label: 'صورة ثانية للطفل (اختياري)', required: false },
        ],
        text_fields: [
            { id: 'childTraits', label: 'اخبرنا عن بطل القصة*', placeholder: 'مثال: شجاع، يحب الديناصورات...', required: true, type: 'textarea' },
            { id: 'familyNames', label: 'أسماء أفراد العائلة (اختياري)', placeholder: 'مثال: الأم: فاطمة، الأب: علي', required: false, type: 'textarea' },
        ]
    },
    { 
        id: 2, 
        created_at: '2023-01-01', 
        key: 'gift_box', 
        title: 'بوكس الهدية', 
        description: 'المجموعة الكاملة من منتجاتنا في صندوق هدايا فاخر.', 
        image_url: 'https://placehold.co/800x800?text=Gift+Box', 
        features: ['قصة مطبوعة', 'دفتر تلوين', 'كتيب أذكار'], 
        sort_order: 2, 
        is_featured: false, 
        is_addon: false, 
        has_printed_version: true, 
        price_printed: 750,
        price_electronic: null,
        goal_config: 'predefined',
        story_goals: [
            { key: 'respect', title: 'الاستئذان والاحترام' },
            { key: 'cooperation', title: 'التعاون والمشاركة' },
        ],
        image_slots: [
            { id: 'child_photo_1', label: 'صورة وجه الطفل (إلزامي)', required: true },
        ],
        text_fields: [
            { id: 'childTraits', label: 'اخبرنا عن بطل القصة*', placeholder: 'مثال: شجاع، يحب الديناصورات...', required: true, type: 'textarea' },
        ],
        component_keys: ['coloring_book', 'dua_booklet'],
    },
    { 
        id: 5, 
        created_at: '2023-01-01', 
        key: 'values_story', 
        title: 'قصة الآداب والقيم', 
        description: 'قصة إضافية تركز على قيمة أخلاقية محددة.', 
        image_url: null, 
        features: [], 
        sort_order: 3, 
        is_featured: false, 
        is_addon: false, 
        has_printed_version: true, 
        price_printed: 150,
        price_electronic: 60,
        goal_config: 'predefined',
        story_goals: [
             { key: 'respect', title: 'الاستئذان والاحترام' },
             { key: 'honesty', title: 'الصدق والأمانة' },
        ],
        image_slots: [],
        text_fields: []
    },
    { 
        id: 3, 
        created_at: '2023-01-01', 
        key: 'coloring_book', 
        title: 'دفتر التلوين', 
        description: 'رسومات من قصة طفلك جاهزة للتلوين.', 
        image_url: null, 
        features: [], 
        sort_order: 5, 
        is_featured: false, 
        is_addon: true, 
        has_printed_version: true, 
        price_printed: 100,
        price_electronic: 40,
        goal_config: 'none',
        story_goals: [],
        image_slots: [],
        text_fields: []
    },
    { 
        id: 4, 
        created_at: '2023-01-01', 
        key: 'dua_booklet', 
        title: 'كتيّب الأذكار', 
        description: 'أدعية وأذكار يومية مصورة بشخصية طفلك.', 
        image_url: null, 
        features: [], 
        sort_order: 6, 
        is_featured: false, 
        is_addon: true, 
        has_printed_version: true, 
        price_printed: 120,
        price_electronic: 50,
        goal_config: 'none',
        story_goals: [],
        image_slots: [],
        text_fields: []
    },
    { 
        id: 7, 
        created_at: '2023-01-01', 
        key: 'voice_over',
        title: 'تسجيل صوتي',
        description: 'تسجيل صوتي احترافي للقصة.',
        image_url: null,
        features: [],
        sort_order: 7,
        is_featured: false, 
        is_addon: true,
        has_printed_version: false,
        price_printed: null,
        price_electronic: 80,
        goal_config: 'none',
        story_goals: [],
        image_slots: [],
        text_fields: []
    }
];

export const mockSiteBranding: SiteBranding = {
    logoUrl: "https://placehold.co/500x150?text=Logo",
    heroImageUrl: "https://placehold.co/1920x800?text=Hero+Image",
    aboutHeroImageUrl: "https://placehold.co/1920x600?text=About+Hero",
    aboutPortalImageUrl: "https://placehold.co/600x600?text=About+Card",
    joinUsImageUrl: "https://placehold.co/1920x600?text=Join+Us",
    creativeWritingPortalImageUrl: "https://placehold.co/600x400?text=Creative+Writing",
    enhaLakPortalImageUrl: "https://placehold.co/600x400?text=Enha+Lak"
};

export const mockInstructors: Instructor[] = [
    {
        id: 1,
        user_id: 'usr_instructor_1',
        name: 'أ. أحمد المصري',
        specialty: 'قصص خيال علمي',
        bio: 'كاتب ومدرب متخصص في أدب الطفل.',
        avatar_url: 'https://placehold.co/400x400?text=Avatar',
        slug: 'ahmed-masri',
        weekly_schedule: { saturday: ['10:00', '11:00'], tuesday: ['16:00', '17:00'] },
        availability: {},
        intro_availability: {},
        rate_per_session: 150,
        schedule_status: 'approved',
        profile_update_status: 'approved',
        pending_profile_data: null,
        teaching_philosophy: 'التعلم بالمرح',
        expertise_areas: ['خيال', 'مغامرات'],
        intro_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
        published_works: [{ title: 'مغامرات في الفضاء', cover_url: 'https://placehold.co/400x600?text=Book+Cover' }]
    }
];

export const mockCreativeWritingPackages: CreativeWritingPackage[] = [
    { 
        id: 1, 
        name: 'الجلسة التعريفية', 
        sessions: 'جلسة واحدة (30 دقيقة)', 
        price: 0, 
        features: ['تقييم المستوى', 'خطة مقترحة'], 
        popular: false, 
        description: 'جلسة مجانية للتعرف على المدرب.',
        detailed_description: 'فرصة رائعة لطفلك وولي الأمر للتعرف على المدرب، مناقشة الأهداف، وتحديد المستوى المناسب قبل البدء.',
        target_age: '7-14 سنة',
        level: 'جميع المستويات',
        icon_name: 'MessageSquare',
        comparison_values: {
            'level_compare': 'عام',
            'target_age_compare': '7-14',
            'digital_portfolio': false,
            'certificate': false,
            'publication': false,
            'mentoring': false
        }
    },
    { 
        id: 2, 
        name: 'باقة الانطلاق', 
        sessions: '4 جلسات', 
        price: 1200, 
        features: ['أساسيات الكتابة', 'قصة قصيرة واحدة', 'متابعة أسبوعية'], 
        popular: true, 
        description: 'بداية مثالية للمبتدئين.',
        detailed_description: 'صممت هذه الباقة لتضع أقدام طفلك على أول طريق الإبداع. سيتعلم أساسيات بناء القصة ورسم الشخصيات من خلال 4 جلسات تفاعلية ممتعة.',
        target_age: '8-12 سنة',
        level: 'مبتدئ',
        icon_name: 'Rocket',
        comparison_values: {
            'level_compare': 'مبتدئ',
            'target_age_compare': '8-12',
            'digital_portfolio': true,
            'certificate': true,
            'publication': false,
            'mentoring': false
        }
    },
    { 
        id: 3, 
        name: 'الباقة الأساسية', 
        sessions: '8 جلسات', 
        price: 2200, 
        features: ['بناء الشخصيات', 'قصتين', 'ورشة عمل جماعية'], 
        popular: false, 
        description: 'تعمق أكثر في فنون الكتابة.',
        detailed_description: 'رحلة أعمق في عالم الكتابة. نركز هنا على تطوير الحبكة، وصراع الشخصيات، والوصف الحسي. يخرج الطالب بقصتين مكتملتين.',
        target_age: '9-14 سنة',
        level: 'متوسط',
        icon_name: 'PenTool',
        comparison_values: {
            'level_compare': 'متوسط',
            'target_age_compare': '9-14',
            'digital_portfolio': true,
            'certificate': true,
            'publication': true,
            'mentoring': true
        }
    },
];

export const mockSiteContent: SiteContent = {
    portalPage: {
        heroTitle: 'رحلة كل طفل تبدأ بقصة... وقصته تبدأ هنا',
        heroSubtitle: 'منصة تربوية عربية متكاملة تصنع قصصاً مخصصة تجعل طفلك بطلاً، وتطلق مواهبه في الكتابة الإبداعية',
        heroButtonText1: 'اطلب قصتك المخصصة الآن',
        heroButtonText2: 'اكتشف برنامج الكتابة الإبداعية',
        projectsTitle: 'أقسامنا الرئيسية',
        projectsSubtitle: 'بوابتان لعالم من الإبداع والنمو',
        enhaLakTitle: 'إنها لك',
        enhaLakDescription: 'قصص مخصصة ومنتجات تربوية فريدة تجعل طفلك بطلاً.',
        enhaLakBtnText: 'اكتشف القصص',
        creativeWritingTitle: 'بداية الرحلة',
        creativeWritingDescription: 'برنامج متكامل لتنمية مهارات الكتابة الإبداعية.',
        creativeWritingBtnText: 'ابدأ الرحلة',
        valuePropositionTitle: 'لماذا تختار منصة الرحلة؟',
        socialProofTitle: 'قصص نجاح ملهمة',
        aboutSectionTitle: 'قصتنا: من فكرة إلى رحلة',
        aboutSectionContent: 'نحن منصة تسعى لتمكين الأطفال من خلال القصص والكتابة...',
        aboutBtnText: 'تعرف علينا أكثر',
        testimonialsTitle: 'ماذا تقول عائلاتنا؟',
        testimonialsSubtitle: 'آراء نفخر بها',
        blogTitle: 'من مدونتنا',
        blogSubtitle: 'مقالات ونصائح تربوية',
        finalCtaTitle: 'هل أنت جاهز لبدء الرحلة؟',
        finalCtaSubtitle: 'اختر المسار الذي يناسب طفلك اليوم',
        finalCtaBtn1: 'تصفح منتجات "إنها لك"',
        finalCtaBtn2: 'احجز جلسة "بداية الرحلة"',
        showProjectsSection: true,
        showStepsSection: true,
        showAboutSection: true,
        showTestimonialsSection: true,
        showBlogSection: true,
        showFinalCtaSection: true,
        steps: [
            { title: '1. اكتشف', description: 'تصفح قصصنا المخصصة وبرامجنا الإبداعية المصممة بعناية لتناسب كل طفل.' },
            { title: '2. خصص', description: 'أضف لمستك الخاصة. املأ تفاصيل طفلك واختر الأهداف والقيم التي ترغب في غرسها.' },
            { title: '3. استمتع', description: 'استلم منتجاً فريداً ومبهراً ينمي شغف طفلك ويطلق العنان لخياله الواسع.' }
        ]
    },
    aboutPage: {
        heroTitle: 'رحلتنا: من فكرة إلى رؤية',
        missionStatement: 'نؤمن أن كل طفل هو بطل حكايته الخاصة.',
        ourStory: 'في عالم يتسارع نحو الرقمنة...',
        ourVision: 'أن نكون المنصة الرائدة والوجهة الأولى لكل أسرة عربية.',
        valuesTitle: 'قيمنا الأساسية',
        teamMembers: [],
        teamTitle: 'تعرف على بعض أفراد الفريق',
        showTeamSection: true
    },
    enhaLakPage: {
        main: {
            heroTitle: 'قصة فريدة... بطلها طفلك',
            heroSubtitle: 'منتجات تربوية مخصصة تعزز الهوية وتنمي القيم.',
            heroBtnText: 'تصفح المنتجات واطلب الآن',
            productsTitle: 'منتجاتنا المميزة',
            howItWorksTitle: 'كيف تعمل؟',
            galleryTitle: 'معرض الصور',
            gallerySubtitle: 'لقطات من قصصنا',
            testimonialsTitle: 'آراء العملاء',
            testimonialsSubtitle: 'ماذا قالوا عنا',
            finalCtaTitle: 'جاهز للطلب؟',
            finalCtaSubtitle: 'ابدأ الآن بتخصيص قصة لطفلك.',
            customStoryImageUrl: 'https://placehold.co/800x800?text=Custom+Story',
            subscriptionBoxImageUrl: 'https://placehold.co/800x800?text=Subscription+Box'
        },
        store: {
            heroTitle: 'متجر القصص',
            heroSubtitle: 'اختر القصة التي تناسب طفلك.',
            subscriptionBannerTitle: 'اشترك في صندوق الرحلة',
            featuredProductsTitle: 'منتجات مميزة',
            coreProductsTitle: 'قصص أساسية',
            addonProductsTitle: 'إضافات'
        },
        subscription: {
            heroTitle: 'صندوق الرحلة الشهري',
            heroSubtitle: 'هدية متجددة كل شهر.',
            features: ['قصة جديدة', 'أنشطة', 'هدية']
        }
    },
    creativeWritingPage: {
        main: {
            heroTitle: 'بداية الرحلة: أطلق العنان لخيال طفلك',
            heroSubtitle: 'برنامج تدريبي لتنمية مهارات الكتابة.',
            methodologyTitle: 'منهجيتنا',
            methodologySubtitle: 'كيف نعلم الكتابة',
            transformationTitle: 'رحلة التحول',
            transformationSubtitle: 'من قارئ إلى كاتب',
            packagesTitle: 'باقات الاشتراك',
            packagesSubtitle: 'اختر الباقة المناسبة',
            servicesTitle: 'خدمات إضافية',
            servicesSubtitle: 'دعم إضافي للكاتب الصغير',
            instructorsTitle: 'مدربونا',
            instructorsSubtitle: 'نخبة من الخبراء',
            testimonialsTitle: 'قصص نجاح',
            testimonialsSubtitle: 'طلابنا المبدعون',
            finalCtaTitle: 'احجز الآن',
            finalCtaSubtitle: 'ابدأ الرحلة اليوم'
        },
        about: {
            heroTitle: 'عن البرنامج',
            heroSubtitle: 'فلسفتنا في التعليم',
            mainTitle: 'لماذا بداية الرحلة؟',
            mainContent: 'لأننا نؤمن...',
            philosophyTitle: 'فلسفتنا',
            heroImageUrl: 'https://placehold.co/800x800?text=CW+Philosophy'
        },
        curriculum: {
            heroTitle: 'المنهج الدراسي',
            heroSubtitle: 'ماذا سيتعلم طفلك',
            treasuresTitle: 'كنوز الرحلة',
            treasuresSubtitle: 'ما يحصل عليه الطالب'
        },
        instructors: {
            heroTitle: 'فريق التدريب',
            heroSubtitle: 'تعرف على المدربين'
        }
    },
    supportPage: {
        heroTitle: 'كيف يمكننا مساعدتك؟',
        heroSubtitle: 'نحن هنا للإجابة على استفساراتك',
        faqs: []
    }
};

export const mockStandaloneServices: StandaloneService[] = [
    { id: 1, name: 'مراجعة قصة قصيرة', price: 150, description: 'مراجعة لغوية وفنية لقصة من تأليف الطفل.', category: 'مراجعات', icon_name: 'FileCheck2', requires_file_upload: true, provider_type: 'instructor' },
    { id: 2, name: 'جلسة توجيه إضافية', price: 200, description: 'جلسة خاصة لتقديم النصح والإرشاد للطفل الموهوب.', category: 'استشارات', icon_name: 'Users', requires_file_upload: false, provider_type: 'instructor' },
    { id: 3, name: 'نشر عمل في المجلة', price: 300, description: 'تنسيق ونشر عمل الطفل في مجلة المنصة الشهرية.', category: 'نشر', icon_name: 'BookUp', requires_file_upload: true, provider_type: 'company' }
];

export const mockSocialLinks: SocialLinks = {
    id: 1,
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com'
};

export const mockPricingSettings: PricingSettings = {
    id: 1,
    company_percentage: 1.2, // 20% markup
    fixed_fee: 50 // 50 EGP fixed fee
};

export const mockRolePermissions: any = permissionsByRole; 

export const mockCommunicationSettings: CommunicationSettings = {
    support_email: 'support@alrehlah.com',
    join_us_email: 'careers@alrehlah.com',
    whatsapp_number: '+201000000000',
    whatsapp_default_message: 'مرحباً، لدي استفسار بخصوص...',
    instapay_url: 'https://ipn.eg/S/123',
    instapay_qr_url: 'https://placehold.co/400x400?text=QR+Code',
    instapay_number: '01000000000'
};

export const mockJitsiSettings: JitsiSettings = {
    id: 1,
    domain: 'meet.jit.si',
    room_prefix: 'AlRehlah-Session-',
    join_minutes_before: 10,
    expire_minutes_after: 120,
    start_with_audio_muted: true,
    start_with_video_muted: false
};

export const mockAdditionalServices: AdditionalService[] = [
    { id: 1, name: 'طباعة فاخرة', price: 100, description: 'ورق مقوى وغلاف سميك.' },
    { id: 2, name: 'تغليف هدايا', price: 50, description: 'تغليف مميز مع بطاقة إهداء.' }
];

export const mockPrices: Prices = {
    'custom_story_base': 450,
    'subscription_monthly': 250
};

export const mockShippingCosts: ShippingCosts = {
    'مصر': {
        'القاهرة': 50,
        'الجيزة': 50,
        'الإسكندرية': 60,
        'أسوان': 100,
        'باقي المحافظات': 75
    }
};

export const mockScheduledSessions: ScheduledSession[] = [
    { id: 'ses_1', booking_id: 'bk_abc', subscription_id: null, child_id: 1, instructor_id: 1, session_date: new Date(Date.now() + 86400000).toISOString(), status: 'upcoming' },
    { id: 'ses_2', booking_id: 'bk_abc', subscription_id: null, child_id: 1, instructor_id: 1, session_date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    { id: 'ses_3', booking_id: 'bk_def', subscription_id: null, child_id: 2, instructor_id: 1, session_date: new Date(Date.now() + 172800000).toISOString(), status: 'upcoming' }
];

export const mockSessionMessages: SessionMessage[] = [
    { id: 'msg_1', booking_id: 'bk_abc', sender_id: 'usr_instructor_1', sender_role: 'instructor', message_text: 'أهلاً بك فاطمة، هل أنتِ جاهزة لدرس اليوم؟', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'msg_2', booking_id: 'bk_abc', sender_id: 'usr_parent', sender_role: 'user', message_text: 'نعم، نحن مستعدون!', created_at: new Date(Date.now() - 3500000).toISOString() }
];

export const mockSessionAttachments: SessionAttachment[] = [
    { id: 'att_1', booking_id: 'bk_abc', uploader_id: 'usr_parent', uploader_role: 'student', file_name: 'قصة_فاطمة_الأولى.docx', file_url: '#', created_at: new Date(Date.now() - 86400000).toISOString() }
];

export const mockSupportSessionRequests: SupportSessionRequest[] = [
    { id: 'req_1', instructor_id: 1, child_id: 1, reason: 'تغيير موعد الجلسة لظروف طارئة', status: 'pending', requested_at: new Date().toISOString() }
];

export const mockPublicHolidays: string[] = [
    '2024-01-01', '2024-01-07', '2024-01-25', '2024-04-10', '2024-04-11', '2024-04-25', '2024-05-01', '2024-06-16', '2024-06-17', '2024-06-30', '2024-07-08', '2024-07-23', '2024-09-16', '2024-10-06'
];
