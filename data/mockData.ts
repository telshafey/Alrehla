import type { UserProfile, ChildProfile, Order, CreativeWritingBooking, PersonalizedProduct, Instructor, Prices, SiteBranding, ShippingCosts, SocialLinks, SupportTicket, JoinRequest, BlogPost, Subscription, CreativeWritingPackage, AdditionalService, UserRole, ScheduledSession, SessionMessage, SessionAttachment, SupportSessionRequest } from '../lib/database.types';

// FIX: Added mockNotifications data
export const mockNotifications = [
    { id: 1, type: 'order', message: 'طلبك #ord_123 قيد التجهيز الآن.', created_at: new Date().toISOString(), read: false },
    { id: 2, type: 'booking', message: 'جلستك القادمة مع أ. نورة القحطاني بعد 3 أيام.', created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), read: false },
    { id: 3, type: 'general', message: 'مرحباً بك في منصة الرحلة! استكشف عوالمنا.', created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), read: true },
    { id: 4, type: 'order', message: 'تم شحن طلبك #ord_456 وهو في طريقه إليك.', created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), read: true },
];

export const mockUsers: (UserProfile & { password?: string })[] = [
  { id: 'usr_parent', name: 'أحمد عبدالله (ولي أمر)', email: 'parent@alrehlah.com', role: 'parent', created_at: '2023-01-01T10:00:00Z', password: '123456' },
  { id: 'usr_user', name: 'سارة خالد (مستخدم)', email: 'user@alrehlah.com', role: 'user', created_at: '2023-01-02T11:00:00Z', password: '123456' },
  { id: 'usr_student', name: 'عمر أحمد (طالب)', email: 'student@alrehlah.com', role: 'student', created_at: '2023-01-03T12:00:00Z', password: '123456' },
  { id: 'usr_admin', name: 'مدير المنصة', email: 'admin@alrehlah.com', role: 'super_admin', created_at: '2023-01-04T13:00:00Z', password: '123456' },
  { id: 'usr_supervisor', name: 'مشرف عام', email: 'supervisor@alrehlah.com', role: 'general_supervisor', created_at: '2023-01-05T14:00:00Z', password: '123456' },
  { id: 'usr_enhalak', name: 'مشرف إنها لك', email: 'enhalak@alrehlah.com', role: 'enha_lak_supervisor', created_at: '2023-01-06T15:00:00Z', password: '123456' },
  { id: 'usr_cws', name: 'مشرف بداية الرحلة', email: 'cws@alrehlah.com', role: 'creative_writing_supervisor', created_at: '2023-01-07T16:00:00Z', password: '123456' },
  { id: 'usr_instructor', name: 'أ. نورة القحطاني', email: 'instructor@alrehlah.com', role: 'instructor', created_at: '2023-01-08T17:00:00Z', password: '123456' },
  { id: 'usr_editor', name: 'محرر محتوى', email: 'editor@alrehlah.com', role: 'content_editor', created_at: '2023-01-09T18:00:00Z', password: '123456' },
  { id: 'usr_support', name: 'وكيل دعم', email: 'support@alrehlah.com', role: 'support_agent', created_at: '2023-01-10T19:00:00Z', password: '123456' },
];

export const mockChildProfiles: ChildProfile[] = [
  { id: 1, user_id: 'usr_parent', name: 'عمر', age: 7, gender: 'ذكر', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', interests: ['ديناصورات', 'فضاء'], strengths: ['شجاع', 'خياله واسع'], created_at: '2023-02-01T10:00:00Z', student_user_id: 'usr_student' },
  { id: 2, user_id: 'usr_parent', name: 'فاطمة', age: 5, gender: 'أنثى', avatar_url: 'https://i.ibb.co/yY3GJk1/female-avatar.png', interests: ['رسم', 'حيوانات'], strengths: ['لطيفة', 'تحب المساعدة'], created_at: '2023-02-02T11:00:00Z', student_user_id: null },
];

export const mockOrders: Order[] = [
  { id: 'ord_123', user_id: 'usr_parent', child_id: 1, order_date: new Date().toISOString(), status: 'قيد التجهيز', total: 600, item_summary: 'قصة مخصصة', details: { childName: 'عمر', childAge: '7' }, admin_comment: 'الرجاء التركيز على جانب الشجاعة.', receipt_url: 'https://example.com/receipt.pdf' },
  { id: 'ord_456', user_id: 'usr_user', child_id: null, order_date: '2023-05-15T14:30:00Z', status: 'تم التسليم', total: 850, item_summary: 'بوكس الهدية', details: { childName: 'خالد', childAge: '6' }, admin_comment: null, receipt_url: 'https://example.com/receipt.pdf' },
  { id: 'ord_789', user_id: 'usr_parent', child_id: 2, order_date: '2023-05-10T11:00:00Z', status: 'بانتظار الدفع', total: 200, item_summary: 'دفتر تلوين', details: { childName: 'فاطمة', childAge: '5' }, admin_comment: null, receipt_url: null },
];

export const mockBookings: CreativeWritingBooking[] = [
  { id: 'book_abc', user_id: 'usr_parent', user_name: 'أحمد عبدالله (ولي أمر)', child_id: 1, instructor_id: 1, package_name: 'الباقة الأساسية', booking_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), booking_time: '17:00', status: 'مؤكد', total: 800, receipt_url: 'https://example.com/receipt.pdf', progress_notes: 'عمر متحمس جداً وبدأ في كتابة قصته الأولى عن ديناصور.', session_id: 'abc-123', created_at: '2023-05-20T10:00:00Z' },
  { id: 'book_def', user_id: 'usr_parent', user_name: 'أحمد عبدالله (ولي أمر)', child_id: 1, instructor_id: 1, package_name: 'الباقة الأساسية', booking_date: '2023-05-15T17:00:00Z', booking_time: '17:00', status: 'مكتمل', total: 800, receipt_url: 'https://example.com/receipt.pdf', progress_notes: 'أنهينا مخطط القصة، وعمر لديه أفكار رائعة للشخصيات.', session_id: 'def-456', created_at: '2023-05-10T10:00:00Z' },
];

export const mockPersonalizedProducts: PersonalizedProduct[] = [
    { id: 1, key: 'custom_story', title: 'القصة المخصصة', description: 'قصة فريدة من نوعها يكون فيها طفلك هو البطل، مع اسمه وصورته وتفاصيله.', image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg', features: ['تخصيص كامل للبطل', 'اختيار الهدف التربوي', 'نسخة مطبوعة فاخرة'], sort_order: 1 },
    { id: 2, key: 'gift_box', title: 'بوكس الهدية', description: 'مجموعة متكاملة تشمل القصة المخصصة ومنتجات إضافية في تغليف فاخر.', image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', features: ['القصة المخصصة', 'دفتر تلوين', 'كتيب أذكار'], sort_order: 2 },
    { id: 3, key: 'coloring_book', title: 'دفتر التلوين', description: 'دفتر تلوين برسومات من قصة طفلك الشخصية.', image_url: null, features: ['20+ صفحة تلوين', 'رسومات من قصة الطفل'], sort_order: 3 },
    { id: 4, key: 'dua_booklet', title: 'كتيب الأدعية', description: 'كتيب أدعية وأذكار يومية مصور بشخصية طفلك.', image_url: null, features: ['أدعية وأذكار مختارة', 'تصميم جذاب للأطفال'], sort_order: 4 },
];

export const mockInstructors: Instructor[] = [
    { 
        id: 1, 
        user_id: 'usr_instructor', 
        name: 'أ. نورة القحطاني', 
        slug: 'noura-alqahtani', 
        specialty: 'متخصصة في السرد القصصي (8-12 سنة)', 
        bio: 'كاتبة وشاعرة حاصلة على ماجستير في أدب الطفل، شغوفة بإلهام الصغار لاكتشاف أصواتهم الإبداعية.', 
        avatar_url: 'https://i.ibb.co/yY3GJk1/female-avatar.png', 
        availability: { "25": ["17:00", "18:00"], "28": ["16:00"] }, 
        weekly_schedule: { "sunday": ["17:00", "18:00"], "tuesday": ["16:00"] }, 
        schedule_status: 'approved',
        rate_per_session: 250,
        pending_profile_data: {
            bio: 'كاتبة وشاعرة شغوفة بإلهام الصغار. حصلت على جائزة الأدب العربي للطفل عام 2023.',
            rate_per_session: 300,
        },
        profile_update_status: 'pending',
    },
    { 
        id: 2, 
        user_id: null, 
        name: 'أ. أحمد المصري', 
        slug: 'ahmed-almasri', 
        specialty: 'متخصص في بناء العوالم (13-18 سنة)', 
        bio: 'روائي وكاتب سيناريو، خبير في أدب الفانتازيا والخيال العلمي، يؤمن بأن كل شخص لديه عالم خاص يستحق أن يُروى.', 
        avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', 
        availability: {}, 
        weekly_schedule: {}, 
        schedule_status: null,
        rate_per_session: 300,
        pending_profile_data: null,
        profile_update_status: null,
    },
];

export const mockCreativeWritingPackages: CreativeWritingPackage[] = [
    { id: 1, name: 'الباقة التجريبية', sessions: 'جلسة واحدة (30 دقيقة)', price: 0, features: ['تقييم مهارات الطفل', 'خطة مخصصة'], popular: false, goal_description: null, final_product_description: null },
    { id: 2, name: 'الباقة الأساسية', sessions: '4 جلسات فردية (45 دقيقة)', price: 800, features: ['متابعة أسبوعية', 'تقارير دورية'], popular: true, goal_description: 'كتابة قصة قصيرة متكاملة من 300 كلمة.', final_product_description: 'ملف PDF يحتوي على القصة النهائية مع رسومات توضيحية بسيطة.' },
    { id: 3, name: 'الباقة المتقدمة', sessions: '6 جلسات فردية (60 دقيقة)', price: 1200, features: ['ورش عمل جماعية', 'مراجعة الأعمال'], popular: false, goal_description: 'تطوير شخصية رئيسية وعالمها الخاص عبر عدة نصوص.', final_product_description: 'محفظة رقمية تحتوي على 3-4 نصوص إبداعية.' },
];

export const mockAdditionalServices: AdditionalService[] = [
    { id: 1, name: 'جلسة إضافية', price: 250, description: 'جلسة فردية إضافية لمدة 45 دقيقة.' },
    { id: 2, name: 'مراجعة وتحرير قصة', price: 150, description: 'مراجعة لغوية وإبداعية لقصة من خارج البرنامج.' },
];

export const mockPrices: Prices = {
    story: { printed: 600, electronic: 350 },
    coloringBook: 150,
    duaBooklet: 100,
    valuesStory: 120,
    skillsStory: 120,
    voiceOver: 200,
    giftBox: 850,
    subscriptionBox: 300,
};

export const mockSiteBranding: SiteBranding = {
    logoUrl: 'https://i.ibb.co/bF9gYq2/Bidayat-Alrehla-Logo.png',
    creativeWritingLogoUrl: 'https://i.ibb.co/bF9gYq2/Bidayat-Alrehla-Logo.png',
    heroImageUrl: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg',
    aboutImageUrl: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg',
    creativeWritingPortalImageUrl: 'https://i.ibb.co/n7ZJv9V/child-learning-online.jpg',
};

export const mockShippingCosts: ShippingCosts = {
    "القاهرة": 0, "الجيزة": 45, "الإسكندرية": 60, "الدقهلية": 60, "البحر الأحمر": 70, "البحيرة": 60, "الفيوم": 55, "الغربية": 60, "الإسماعيلية": 55, "المنوفية": 60, "المنيا": 65, "القليوبية": 50, "الوادي الجديد": 80, "السويس": 55, "اسوان": 75, "اسيوط": 70, "بني سويف": 60, "بورسعيد": 55, "دمياط": 60, "الشرقية": 60, "جنوب سيناء": 80, "كفر الشيخ": 60, "مطروح": 75, "الأقصر": 75, "قنا": 75, "شمال سيناء": 80, "سوهاج": 70
};

export const mockSocialLinks: SocialLinks = {
    id: 1,
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
};

export const mockSupportTickets: SupportTicket[] = [
    { id: 'tkt_1', name: 'علي حسن', email: 'ali@example.com', subject: 'استفسار عن الشحن', message: 'متى سيصل طلبي رقم ord_123؟', status: 'جديدة', created_at: new Date().toISOString() },
    { id: 'tkt_2', name: 'منى سعيد', email: 'mona@example.com', subject: 'مشكلة تقنية', message: 'لا أستطيع رفع صورة الطفل في صفحة الطلب.', status: 'تمت المراجعة', created_at: '2023-05-20T12:00:00Z' },
];

export const mockJoinRequests: JoinRequest[] = [
    { id: 'join_1', name: 'خالد إبراهيم', email: 'khaled@example.com', role: 'مدرب كتابة إبداعية', message: 'لدي خبرة 5 سنوات في تدريس الأطفال.', status: 'جديد', portfolio_url: 'https://example.com/portfolio', created_at: new Date().toISOString() },
];

export const mockBlogPosts: BlogPost[] = [
    { id: 1, title: '7 طرق لتشجيع طفلك على القراءة', slug: 'encourage-reading', content: 'القراءة هي مفتاح عوالم الخيال والمعرفة. في هذا المقال، نستعرض 7 طرق عملية وممتعة لتحبيب طفلك في القراءة وجعلها جزءاً من روتينه اليومي.', author_name: 'فريق المنصة', image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg', status: 'published', published_at: '2023-05-18T10:00:00Z', created_at: '2023-05-18T09:00:00Z' },
    { id: 2, title: 'كيف تحول وقت اللعب إلى فرصة للتعلم؟', slug: 'play-and-learn', content: 'اللعب هو لغة الأطفال. اكتشف كيف يمكنك استغلال أوقات اللعب لتنمية مهارات طفلك العقلية والاجتماعية دون أن يشعر بأنه في درس.', author_name: 'فريق المنصة', image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', status: 'published', published_at: '2023-05-10T10:00:00Z', created_at: '2023-05-10T09:00:00Z' },
    { id: 3, title: 'أفكار لمشاريع صيفية (مسودة)', slug: 'summer-projects', content: 'أفكار لمشاريع صيفية', author_name: 'فريق المنصة', image_url: null, status: 'draft', published_at: null, created_at: '2023-05-21T11:00:00Z' },
];

export const mockSubscriptions: Subscription[] = [
    { id: 'sub_1', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 2, child_name: 'فاطمة', start_date: '2023-05-01T10:00:00Z', next_renewal_date: '2023-06-01T10:00:00Z', status: 'active' },
];

export const mockSiteContent = {
    portalPage: {
        heroTitle: "رحلة كل طفل تبدأ بقصة... وقصته تبدأ هنا",
        heroSubtitle: "منصة تربوية عربية متكاملة تصنع قصصاً مخصصة تجعل طفلك بطلاً، وتطلق مواهبه في الكتابة الإبداعية",
        enhaLakTitle: 'إنها لك',
        enhaLakDescription: "قصص مخصصة ومنتجات تربوية فريدة تجعل طفلك بطل الحكاية الحقيقي",
        creativeWritingTitle: 'بداية الرحلة',
        creativeWritingDescription: "برنامج متكامل لتنمية مهارات الكتابة الإبداعية للأطفال والشباب من 8-18 سنة",
        valuePropositionTitle: "لماذا منصة الرحلة هي الأفضل لطفلك؟"
    },
    aboutPage: {
        missionStatement: "نؤمن أن كل طفل هو بطل حكايته الخاصة. لذلك نصنع بحب وإتقان قصصاً ومنتجات تربوية مخصصة تماماً، تكون مرآة تعكس شخصية الطفل الفريدة، وتعزز هويته العربية، وتغرس في قلبه أسمى القيم الإنسانية.",
        ourStory: "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة 'منصة الرحلة' - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي.",
        ourVision: "أن نكون المنصة الرائدة والوجهة الأولى لكل أسرة عربية تبحث عن محتوى تربوي إبداعي وأصيل ينمّي شخصية الطفل، يعزز ارتباطه بلغته وهويته، ويطلق العنان لخياله الإبداعي."
    },
    enhaLakPage: {
        heroTitle: 'أكثر من مجرد قصة... إنها مغامرة شخصية لطفلك',
        heroSubtitle: 'مشروع "إنها لك" هو حجر الأساس في منصتنا، حيث نحول الطفل من مجرد قارئ إلى بطل حقيقي يعيش المغامرة بكل تفاصيلها. يرى اسمه, صورته, وشخصيته منسوجة في حكاية ملهمة تبقى معه للأبد.'
    },
    creativeWritingPage: {
        heroTitle: '"بداية الرحلة": حيث لا تُكتب الكلمات، بل تولد العوالم',
        heroSubtitle: '"بداية الرحلة" ليس برنامجاً لتعليم الكتابة، بل هو احتفال بالصوت الفريد لكل طفل. إنه المفتاح الذي يفتح أقفال الخيال، والمساحة الآمنة التي تتحول فيها الأفكار الخجولة إلى قصص عظيمة.',
        methodologyTitle: 'منهجيتنا المتميزة: "الإلهام قبل القواعد"'
    }
};

// --- NEW SESSION MANAGEMENT SYSTEM MOCK DATA ---

const mockScheduledSessionsData: ScheduledSession[] = [
  {
    id: 'ses_001',
    subscription_id: null,
    booking_id: 'book_abc',
    child_id: 1, // عمر
    instructor_id: 1, // أ. نورة القحطاني
    session_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // In one week
    status: 'upcoming',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ses_002',
    subscription_id: null,
    booking_id: 'book_abc',
    child_id: 1, // عمر
    instructor_id: 1, // أ. نورة القحطاني
    session_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), // One week ago
    status: 'completed',
    created_at: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
  },
  {
    id: 'ses_003',
    subscription_id: null,
    booking_id: 'book_def',
    child_id: 2, // فاطمة
    instructor_id: 2, // أ. أحمد المصري
    session_date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), // In 10 days
    status: 'upcoming',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ses_004',
    subscription_id: null,
    booking_id: 'book_def',
    child_id: 2, // فاطمة
    instructor_id: 2, // أ. أحمد المصري
    session_date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), // 10 days ago
    status: 'missed',
    created_at: new Date(new Date().setDate(new Date().getDate() - 17)).toISOString(),
  },
];
export const mockScheduledSessions = mockScheduledSessionsData;

export const mockSessionMessages: SessionMessage[] = [
  {
    id: 'msg_001',
    booking_id: 'book_abc',
    sender_id: 'usr_instructor', // أ. نورة القحطاني
    sender_role: 'instructor',
    message_text: 'أهلاً يا عمر، هل أنت مستعد لمشاركة ما كتبته هذا الأسبوع؟',
    created_at: new Date(new Date().getTime() - 2 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'msg_002',
    booking_id: 'book_abc',
    sender_id: 'usr_student', // عمر
    sender_role: 'student',
    message_text: 'نعم يا معلمة! أنا متحمس جداً.',
    created_at: new Date(new Date().getTime() - 1 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'msg_003',
    booking_id: 'book_abc',
    sender_id: 'usr_instructor', // أ. نورة القحطاني
    sender_role: 'instructor',
    message_text: 'ممتاز! لقد أرفقت لك ورقة عمل جديدة لمساعدتك في بناء شخصيات قصتك القادمة.',
    created_at: new Date().toISOString(),
  },
];

export const mockSessionAttachments: SessionAttachment[] = [
  {
    id: 'att_001',
    booking_id: 'book_abc',
    uploader_id: 'usr_instructor',
    uploader_role: 'instructor',
    file_name: 'ورقة-عمل-بناء-الشخصية.pdf',
    file_url: '/mock-assets/worksheet.pdf',
    created_at: new Date().toISOString(),
  },
  {
    id: 'att_002',
    booking_id: 'book_abc',
    uploader_id: 'usr_student',
    uploader_role: 'student',
    file_name: 'قصتي-الأولى.docx',
    file_url: '/mock-assets/my-story.docx',
    created_at: new Date(new Date().getTime() - 3 * 24 * 60 * 60000).toISOString(),
  },
];

export const mockSupportSessionRequests: SupportSessionRequest[] = [
    {
        id: 'ssr_001',
        instructor_id: 1,
        child_id: 1, // عمر
        reason: 'عمر يحتاج لمراجعة إضافية على حبكة قصته قبل الجلسة القادمة. جلسة سريعة ستكون مفيدة جداً.',
        status: 'pending',
        requested_at: new Date().toISOString(),
    },
    {
        id: 'ssr_002',
        instructor_id: 2,
        child_id: 2, // فاطمة
        reason: 'فاطمة تواجه صعوبة في توليد الأفكار، جلسة عصف ذهني سريعة ستساعدها.',
        status: 'approved',
        requested_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    }
];