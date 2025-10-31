import type { 
    UserProfile, ChildProfile, Notification, Order, Subscription, CreativeWritingBooking, 
    PersonalizedProduct, CreativeWritingPackage, Instructor, SiteBranding, Prices, ShippingCosts, 
    SocialLinks, BlogPost, SupportTicket, JoinRequest, AdditionalService, SiteContent, ScheduledSession, SessionMessage, SessionAttachment, SupportSessionRequest,
    SubscriptionPlan,
    StandaloneService,
    ServiceOrder,
    AiSettings,
    InstructorPayout,
    PricingSettings
} from '../lib/database.types';

export const mockUsers: UserProfile[] = [
    { id: 'usr_parent', created_at: '2023-08-01T10:00:00Z', last_sign_in_at: '2024-08-10T12:00:00Z', name: 'أحمد عبدالله', email: 'parent@alrehlah.com', role: 'user', address: '123 شارع المثال، مدينة نصر', governorate: 'القاهرة', phone: '01234567890' },
    { id: 'usr_user', created_at: '2024-01-02T10:00:00Z', last_sign_in_at: '2024-08-09T11:00:00Z', name: 'سارة خالد', email: 'user@alrehlah.com', role: 'user' },
    { id: 'usr_student', created_at: '2024-02-03T10:00:00Z', last_sign_in_at: '2024-08-10T09:30:00Z', name: 'علي أحمد', email: 'student@alrehlah.com', role: 'student' },
    { id: 'usr_admin', created_at: '2023-01-04T10:00:00Z', last_sign_in_at: '2024-08-10T15:00:00Z', name: 'مدير النظام', email: 'admin@alrehlah.com', role: 'super_admin' },
    { id: 'usr_supervisor', created_at: '2023-01-05T10:00:00Z', last_sign_in_at: '2024-08-08T14:00:00Z', name: 'مشرف عام', email: 'supervisor@alrehlah.com', role: 'general_supervisor' },
    { id: 'usr_cws', created_at: '2023-05-06T10:00:00Z', last_sign_in_at: null, name: 'مشرف بداية الرحلة', email: 'cws@alrehlah.com', role: 'creative_writing_supervisor' },
    { id: 'usr_instructor_1', created_at: '2023-06-07T10:00:00Z', last_sign_in_at: '2024-08-10T13:00:00Z', name: 'أ. أحمد المصري', email: 'instructor@alrehlah.com', role: 'instructor' },
    { id: 'usr_support', created_at: '2023-07-08T10:00:00Z', last_sign_in_at: '2024-08-07T10:00:00Z', name: 'وكيل دعم', email: 'support@alrehlah.com', role: 'support_agent' },
    { id: 'usr_editor', created_at: '2024-06-09T10:00:00Z', last_sign_in_at: '2024-08-05T18:00:00Z', name: 'محرر محتوى', email: 'editor@alrehlah.com', role: 'content_editor' },
    { id: 'usr_els', created_at: '2024-07-10T10:00:00Z', last_sign_in_at: '2024-08-09T16:00:00Z', name: 'مشرف إنها لك', email: 'enhalak@alrehlah.com', role: 'enha_lak_supervisor' },
];

export const mockChildProfiles: ChildProfile[] = [
    { id: 1, created_at: '2023-01-10T10:00:00Z', user_id: 'usr_parent', name: 'فاطمة أحمد', birth_date: '2016-05-10', gender: 'أنثى', avatar_url: 'https://i.ibb.co/yY3GJk1/female-avatar.png', interests: ['الرسم', 'الفضاء'], strengths: ['مبدعة', 'فضولية'], student_user_id: 'usr_student' },
    { id: 2, created_at: '2023-02-15T10:00:00Z', user_id: 'usr_parent', name: 'عمر أحمد', birth_date: '2018-03-22', gender: 'ذكر', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', interests: ['الديناصورات', 'السيارات'], strengths: ['شجاع'], student_user_id: null },
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
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: 1, name: 'اشتراك ربع سنوي', duration_months: 3, price: 850, price_per_month: 283, savings_text: 'وفر 5%' },
  { id: 2, name: 'اشتراك نصف سنوي', duration_months: 6, price: 1600, price_per_month: 267, savings_text: 'وفر 10%' },
  { id: 3, name: 'اشتراك سنوي', duration_months: 12, price: 3000, price_per_month: 250, savings_text: 'وفر 15%', is_best_value: true },
];

export const mockBookings: CreativeWritingBooking[] = [
    { id: 'bk_abc', created_at: '2023-07-20T10:00:00Z', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 1, package_name: 'باقة الانطلاق', instructor_id: 1, booking_date: '2023-08-10T17:00:00Z', booking_time: '17:00', total: 1200, status: 'مؤكد', progress_notes: 'أظهرت فاطمة تقدماً ملحوظاً في بناء الشخصيات.', receipt_url: 'https://example.com/receipt.jpg', session_id: 'AlRehlah-Session-bk_abc' },
    { id: 'bk_def', created_at: '2023-08-01T11:00:00Z', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 2, package_name: 'الجلسة التعريفية', instructor_id: 1, booking_date: '2023-08-15T14:00:00Z', booking_time: '14:00', total: 0, status: 'مؤكد', progress_notes: null, receipt_url: null, session_id: 'AlRehlah-Session-bk_def' }
];

export const mockPersonalizedProducts: PersonalizedProduct[] = [
    { 
        id: 99, 
        created_at: '2023-01-01', 
        key: 'subscription_box', 
        title: 'صندوق الرحلة الشهري', 
        description: 'اشتراك شهري متجدد يحتوي على قصة مخصصة وأنشطة وهدايا.', 
        image_url: 'https://i.ibb.co/L8DDd6V/gift-box-sub.png', 
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
        image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg',
        features: ['تخصيص نفسي وسلوكي عميق', 'معالجة مشاعر محددة', 'بناء على مواقف واقعية', 'حلول تربوية إيجابية'], 
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
            { id: 'positiveBehavior', label: 'التحول الإيجابي المطلوب', placeholder: 'ما هو السلوك الإيجابي الذي تتمنى أن يتعلمه الطفل ليحل محل السلوك السلبي؟ (مثلاً: أن يعبر عن غضبه بالكلمات).', required: true, type: 'textarea' },
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
        image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', 
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
        image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg', 
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
        ]
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
        title: 'التعليق الصوتي', 
        description: 'أضف الحياة لقصة طفلك مع تعليق صوتي احترافي.', 
        image_url: null, 
        features: [], 
        sort_order: 7, 
        is_featured: false, 
        is_addon: true, 
        has_printed_version: false,
        price_printed: null,
        price_electronic: 100,
        goal_config: 'none',
        story_goals: [],
        image_slots: [],
        text_fields: []
    },
];

export const mockStandaloneServices: StandaloneService[] = [
    // --- خدمات لتنمية الكاتب ---
    { id: 1, name: 'جلسة العصف الذهني المكثفة', price: 250, description: 'جلسة فردية مركزة (30 دقيقة) لمساعدة الطالب على تخطي "عقبة الكاتب"، تطوير فكرة، أو بناء شخصية معقدة.', category: 'استشارات', icon_name: 'MessageSquare', requires_file_upload: false, provider_type: 'instructor' },
    { id: 2, name: 'المراجعة المتقدمة والتحرير', price: 350, description: 'تحرير كامل لنص (حتى 1000 كلمة) مع تصويبات لغوية وإعادة صياغة مقترحة لتحسين التدفق السردي.', category: 'مراجعات', icon_name: 'FileCheck2', requires_file_upload: true, provider_type: 'instructor' },
    
    // --- خدمات لتحويل الإبداع إلى واقع ---
    { id: 4, name: 'باقة كتابي الأول', price: 1500, description: 'نحوّل أفضل قصة كتبها طفلك إلى كتاب حقيقي! تشمل الخدمة تحرير، تصميم غلاف، تنسيق، وطباعة 5 نسخ فاخرة.', category: 'نشر', icon_name: 'BookUp', requires_file_upload: true, provider_type: 'company' },
    { id: 3, name: 'النشر في مجلة الرحلة', price: 500, description: 'فرصة لنشر أفضل قصة كتبها طفلك في العدد القادم من مجلتنا الإلكترونية الفصلية.', category: 'نشر', icon_name: 'Award', requires_file_upload: true, provider_type: 'company' },
    { id: 5, name: 'تصميم الغلاف الاحترافي', price: 400, description: 'تصميم غلاف احترافي وجذاب لقصة طفلك، جاهز للمشاركة الرقمية أو الطباعة الشخصية.', category: 'نشر', icon_name: 'Palette', requires_file_upload: true, provider_type: 'company' },
    { id: 6, name: 'التعليق الصوتي (AI)', price: 300, description: 'حوّل قصة طفلك إلى كتاب صوتي مسموع بأصوات طبيعية وجذابة باستخدام أحدث تقنيات الذكاء الاصطناعي.', category: 'نشر', icon_name: 'Mic', requires_file_upload: true, provider_type: 'company' },
    
    // --- خدمات داعمة لأولياء الأمور ---
    { id: 7, name: 'جلسة إرشاد تربوي', price: 450, description: 'جلسة خاصة لولي الأمر (45 دقيقة) مع خبير تربوي لمناقشة أفضل السبل لدعم الموهبة الإبداعية لطفلك في المنزل.', category: 'استشارات', icon_name: 'Users', requires_file_upload: false, provider_type: 'instructor' },
];


export const mockServiceOrders: ServiceOrder[] = [
  { id: 'ser_001', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), user_id: 'usr_parent', child_id: 1, service_id: 2, status: 'مكتمل', details: { fileUrl: '#', userNotes: 'الرجاء التركيز على بنية القصة.' }, total: 350, assigned_instructor_id: 1 },
  { id: 'ser_002', created_at: new Date(Date.now() - 86400000).toISOString(), user_id: 'usr_user', child_id: 1, service_id: 3, status: 'بانتظار المراجعة', details: { fileUrl: '#', userNotes: 'نريد نشر هذه القصة في المجلة.' }, total: 500, assigned_instructor_id: null },
  { id: 'ser_003', created_at: new Date(Date.now() - 86400000 * 10).toISOString(), user_id: 'usr_parent', child_id: 2, service_id: 1, status: 'مكتمل', details: { userNotes: 'جلسة عصف ذهني لشخصية جديدة' }, total: 250, assigned_instructor_id: 1 },
];

export const mockCreativeWritingPackages: CreativeWritingPackage[] = [
    { 
        id: 1, 
        name: 'الجلسة التعريفية', 
        sessions: 'جلسة واحدة (30 دقيقة)', 
        price: 0, 
        features: ['تقييم مستوى الطالب', 'وضع خطة شخصية', 'متاحة لعدد محدود شهرياً'], 
        popular: false, 
        description: 'ابدأ رحلة طفلك بجلسة تعريفية مجانية لاستكشاف البرنامج ووضع خطة مناسبة لموهبته.' 
    },
    { 
        id: 2, 
        name: 'باقة الانطلاق', 
        sessions: '4 جلسات', 
        price: 1200, 
        features: ['متابعة أسبوعية', 'أساسيات بناء القصة', 'محفظة رقمية للأعمال'], 
        popular: true, 
        description: 'باقة مكثفة لإطلاق شرارة الإبداع وتعلم أساسيات الكتابة القصصية.' 
    },
    { 
        id: 3, 
        name: 'الباقة الأساسية', 
        sessions: '16 جلسة', 
        price: 4000, 
        features: ['بناء متكامل للشخصيات والعوالم', 'تقنيات سرد متقدمة', 'جلسات مراجعة وتحرير', 'شهادة إتمام'], 
        popular: false, 
        description: 'رحلة متكاملة تأسس مهارات الكتابة الإبداعية لدى طفلك. يمكن الترقية من باقة الانطلاق (باستكمال 12 جلسة).' 
    },
    { 
        id: 4, 
        name: 'باقة التخصص', 
        sessions: '32 جلسة', 
        price: 7200, 
        features: ['تخصص في نوع أدبي (خيال, مغامرة..)', 'مشاريع كتابة متعمقة', 'بناء أسلوب الكاتب الشخصي', 'نشر عمل في المجلة الإلكترونية'], 
        popular: false, 
        description: 'للكتاب الواعدين الذين أتموا الباقة الأساسية ويرغبون في التخصص وصقل أسلوبهم بشكل احترافي.' 
    },
    { 
        id: 5, 
        name: 'باقة التميز', 
        sessions: '48 جلسة (الأساسية + التخصص)', 
        price: 9600, 
        features: ['تشمل مزايا الباقتين الأساسية والتخصص', 'خصم خاص على السعر الإجمالي', 'جلسات إرشاد إضافية', 'فرصة نشر قصة كاملة'], 
        popular: false, 
        description: 'المسار الكامل للمبدعين الصغار, يجمع بين التأسيس والتخصص للوصول إلى مستوى متقدم من التميز.' 
    },
];

export const mockAdditionalServices: AdditionalService[] = [
    { id: 1, name: 'استشارة خاصة', price: 200, description: 'جلسة استشارية إضافية لمدة 30 دقيقة.' },
    { id: 2, name: 'مراجعة نص', price: 150, description: 'مراجعة وتحرير نص إبداعي من خارج البرنامج.' },
    { id: 3, name: 'الاشتراك بعمل في الاصدار القادم', price: 500, description: 'انشر قصتك في كتابنا المجمع القادم' },
    { id: 4, name: 'طلب اصدار خاص', price: 800, description: 'حوّل قصتك إلى كتاب مطبوع خاص بك' },
];

export const mockInstructors: Instructor[] = [
    { 
        id: 1, 
        user_id: 'usr_instructor_1', 
        name: 'أ. أحمد المصري', 
        specialty: 'متخصص في بناء العوالم (13-18 سنة)', 
        bio: 'كاتب وروائي...', 
        avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', 
        slug: 'ahmed-masri', 
        weekly_schedule: { monday: ['17:00', '18:00'], wednesday: ['17:00', '18:00'] }, 
        availability: {}, 
        intro_availability: {}, 
        rate_per_session: 300, 
        service_rates: { '1': 280, '2': 400, '7': 500 },
        package_rates: { '2': 1300, '3': 4200 },
        schedule_status: 'approved', 
        profile_update_status: 'approved', 
        pending_profile_data: null 
    },
    { 
        id: 2, 
        user_id: null, 
        name: 'أ. نورة القحطاني', 
        specialty: 'متخصصة في السرد القصصي (8-12 سنة)', 
        bio: 'ماجستير في أدب الأطفال...', 
        avatar_url: 'https://i.ibb.co/yY3GJk1/female-avatar.png', 
        slug: 'noura-qahtani', 
        weekly_schedule: { tuesday: ['16:00', '17:00'], thursday: ['16:00', '17:00'] }, 
        availability: {}, 
        intro_availability: {}, 
        rate_per_session: 250, 
        service_rates: { '1': 250, '2': 350 },
        package_rates: { '2': 1200, '3': 4000, '4': 7200, '5': 9600 },
        schedule_status: 'approved', 
        profile_update_status: 'pending', 
        pending_profile_data: { updates: { bio: "bio updated", rate_per_session: 275 }, justification: "test justification" } 
    },
];

export const mockInstructorPayouts: InstructorPayout[] = [
    { id: 'p_1', instructor_id: 1, payout_date: '2024-08-01T10:00:00Z', amount: 1800, details: 'مستحقات شهر يوليو 2024' },
    { id: 'p_2', instructor_id: 1, payout_date: '2024-07-01T10:00:00Z', amount: 2100, details: 'مستحقات شهر يونيو 2024' },
];

export const mockSiteBranding: SiteBranding = {
    logoUrl: "https://i.ibb.co/C0bSJJT/favicon.png",
    heroImageUrl: "https://i.ibb.co/RzJzQhL/hero-image-new.jpg",
    aboutImageUrl: "https://i.ibb.co/8XYt2s5/about-us-image.jpg",
    creativeWritingPortalImageUrl: "https://i.ibb.co/n7ZJv9V/child-learning-online.jpg",
    enhaLakPortalImageUrl: "https://i.ibb.co/RzJzQhL/hero-image-new.jpg",
};

export const mockPrices: Prices = {};

export const mockPricingSettings: PricingSettings = {
  id: 1,
  company_percentage: 1.2,
  fixed_fee: 50,
};

export const mockShippingCosts: ShippingCosts = {
  "مصر": {
    "القاهرة": 40,
    "الجيزة": 50,
    "الإسكندرية": 60,
    "الدقهلية": 65,
    "البحر الأحمر": 80,
    "البحيرة": 60,
    "الفيوم": 55,
    "الغربية": 55,
    "الإسماعيلية": 60,
    "المنوفية": 55,
    "المنيا": 70,
    "القليوبية": 45,
    "الوادي الجديد": 90,
    "السويس": 60,
    "اسوان": 90,
    "اسيوط": 75,
    "بني سويف": 60,
    "بورسعيد": 65,
    "دمياط": 60,
    "الشرقية": 55,
    "جنوب سيناء": 85,
    "كفر الشيخ": 60,
    "مطروح": 80,
    "الأقصر": 85,
    "قنا": 80,
    "شمال سيناء": 75,
    "سوهاج": 75
  }
};

export const mockSocialLinks: SocialLinks = { id: 1, facebook_url: '#', twitter_url: '#', instagram_url: '#' };

export const mockAiSettings: AiSettings = {
  id: 1,
  enable_story_ideas: true,
  story_ideas_prompt: 'أنت كاتب قصص أطفال مبدع. استنادًا إلى المعلومات التالية عن طفل، قم بتوليد 3 أفكار فريدة ومناسبة لقصص أطفال باللغة العربية. يجب أن يكون لكل فكرة عنوان جذاب وهدف تربوي واضح.',
};


export const mockBlogPosts: BlogPost[] = [
    { 
        id: 1, 
        created_at: '2024-08-01', 
        published_at: '2024-08-01', 
        title: '5 أسرار لتحويل وقت القراءة إلى مغامرة ممتعة', 
        slug: 'reading-time-adventure', 
        content: 'القراءة ليست مجرد نشاط هادئ قبل النوم، بل يمكن أن تكون بوابة لعوالم سحرية ومغامرات لا تُنسى. لكن كيف نحول تقليب الصفحات إلى تجربة مثيرة ينتظرها أطفالنا بشغف؟ إليك 5 أسرار بسيطة.\n\nأولاً، اصنعوا الأجواء. خففوا الإضاءة، استخدموا مصباحاً يدوياً كأنه كشاف في كهف غامض، أو ابنوا حصناً من الوسائد. الأجواء الخاصة تجعل القصة أكثر من مجرد كلمات على ورق.\n\nثانياً، استخدموا أصواتكم. غيروا نبرة صوتكم لتمثيل الشخصيات المختلفة. همسة للساحرة الشريرة، صوت جهوري للعملاق، وضحكة مرحة للأميرة. هذا الأداء الصوتي يضفي حياة على الحوار ويجذب انتباه الطفل.\n\nثالثاً، اجعلوها تفاعلية. توقفوا عند المشاهد المهمة واسألوا طفلكم: "ماذا تعتقد أنه سيحدث الآن؟" أو "لو كنت مكان البطل، ماذا كنت ستفعل؟". هذه الأسئلة تحفز الخيال وتجعل الطفل شريكاً في بناء الأحداث.\n\nرابعاً، اربطوا القصة بالواقع. بعد الانتهاء من قصة عن الفضاء، اخرجوا ليلاً لمشاهدة النجوم. إذا كانت القصة عن حيوانات الغابة، خططوا لزيارة حديقة الحيوان. هذا الربط يجعل عالم القصة يمتد إلى حياة الطفل الواقعية.\n\nأخيراً، لا تفرضوا القراءة. اجعلوها وقتاً مميزاً للمشاركة والدفء. الهدف هو بناء علاقة حب بين الطفل والكتاب، وهذه العلاقة تنمو بالمتعة وليس بالإجبار. بالقليل من الإبداع، ستصبح كل قصة مغامرة جديدة تنتظركم.', 
        image_url: 'https://i.ibb.co/h7gJj47/blog-reading-adventure.jpg', 
        author_name: 'فريق المنصة', 
        status: 'published' 
    },
    { 
        id: 2, 
        created_at: '2024-07-25', 
        published_at: '2024-07-25', 
        title: 'لماذا يرى طفلك نفسه بطلاً؟ سيكولوجية القصة المخصصة', 
        slug: 'psychology-of-personalized-stories', 
        content: 'عندما يفتح طفل قصة ويرى اسمه وصورته وشخصيته تنعكس في البطل، يحدث شيء أشبه بالسحر. هذا ليس مجرد ترفيه، بل هو أداة تربوية قوية تستند إلى مبادئ نفسية عميقة. القصة المخصصة تجعل الطفل محور الكون السردي، مما يعزز بشكل كبير تقديره لذاته.\n\nعلى المستوى النفسي، تعمل القصة المخصصة على تلبية حاجة أساسية لدى الطفل: الشعور بالأهمية والتفرد. عندما يرى الطفل نفسه يقوم بأفعال بطولية ويتغلب على التحديات في القصة، فإنه يستوعب رسالة قوية: "أنا مهم، أنا قادر، أنا أستطيع إحداث فرق". هذا التأثير لا يتوقف عند انتهاء القصة، بل يمتد ليؤثر على ثقته بنفسه في مواجهة تحديات الحياة الواقعية.\n\nعلاوة على ذلك، فإن رؤية الطفل لصفاته واهتماماته الخاصة منسوجة في نسيج القصة تجعل المحتوى أكثر ارتباطاً به. هذا يزيد من انتباهه وتركيزه، ويجعل استيعابه للقيم والأهداف التربوية المضمنة في القصة أعمق وأكثر فعالية. إنه يتعلم من خلال تجربة يعيشها بنفسه، وليس من خلال مراقبة شخصية غريبة عنه.\n\nفي "منصة الرحلة"، نحن نؤمن بهذه القوة. كل قصة نصنعها هي مرآة تعكس أفضل ما في طفلك، وتمنحه الأدوات اللازمة ليرى البطل الكامن في داخله، ليس فقط على صفحات الكتب، بل في كل يوم من أيام حياته.', 
        image_url: 'https://i.ibb.co/ZJ8pT5N/blog-hero-child.jpg', 
        author_name: 'فريق المنصة', 
        status: 'published' 
    },
    { 
        id: 3, 
        created_at: '2024-07-15', 
        published_at: '2024-07-15', 
        title: 'من الخيال إلى الورق: كيف نطلق العنان للكاتب الصغير داخل طفلك؟', 
        slug: 'unleash-the-little-writer', 
        content: 'كل طفل هو راوي قصص بالفطرة. عوالمهم الخيالية مليئة بالشخصيات المدهشة والمغامرات الجريئة. لكن كيف نساعدهم على نقل هذه العوالم من رؤوسهم إلى الورق؟ برنامج "بداية الرحلة" مصمم خصصياً لهذا الغرض، وهو يعتمد على بضعة مبادئ أساسية يمكن لكل ولي أمر تطبيقها.\n\nابدأوا بالاستماع. عندما يروي طفلك قصة عن ديناصور طائر أو قطة تتكلم، استمعوا باهتمام واطرحوا أسئلة مفتوحة مثل "وماذا حدث بعد ذلك؟" أو "كيف كان شعور القطة؟". هذا يشجعهم على تطوير أفكارهم ويُشعرهم بأن قصصهم مهمة.\n\nثانياً، وفروا الأدوات دون ضغط. دفتر جميل، أقلام ملونة، أو حتى تطبيق للكتابة على جهاز لوحي يمكن أن يكون محفزاً. الفكرة هي جعل الكتابة نشاطاً ممتعاً ومتاحاً، وليس واجباً مدرسياً. لا تركزوا على الأخطاء الإملائية أو النحوية في البداية؛ ركزوا على تدفق الأفكار.\n\nثالثاً، استخدموا "صناديق الأفكار". املأوا صندوقاً بصور عشوائية من المجلات، أو كلمات مكتوبة على قصاصات ورق، أو أشياء صغيرة. يمكن للطفل أن يسحب عنصراً أو عنصرين ليبدأ قصته. هذا يكسر حاجز "الورقة البيضاء" المخيف.\n\nأخيراً، احتفوا بإبداعاتهم. سواء كانت قصة من سطرين أو فصلاً كاملاً، اقرأوها بصوت عالٍ، علقوها على الثلاجة، أو شاركوها مع أفراد العائلة. هذا الاحتفاء هو الوقود الذي يغذي ثقة الكاتب الصغير ويجعله يرغب في كتابة المزيد. تذكروا، الهدف ليس خلق روائي عالمي، بل تنشئة طفل واثق من صوته وقادر على التعبير عن نفسه بإبداع.', 
        image_url: 'https://i.ibb.co/C0Wp1kK/blog-child-writing.jpg', 
        author_name: 'فريق المنصة', 
        status: 'published' 
    },
    { 
        id: 4, 
        created_at: '2024-08-05', 
        published_at: null, 
        title: 'استعداداً للمدرسة: كيف تنمي الكتابة الإبداعية المهارات الأكاديمية؟', 
        slug: 'creative-writing-for-school', 
        content: '(مسودة) قد تبدو الكتابة الإبداعية مجرد نشاط ترفيهي، لكن تأثيرها يمتد عميقاً داخل الفصول الدراسية. عندما يمارس الطفل الكتابة الإبداعية، فإنه لا يطور خياله فحسب، بل يصقل مجموعة من المهارات الأساسية التي تعزز أداءه الأكاديميكي بشكل مباشر.\n\nأولاً، تنظم الكتابة الإبداعية التفكير. لإنشاء قصة متماسكة، يجب على الطفل أن يتعلم كيفية ترتيب الأفكار بشكل منطقي، وبناء تسلسل للأحداث، والوصول إلى خاتمة مرضية. هذه المهارة في "التفكير السردي" لا تقدر بثمن عند كتابة المقالات أو حل المسائل متعددة الخطوات في المستقبل.\n\nثانياً، توسع المفردات. تشجع الكتابة الإبداعية الأطفال على البحث عن كلمات جديدة وأكثر دقة لوصف الشخصيات والمشاهد. بدلاً من "الرجل السعيد"، قد يبحثون عن كلمات مثل "مبتهج" أو "مسرور". هذا البحث النشط عن المفردات يثري لغتهم بشكل أسرع من الحفظ السلبي.\n\n(سيتم استكمال المقال لاحقاً بمناقشة مهارات التعاطف وحل المشكلات)', 
        image_url: 'https://i.ibb.co/xL3Fp6s/blog-school-prep.jpg', 
        author_name: 'فريق المنصة', 
        status: 'draft' 
    },
];

export const mockSupportTickets: SupportTicket[] = [
    { id: 'tkt_1', created_at: new Date().toISOString(), name: 'علي حسن', email: 'ali@test.com', subject: 'استفسار عن الطلب', message: 'متى سيصل طلبي؟', status: 'جديدة' },
];

export const mockJoinRequests: JoinRequest[] = [
    { id: 'join_1', created_at: new Date().toISOString(), name: 'مبدع جديد', email: 'creative@test.com', role: 'رسام قصص أطفال', message: 'أنا رسام مهتم.', status: 'جديد', portfolio_url: 'https://example.com' },
];

export const mockPublicHolidays: string[] = ['2023-10-06'];

export const mockSiteContent: SiteContent = {
  portalPage: {
    heroTitle: "رحلة كل طفل تبدأ بقصة... وقصته تبدأ هنا",
    heroSubtitle: "منصة تربوية عربية متكاملة تصنع قصصاً مخصصة تجعل طفلك بطلاً، وتطلق مواهبه في الكتابة الإبداعية",
    projectsTitle: "أقسامنا الرئيسية",
    projectsSubtitle: "بوابتان لعالم من الإبداع والنمو، مصممتان لتلبية احتياجات طفلك الفريدة.",
    enhaLakTitle: "إنها لك",
    enhaLakDescription: "ادخل إلى عالم الحكايات الشخصية، حيث يصبح طفلك هو البطل في قصص ومنتجات صُنعت خصيصاً له.",
    creativeWritingTitle: "بداية الرحلة",
    creativeWritingDescription: "بوابة إلى عالم الإبداع، حيث نطلق العنان للكاتب الصغير داخل طفلك من خلال رحلة تدريبية ملهمة.",
    valuePropositionTitle: "لماذا منصة الرحلة هي الأفضل لطفلك؟",
    socialProofTitle: "أرقام نفخر بها",
    aboutSectionTitle: "قصتنا: من فكرة إلى رحلة",
    aboutSectionContent: "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة 'منصة الرحلة' - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي.",
    testimonialsTitle: "ماذا تقول عائلاتنا؟",
    testimonialsSubtitle: "آراء نفخر بها من عائلة 'الرحلة'.",
    blogTitle: "من مدونتنا",
    blogSubtitle: "مقالات ونصائح تربوية وإبداعية لمساعدتكم في رحلة تنمية أطفالكم.",
    finalCtaTitle: "هل أنت جاهز لبدء الرحلة؟",
    finalCtaSubtitle: "اختر المسار الذي يناسب طفلك اليوم وافتح له بابًا جديدًا من الخيال والمعرفة."
  },
  aboutPage: {
    heroTitle: "رسالتنا",
    missionStatement: "نؤمن أن كل طفل هو بطل حكايته الخاصة. لذلك نصنع بحب وإتقان قصصاً ومنتجات تربوية مخصصة تماماً، تكون مرآة تعكس شخصية الطفل الفريدة، وتعزز هويته العربية، وتغرس في قلبه أسمى القيم الإنسانية.",
    ourStory: "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة 'منصة الرحلة' - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي.",
    ourVision: "أن نكون المنصة الرائدة والوجهة الأولى لكل أسرة عربية تبحث عن محتوى تربوي إبداعي وأصيل ينمّي شخصية الطفل، يعزز ارتباطه بلغته وهويته، ويطلق العنان لخياله الإبداعي.",
    valuesTitle: "قيمنا الأساسية"
  },
  enhaLakPage: {
    main: {
      heroTitle: "أكثر من مجرد قصة... إنها مغامرة شخصية لطفلك",
      heroSubtitle: "مشروع 'إنها لك' هو حجر الأساس في منصتنا، حيث نحول الطفل من مجرد قارئ إلى بطل حقيقي يعيش المغامرة بكل تفاصيلها.",
      productsTitle: "ماذا نصنع في 'إنها لك'؟",
      howItWorksTitle: "خطوات بسيطة لقصة فريدة",
      galleryTitle: "من أعمالنا",
      gallerySubtitle: "نماذج من قصص أطفالنا (بعد أخذ إذن أولياء الأمور).",
      testimonialsTitle: "تجارب لا تُنسى من عائلاتنا",
      testimonialsSubtitle: "آراء نفخر بها من عائلة 'الرحلة'.",
      finalCtaTitle: "هل أنت جاهز لصناعة السحر؟",
      finalCtaSubtitle: "اختر المنتج الذي يناسب طفلك اليوم واهدِه قصة ستبقى في ذاكرته إلى الأبد."
    },
    store: {
      heroTitle: "متجر 'إنها لك'",
      heroSubtitle: "اختر الكنز الذي سيجعل طفلك بطلاً. كل منتج مصمم بحب ليقدم تجربة فريدة لا تُنسى.",
      subscriptionBannerTitle: "اكتشف صندوق الرحلة الشهري!",
      featuredProductsTitle: "المنتجات المميزة",
      coreProductsTitle: "المنتجات الأساسية",
      addonProductsTitle: "إضافات إبداعية"
    },
    subscription: {
      heroTitle: "صندوق الرحلة الشهري",
      heroSubtitle: "هدية متجددة كل شهر، تفتح لطفلك أبواباً جديدة من الخيال والمعرفة.",
      features: [
        "قصة مخصصة جديدة كل شهر.",
        "أنشطة تفاعلية وألعاب تعليمية.",
        "هدية إضافية مختارة بعناية."
      ]
    }
  },
  creativeWritingPage: {
    main: {
      heroTitle: "'بداية الرحلة': حيث لا تُكتب الكلمات، بل تولد العوالم",
      heroSubtitle: "'بداية الرحلة' ليس برنامجاً لتعليم الكتابة، بل هو احتفال بالصوت الفريد لكل طفل.",
      methodologyTitle: "منهجيتنا المتميزة: 'الإلهام قبل القواعد'",
      methodologySubtitle: "كيف نطلق الإبداع؟",
      transformationTitle: "التحول الذي نصنعه",
      transformationSubtitle: "مع نهاية الرحلة، لا يحصل طفلك على مجرد نصوص مكتوبة، بل يحصل على ما هو أثمن:",
      packagesTitle: "باقات مصممة لكل مبدع",
      packagesSubtitle: "سواء كان طفلك يستكشف الكتابة لأول مرة أو يمتلك موهبة واعدة، لدينا الباقة المثالية التي تناسب مرحلته وتطلق العنان لإمكاناته الكاملة.",
      servicesTitle: "خدمات إبداعية إضافية",
      servicesSubtitle: "هل تحتاج إلى استشارة خاصة، أو مراجعة لنص كتبه طفلك؟ اكتشف خدماتنا الإضافية المصممة لدعم المبدعين الصغار في كل خطوة.",
      instructorsTitle: "مدربونا المتخصصون",
      instructorsSubtitle: "نخبة من الخبراء الشغوفين بإلهام العقول المبدعة.",
      testimonialsTitle: "آراء أولياء الأمور",
      testimonialsSubtitle: "تجارب حقيقية من عائلات انضمت لبرنامج 'بداية الرحلة'.",
      finalCtaTitle: "هل أنت جاهز لبدء الرحلة؟",
      finalCtaSubtitle: "اختر الباقة التي تناسب طفلك اليوم وافتح له بابًا جديدًا من الإبداع والتعبير."
    },
    about: {
      heroTitle: "لماذا 'بداية الرحلة'؟",
      heroSubtitle: "لأننا نؤمن أن بداخل كل طفل كاتباً عظيماً ينتظر من يكتشفه.",
      mainTitle: "رحلة شخصية، وليست درساً",
      mainContent: "نحن لا نقدم دروسًا، بل نقدم رحلة شخصية بصحبة مرشد متخصص. في جلسات فردية مباشرة، نأخذ بيد طفلك بعيدًا عن سطوة القواعد الصارمة والتقييم، ونمنحه حرية الورقة البيضاء. هنا، لا توجد إجابات صحيحة أو خاطئة؛ يوجد فقط صوت طفلك، خياله، وقصته التي تنتظر أن تُروى.",
      philosophyTitle: "فلسفتنا في ثلاث كلمات"
    },
    curriculum: {
      heroTitle: "خريطة الرحلة الإبداعية",
      heroSubtitle: "مسار تعليمي مصمم بعناية لينقل طفلك من مجرد فكرة إلى قصة متكاملة، خطوة بخطوة.",
      treasuresTitle: "كنوز رحلتك",
      treasuresSubtitle: "في نهاية البرنامج، لا يخرج طفلك بيدين فارغتين، بل يحمل معه ما يثبت إنجازه ونموه."
    },
    instructors: {
      heroTitle: "رفقاء الرحلة الملهمون",
      heroSubtitle: "نؤمن أن الإبداع لا يُلقّن، بل يُلهم. لذلك، اخترنا بعناية نخبة من الكتّاب والتربويين."
    }
  }
};


const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

export const mockScheduledSessions: ScheduledSession[] = [
    // Journey 1 (bk_abc) for Fatima (child_id: 1)
    { id: 'ses_1', booking_id: 'bk_abc', subscription_id: null, child_id: 1, instructor_id: 1, session_date: new Date(Date.now() - 86400000 * 14).toISOString(), status: 'completed' },
    { id: 'ses_3', booking_id: 'bk_abc', subscription_id: null, child_id: 1, instructor_id: 1, session_date: new Date(firstDayOfMonth.setDate(2)).toISOString(), status: 'completed' },
    { id: 'ses_2', booking_id: 'bk_abc', subscription_id: null, child_id: 1, instructor_id: 1, session_date: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'upcoming' },
    { id: 'ses_4', booking_id: 'bk_abc', subscription_id: null, child_id: 1, instructor_id: 1, session_date: new Date(Date.now() + 86400000 * 14).toISOString(), status: 'upcoming' },
    // Journey 2 (bk_def) for Omar (child_id: 2)
    { id: 'ses_5', booking_id: 'bk_def', subscription_id: null, child_id: 2, instructor_id: 1, session_date: new Date(firstDayOfMonth.setDate(3)).toISOString(), status: 'completed' },
    { id: 'ses_6', booking_id: 'bk_def', subscription_id: null, child_id: 2, instructor_id: 1, session_date: new Date(Date.now() + 86400000 * 10).toISOString(), status: 'upcoming' },
];

export const mockSessionMessages: SessionMessage[] = [
    { id: 'msg_1', booking_id: 'bk_abc', sender_id: 'usr_instructor_1', sender_role: 'instructor', message_text: 'مرحباً فاطمة، هل أنتِ مستعدة لجلستنا القادمة؟', created_at: new Date().toISOString() },
];

export const mockSessionAttachments: SessionAttachment[] = [
    { id: 'att_1', booking_id: 'bk_abc', uploader_id: 'usr_student', uploader_role: 'student', file_name: 'قصتي-الأولى.pdf', file_url: '#', created_at: new Date().toISOString() },
];

export const mockSupportSessionRequests: SupportSessionRequest[] = [
    { id: 'sup_req_1', instructor_id: 1, child_id: 1, reason: 'يحتاج الطالب جلسة دعم إضافية لمناقشة فكرة القصة.', status: 'pending', requested_at: new Date().toISOString() },
];