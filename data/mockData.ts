import type { 
    UserProfile, ChildProfile, Order, CreativeWritingBooking, PersonalizedProduct, Instructor, 
    SupportTicket, JoinRequest, BlogPost, Subscription, CreativeWritingPackage, AdditionalService,
    Prices, SiteBranding, ShippingCosts, ScheduledSession, SessionMessage, SessionAttachment, SupportSessionRequest
} from '../lib/database.types';

export const mockUsers: UserProfile[] = [
  { id: 'usr_parent', name: 'أحمد عبدالله', email: 'parent@alrehlah.com', created_at: '2023-01-15T10:00:00Z', role: 'parent' },
  { id: 'usr_student', name: 'فاطمة أحمد', email: 'student@alrehlah.com', created_at: '2023-01-15T10:05:00Z', role: 'student' },
  { id: 'usr_admin', name: 'مدير النظام', email: 'admin@alrehlah.com', created_at: '2023-01-10T09:00:00Z', role: 'super_admin' },
  { id: 'usr_supervisor', name: 'مشرف عام', email: 'supervisor@alrehlah.com', created_at: '2023-01-11T09:00:00Z', role: 'general_supervisor' },
  { id: 'usr_cws', name: 'مشرف بداية الرحلة', email: 'cws@alrehlah.com', created_at: '2023-01-12T09:00:00Z', role: 'creative_writing_supervisor' },
  { id: 'usr_instructor', name: 'أ. نورة القحطاني', email: 'instructor@alrehlah.com', created_at: '2023-01-13T09:00:00Z', role: 'instructor' },
  { id: 'usr_support', name: 'وكيل دعم', email: 'support@alrehlah.com', created_at: '2023-01-14T09:00:00Z', role: 'support_agent' },
  { id: 'usr_editor', name: 'محرر محتوى', email: 'editor@alrehlah.com', created_at: '2023-01-14T10:00:00Z', role: 'content_editor' },
  { id: 'usr_user', name: 'سارة علي', email: 'user@alrehlah.com', created_at: '2023-02-01T11:00:00Z', role: 'user' },
];

export const mockChildProfiles: ChildProfile[] = [
  { id: 1, user_id: 'usr_parent', name: 'فاطمة أحمد', age: 8, gender: 'أنثى', avatar_url: 'https://i.ibb.co/yY3GJk1/female-avatar.png', interests: ['الرسم', 'الفضاء'], strengths: ['مبدعة', 'فضولية'], created_at: '2023-01-15T10:01:00Z', student_user_id: 'usr_student' },
  { id: 2, user_id: 'usr_parent', name: 'يوسف أحمد', age: 6, gender: 'ذكر', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', interests: ['الديناصورات', 'السيارات'], strengths: ['شجاع', 'نشيط'], created_at: '2023-01-20T11:00:00Z', student_user_id: null },
];

export const mockOrders: Order[] = [
  { id: 'ord_12345', user_id: 'usr_parent', child_id: 1, order_date: '2023-08-01T14:00:00Z', status: 'تم التسليم', total: 600, item_summary: 'قصة مخصصة: مغامرة فاطمة في الفضاء', details: { childName: 'فاطمة أحمد', childAge: 8, childGender: 'أنثى' }, admin_comment: 'تمت المراجعة والشحن.', receipt_url: 'https://example.com/receipt.pdf' },
  { id: 'ord_67890', user_id: 'usr_parent', child_id: 2, order_date: '2023-08-10T18:30:00Z', status: 'بانتظار الدفع', total: 750, item_summary: 'بوكس الهدية الكامل', details: { childName: 'يوسف أحمد', childAge: 6, childGender: 'ذكر' }, admin_comment: null, receipt_url: null },
];

export const mockBookings: CreativeWritingBooking[] = [
    { id: 'bk_abcde', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 1, instructor_id: 1, package_name: 'الباقة الأساسية', booking_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), booking_time: '17:00', status: 'مؤكد', total: 800, receipt_url: 'https://example.com/receipt.pdf', progress_notes: 'أظهرت فاطمة تقدماً ملحوظاً في بناء الشخصيات. تحتاج إلى التركيز على الحبكة.', session_id: 'journey_1', created_at: '2023-07-20T10:00:00Z' },
    { id: 'bk_fghij', user_id: 'usr_user', user_name: 'سارة علي', child_id: 2, instructor_id: 2, package_name: 'الباقة المتقدمة', booking_date: '2023-08-05T16:00:00Z', booking_time: '16:00', status: 'مكتمل', total: 1200, receipt_url: 'https://example.com/receipt.pdf', progress_notes: 'أكمل يوسف القصة بنجاح.', session_id: 'journey_2', created_at: '2023-07-15T12:00:00Z' },
    { id: 'bk_klmno', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 1, instructor_id: 1, package_name: 'الباقة الأساسية', booking_date: '2023-08-01T17:00:00Z', booking_time: '17:00', status: 'مكتمل', total: 800, receipt_url: 'https://example.com/receipt.pdf', progress_notes: 'الجلسة الأولى كانت ممتازة.', session_id: 'journey_3', created_at: '2023-07-20T10:00:00Z' },
];

export const mockPersonalizedProducts: PersonalizedProduct[] = [
    { id: 1, key: 'custom_story', title: 'القصة المخصصة', description: 'قصة يكون فيها طفلك هو البطل، مع اسمه وصورته واهتماماته.', image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', features: ['تخصيص كامل للبطل', 'اختيار الهدف التربوي', 'نسخة مطبوعة فاخرة وإلكترونية'], sort_order: 1 },
    { id: 2, key: 'gift_box', title: 'بوكس الهدية الكامل', description: 'مجموعة متكاملة تشمل القصة المخصصة ومنتجات إضافية في تغليف فاخر.', image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg', features: ['القصة المخصصة', 'دفتر تلوين', 'كتيب أذكار', 'تغليف هدايا'], sort_order: 2 },
    { id: 3, key: 'coloring_book', title: 'دفتر التلوين', description: 'رسومات من قصة طفلك الشخصية جاهزة للتلوين والإبداع.', image_url: null, features: [], sort_order: 3 },
    { id: 4, key: 'dua_booklet', title: 'كتيّب الأذكار والأدعية', description: 'كتيب مصور بشخصية طفلك يحتوي على أدعية وأذكار يومية.', image_url: null, features: [], sort_order: 4 },
];

export const mockInstructors: Instructor[] = [
    { id: 1, user_id: 'usr_instructor', name: 'أ. نورة القحطاني', slug: 'noura-qahtani', specialty: 'متخصصة في السرد القصصي (8-12 سنة)', bio: 'خبرة 8 سنوات في تدريب الأطفال على الكتابة الإبداعية.', avatar_url: 'https://i.ibb.co/yY3GJk1/female-avatar.png', availability: {}, weekly_schedule: { monday: ['17:00', '18:00'], wednesday: ['17:00', '18:00'] }, schedule_status: 'approved', rate_per_session: 200, pending_profile_data: null, profile_update_status: null },
    { id: 2, user_id: null, name: 'أ. أحمد المصري', slug: 'ahmed-masri', specialty: 'متخصص في بناء العوالم (13-18 سنة)', bio: 'كاتب وروائي منشور له عدة أعمال في أدب الفانتازيا.', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', availability: {}, weekly_schedule: { tuesday: ['16:00', '17:00', '18:00'], thursday: ['16:00', '17:00'] }, schedule_status: 'pending', rate_per_session: 250, pending_profile_data: { updates: { bio: 'bio جديد', rate_per_session: 300 }, justification: 'تحديث الأسعار والخبرات' }, profile_update_status: 'pending' },
];

export const mockCreativeWritingPackages: CreativeWritingPackage[] = [
    { id: 1, name: 'الباقة التجريبية', sessions: 'جلسة واحدة (30 دقيقة)', price: 0, features: ['تقييم مهارات الطفل', 'خطة مخصصة'], popular: false, goal_description: 'اكتشاف موهبة طفلك وتحديد نقاط قوته في الكتابة.', final_product_description: 'خطة تطوير شخصية مقترحة.' },
    { id: 2, name: 'الباقة الأساسية', sessions: '4 جلسات فردية (45 دقيقة)', price: 800, features: ['متابعة أسبوعية', 'تقارير دورية'], popular: true, goal_description: 'بناء أساسيات السرد القصصي واكتشاف الصوت الإبداعي.', final_product_description: 'قصة قصيرة من 1-3 صفحات من تأليف الطالب.' },
    { id: 3, name: 'الباقة المتقدمة', sessions: '6 جلسات فردية (60 دقيقة)', price: 1200, features: ['ورش عمل جماعية', 'مراجعة وتحرير'], popular: false, goal_description: 'تطوير تقنيات السرد وبناء شخصيات معقدة.', final_product_description: 'قصة متكاملة مع شخصيات وحبكة مطورة.' },
];

export const mockAdditionalServices: AdditionalService[] = [
    { id: 1, name: 'جلسة دعم إضافية', price: 200, description: 'جلسة فردية لمدة 45 دقيقة مع المدرب.' },
    { id: 2, name: 'مراجعة نص خارجي', price: 150, description: 'مراجعة وتحرير قصة أو نص من خارج البرنامج.' },
];

export const mockSupportTickets: SupportTicket[] = [
    { id: 'tkt_1', name: 'علي حسن', email: 'ali@example.com', subject: 'استفسار عن الشحن', message: 'متى يصل طلبي؟', status: 'جديدة', created_at: '2023-08-12T10:00:00Z' },
    { id: 'tkt_2', name: 'هند محمد', email: 'hind@example.com', subject: 'مشكلة تقنية', message: 'لا أستطيع رفع الصور.', status: 'مغلقة', created_at: '2023-08-11T15:20:00Z' },
];

export const mockJoinRequests: JoinRequest[] = [
    { id: 'jr_1', name: 'مبدع جديد', email: 'creative@example.com', role: 'رسام قصص أطفال', message: 'أنا رسام ولدي خبرة.', status: 'جديد', portfolio_url: 'https://behance.net/creative', created_at: '2023-08-12T11:00:00Z' },
];

export const mockBlogPosts: BlogPost[] = [
    { id: 1, title: '5 طرق لتشجيع طفلك على القراءة', slug: '5-ways-to-encourage-reading', content: 'القراءة هي مفتاح عوالم الخيال والمعرفة...', author_name: 'فريق المنصة', image_url: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg', status: 'published', published_at: '2023-08-01T12:00:00Z', created_at: '2023-07-30T10:00:00Z' },
    { id: 2, title: 'كيف تحول وقت اللعب إلى فرصة للتعلم؟', slug: 'play-and-learn', content: 'اللعب هو لغة الأطفال...', author_name: 'أ. نورة القحطاني', image_url: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg', status: 'published', published_at: '2023-07-25T12:00:00Z', created_at: '2023-07-24T10:00:00Z' },
    { id: 3, title: 'أهمية القصص المخصصة (مسودة)', slug: 'importance-of-personalized-stories', content: 'تأثير رؤية الطفل لنفسه كبطل...', author_name: 'فريق المنصة', image_url: null, status: 'draft', published_at: null, created_at: '2023-08-10T10:00:00Z' },
];

export const mockSubscriptions: Subscription[] = [
    { id: 'sub_xyz', user_id: 'usr_parent', user_name: 'أحمد عبدالله', child_id: 2, child_name: 'يوسف أحمد', start_date: '2023-08-01T00:00:00Z', next_renewal_date: '2023-09-01T00:00:00Z', status: 'active' },
];

export const mockNotifications: any[] = [
    { id: 1, user_id: 'usr_parent', message: 'تم شحن طلبك #ord_12345 بنجاح!', type: 'order', read: false, link: '/account', created_at: '2023-08-02T10:00:00Z' },
    { id: 2, user_id: 'usr_parent', message: 'تم تأكيد حجز جلستك مع أ. نورة القحطاني.', type: 'booking', read: true, link: '/account', created_at: '2023-07-21T11:00:00Z' },
];

export const mockSiteContent = {
    portalPage: {
        heroTitle: "رحلة كل طفل تبدأ بقصة... وقصته تبدأ هنا",
        heroSubtitle: "منصة تربوية عربية متكاملة تصنع قصصاً مخصصة تجعل طفلك بطلاً، وتطلق مواهبه في الكتابة الإبداعية.",
        enhaLakTitle: "إنها لك",
        enhaLakDescription: "قصص مخصصة ومنتجات تربوية فريدة تجعل طفلك بطل الحكاية الحقيقي.",
        creativeWritingTitle: "بداية الرحلة",
        creativeWritingDescription: "برنامج متكامل لتنمية مهارات الكتابة الإبداعية للأطفال والشباب من 8-18 سنة.",
        valuePropositionTitle: "لماذا منصة الرحلة هي الأفضل لطفلك؟",
    },
    aboutPage: {
        missionStatement: "نؤمن أن كل طفل هو بطل حكايته الخاصة. لذلك نصنع بحب وإتقان قصصاً ومنتجات تربوية مخصصة تماماً، تكون مرآة تعكس شخصية الطفل الفريدة، وتعزز هويته العربية، وتغرس في قلبه أسمى القيم الإنسانية.",
        ourStory: "في عالم يتسارع نحو الرقمنة، لاحظنا أن أطفالنا العرب يفتقرون لمحتوى تربوي يعكس هويتهم ويلامس قلوبهم. من هنا وُلدت فكرة 'منصة الرحلة' - حلم بأن نصنع لكل طفل عربي قصة خاصة به، يكون فيها البطل الحقيقي.",
        ourVision: "أن نكون المنصة الرائدة والوجهة الأولى لكل أسرة عربية تبحث عن محتوى تربوي إبداعي وأصيل ينمّي شخصية الطفل، يعزز ارتباطه بلغته وهويته، ويطلق العنان لخياله الإبداعي."
    },
    enhaLakPage: {},
    creativeWritingPage: {},
};

export const mockSocialLinks = {
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com'
};

export const mockPublicHolidays: string[] = ["2024-10-06", "2025-01-07", "2025-01-25"];

export const mockPrices: Prices = {
    story: { printed: 500, electronic: 250 },
    coloringBook: 100,
    duaBooklet: 80,
    valuesStory: 150,
    skillsStory: 150,
    voiceOver: 120,
    giftBox: 750,
    subscriptionBox: 350
};

export const mockSiteBranding: SiteBranding = {
    logoUrl: "https://i.ibb.co/C0bSJJT/favicon.png",
    creativeWritingLogoUrl: "https://i.ibb.co/bF9gYq2/Bidayat-Alrehla-Logo.png",
    heroImageUrl: "https://i.ibb.co/RzJzQhL/hero-image-new.jpg",
    aboutImageUrl: "https://i.ibb.co/8XYt2s5/about-us-image.jpg",
    creativeWritingPortalImageUrl: "https://i.ibb.co/n7ZJv9V/child-learning-online.jpg"
};

export const mockShippingCosts: ShippingCosts = {
    "القاهرة": 0, "الجيزة": 50, "الإسكندرية": 60, "الدقهلية": 70, "البحر الأحمر": 80, "البحيرة": 65,
    "الفيوم": 60, "الغربية": 65, "الإسماعيلية": 70, "المنوفية": 65, "المنيا": 75, "القليوبية": 55,
    "الوادي الجديد": 90, "السويس": 70, "اسوان": 90, "اسيوط": 80, "بني سويف": 70, "بورسعيد": 70,
    "دمياط": 65, "الشرقية": 65, "جنوب سيناء": 85, "كفر الشيخ": 65, "مطروح": 85, "الأقصر": 90,
    "قنا": 85, "شمال سيناء": 85, "سوهاج": 85
};

export const mockScheduledSessions: ScheduledSession[] = [
    { id: 'ses_1', subscription_id: 'sub_xyz', booking_id: null, child_id: 2, instructor_id: 1, session_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', created_at: '' },
    { id: 'ses_2', subscription_id: 'sub_xyz', booking_id: null, child_id: 2, instructor_id: 1, session_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming', created_at: '' },
    { id: 'ses_journey1_1', subscription_id: null, booking_id: 'bk_abcde', child_id: 1, instructor_id: 1, session_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming', created_at: '' },
];
export const mockSessionMessages: SessionMessage[] = [
    { id: 'msg_1', booking_id: 'bk_abcde', sender_id: 'usr_instructor', sender_role: 'instructor', message_text: 'مرحباً فاطمة، هل أنتِ مستعدة لجلستنا القادمة؟', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'msg_2', booking_id: 'bk_abcde', sender_id: 'usr_student', sender_role: 'student', message_text: 'نعم متحمسة جداً!', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
];
export const mockSessionAttachments: SessionAttachment[] = [];
export const mockSupportSessionRequests: SupportSessionRequest[] = [
    { id: 'sup_req_1', instructor_id: 2, child_id: 2, reason: 'الطالب يواجه صعوبة في تطوير الحبكة ويحتاج لجلسة دعم إضافية.', status: 'pending', requested_at: new Date().toISOString() }
];
