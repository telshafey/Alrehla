export const DEFAULT_CONFIG = {
    supabase: {
        projectName: 'Alrehla',
        projectId: 'mqsmgtparbdpvnbyxokh',
        projectUrl: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    cloudinary: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
        apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        environmentVariable: '3c68b2c0eb05cc187526c65b1c64f6'
    },
    storage: {
        bucketName: 'receipts',
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    },
    vercel: {
        environment: 'production'
    }
};
