
// هذا الملف يحتوي على إعدادات النظام
// يتم استخدامه كنقطة الحقيقة الواحدة (Single Source of Truth) عند بدء التشغيل

export const DEFAULT_CONFIG = {
    // 1. إعدادات قاعدة البيانات (Supabase)
    supabase: {
        projectName: 'Alrehla',
        projectId: 'mqsmgtparbdpvnbyxokh',
        projectUrl: 'https://mqsmgtparbdpvnbyxokh.supabase.co',
        // المفتاح العام (Anon Key) - آمن للاستخدام في المتصفح
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc21ndHBhcmJkcHZuYnl4b2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTgwNDQsImV4cCI6MjA4MTEzNDA0NH0.RoZXNNqH7--_bFq4Qi3hKsFVONEtjgiuOZc_N95PxPg',
        // هام: مفتاح الخدمة (Service Role) يجب ألا يوضع هنا أبداً في الكود المصدري.
        // في Vercel، يتم إضافته عبر Environment Variables باسم SUPABASE_SERVICE_ROLE_KEY
    },

    // 2. إعدادات الصور والوسائط (Cloudinary)
    cloudinary: {
        cloudName: 'dvouptrzu',
        apiKey: '386324268169756',
        apiSecret: 'HJ1bF9nEJZH2OKPlvqwqU1uVgNY', // يفضل نقل هذا أيضاً لمتغيرات البيئة في الإنتاج
        uploadPreset: 'alrehla_uploads',
        environmentVariable: '3c68b2c0eb05cc187526c65b1c64f6'
    },

    // 3. إعدادات تخزين الملفات (Supabase Storage)
    storage: {
        bucketName: 'receipts', // سلة تخزين الإيصالات والملفات
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    },

    // 4. إعدادات النشر (Vercel)
    vercel: {
        environment: 'production'
    }
};
