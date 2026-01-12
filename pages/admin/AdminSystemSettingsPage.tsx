
import React, { useState, useEffect } from 'react';
import { Database, Image as ImageIcon, Server, Save, Eye, EyeOff, AlertTriangle, RefreshCw, Terminal, Wrench, Copy, Trash2, Power } from 'lucide-react';
import { useAdminSystemConfig } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { DEFAULT_CONFIG } from '../../lib/config';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../contexts/ToastContext';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const AdminSystemSettingsPage: React.FC = () => {
    const { data: configData, isLoading, refetch } = useAdminSystemConfig();
    const { updateSystemConfig } = useSettingsMutations();
    const { addToast } = useToast();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    const [config, setConfig] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState('repair');

    useEffect(() => {
        if (configData) {
            setConfig(configData);
        }
    }, [configData]);

    useEffect(() => {
        const hasDbError = localStorage.getItem('db_schema_error');
        if (hasDbError || location.search.includes('tab=repair')) {
            setActiveTab('repair');
            if (hasDbError) addToast("مطلوب تدخل يدوي: قاعدة البيانات تحتاج لتحديث.", "error");
        }
    }, [location]);

    const handleChange = (section: keyof typeof DEFAULT_CONFIG, field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        if (window.confirm("تحذير: هل أنت متأكد من حفظ الإعدادات؟")) {
            await updateSystemConfig.mutateAsync(config);
            refetch();
        }
    };

    const handleReset = () => {
        if (window.confirm("هل تريد استعادة الإعدادات الافتراضية؟")) {
            setConfig(DEFAULT_CONFIG);
        }
    };

    const handleHardReset = () => {
        if (window.confirm("هذا الإجراء سيقوم بمسح الذاكرة المؤقتة للمتصفح (Cache) وإعادة تحميل التطبيق بالكامل. هل أنت متأكد؟")) {
            // Clear React Query Cache
            queryClient.clear();
            // Clear Local Storage (Auth tokens, etc) - Be careful not to logout if not intended, but for hard reset it's okay
            localStorage.removeItem('sb-mqsmgtparbdpvnbyxokh-auth-token'); // Supabase token
            localStorage.removeItem('db_schema_error');
            sessionStorage.clear();
            
            addToast("تم تنظيف الذاكرة. جاري إعادة التحميل...", "success");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };
    
    const repairSQL = `
-- 1. إضافة الأعمدة الناقصة (الحل الجذري للمشكلة)
ALTER TABLE session_messages 
ADD COLUMN IF NOT EXISTS sender_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS sender_role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS sender_name text;

ALTER TABLE session_attachments 
ADD COLUMN IF NOT EXISTS uploader_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS uploader_role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS uploader_name text;

-- 2. تحديث صلاحيات الوصول (Policies) لتجنب أخطاء RLS
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attachments ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة أولاً لمنع خطأ "already exists"
DROP POLICY IF EXISTS "Allow access to session participants" ON session_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON session_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON session_messages;
DROP POLICY IF EXISTS "Enable all access" ON session_messages;

CREATE POLICY "Allow access to session participants" ON session_messages 
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow access to session attachments" ON session_attachments;
DROP POLICY IF EXISTS "Enable all access" ON session_attachments;

CREATE POLICY "Allow access to session attachments" ON session_attachments 
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. دالة تغيير كلمة مرور الطالب (للآباء)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION reset_student_password(target_student_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  is_parent boolean;
BEGIN
  current_user_id := auth.uid();
  
  -- التحقق من أن المستخدم الحالي هو ولي أمر الطالب
  SELECT EXISTS (
    SELECT 1 FROM child_profiles
    WHERE student_user_id = target_student_id
    AND user_id = current_user_id
  ) INTO is_parent;

  -- السماح أيضاً للمشرفين
  IF NOT is_parent AND (SELECT role FROM profiles WHERE id = current_user_id) NOT IN ('super_admin', 'general_supervisor') THEN
    RAISE EXCEPTION 'Not authorized: You are not the parent of this student.';
  END IF;

  -- تحديث كلمة المرور
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_student_id;
END;
$$;

-- 4. إجبار السيرفر على قراءة التغييرات فوراً
NOTIFY pgrst, 'reload config';
`;

    const copySQL = () => {
        navigator.clipboard.writeText(repairSQL);
        addToast("تم نسخ الكود. توجه إلى Supabase Dashboard > SQL Editor لتنفيذه.", "success");
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                        <Server className="text-primary" /> تكوين وصيانة النظام
                    </h1>
                    <p className="text-muted-foreground mt-1">إدارة الاتصالات، المفاتيح، وإصلاح مشاكل قاعدة البيانات.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} icon={<RefreshCw size={16}/>}>استعادة الافتراضي</Button>
                    <Button onClick={handleSave} loading={updateSystemConfig.isPending} icon={<Save size={16}/>}>حفظ الإعدادات</Button>
                </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 flex-wrap h-auto">
                    <TabsTrigger value="repair" className="gap-2 text-red-600 data-[state=active]:text-red-700 font-bold"><Wrench size={16}/> أدوات الإصلاح (هام)</TabsTrigger>
                    <TabsTrigger value="supabase" className="gap-2"><Database size={16}/> Supabase</TabsTrigger>
                    <TabsTrigger value="cloudinary" className="gap-2"><ImageIcon size={16}/> Cloudinary</TabsTrigger>
                    <TabsTrigger value="storage" className="gap-2"><Server size={16}/> Storage</TabsTrigger>
                </TabsList>

                <TabsContent value="repair" className="space-y-6">
                    {/* Cache Clearing Section */}
                    <Card className="border-orange-200 shadow-md bg-orange-50/20">
                        <CardHeader className="bg-orange-100/30">
                            <CardTitle className="text-orange-800 flex items-center gap-2">
                                <Power size={20} /> إصلاح مشاكل العرض (Cache Reset)
                            </CardTitle>
                            <CardDescription className="text-orange-700/80">
                                استخدم هذا الزر إذا كانت الصور لا تظهر، أو البيانات قديمة، أو الموقع لا يعمل بشكل صحيح بعد التحديث.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                             <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">سيقوم هذا بحذف البيانات المؤقتة وإعادة تحميل الموقع بالكامل.</p>
                                <Button onClick={handleHardReset} variant="destructive" icon={<RefreshCw size={16}/>} className="bg-orange-600 hover:bg-orange-700 text-white">
                                    تنظيف الذاكرة وإعادة التحميل
                                </Button>
                             </div>
                        </CardContent>
                    </Card>

                     <Card className="border-red-200 shadow-md bg-red-50/10">
                        <CardHeader className="bg-red-100/50">
                            <CardTitle className="text-red-800 flex items-center gap-2">
                                <Terminal /> تحديث هيكل قاعدة البيانات (SQL)
                            </CardTitle>
                            <CardDescription className="text-red-900 font-medium">
                                هذا الكود يقوم بإنشاء الأعمدة الناقصة، تحديث سياسات الأمان، وإنشاء دالة تغيير كلمة المرور. ضروري جداً لتشغيل الميزات الجديدة.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-gray-900 rounded-lg text-green-400 font-mono text-xs overflow-x-auto dir-ltr whitespace-pre max-h-[400px]">
                                    {repairSQL}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button onClick={copySQL} icon={<Copy size={16}/>} className="w-full sm:w-auto" variant="default">
                                        نسخ كود SQL (اضغط هنا أولاً)
                                    </Button>
                                    <a 
                                        href="https://supabase.com/dashboard/project/_/sql" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
                                    >
                                        فتح Supabase SQL Editor <ExternalLinkIcon />
                                    </a>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-900 mt-2">
                                    <strong>طريقة التنفيذ:</strong>
                                    <ol className="list-decimal list-inside mt-2 space-y-1">
                                        <li>اضغط الزر <strong>"نسخ كود SQL"</strong>.</li>
                                        <li>اضغط الزر <strong>"فتح Supabase SQL Editor"</strong> (سيفتح في نافذة جديدة).</li>
                                        <li>الصق الكود في المحرر واضغط زر <strong>RUN</strong> الأخضر.</li>
                                        <li>بعد التنفيذ، ستعمل جميع الميزات (الصور، المحادثات، كلمات المرور) بشكل صحيح.</li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="supabase" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supabase Connection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Project URL" htmlFor="sb_url">
                                    <Input id="sb_url" value={config.supabase.projectUrl} onChange={e => handleChange('supabase', 'projectUrl', e.target.value)} className="font-mono" dir="ltr" />
                                </FormField>
                                <FormField label="Anon Public Key" htmlFor="sb_anon">
                                    <div className="relative">
                                        <Input 
                                            id="sb_anon" 
                                            value={config.supabase.anonKey} 
                                            onChange={e => handleChange('supabase', 'anonKey', e.target.value)} 
                                            className="font-mono pr-10" 
                                            type={showSecrets['anon'] ? 'text' : 'password'}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => toggleSecret('anon')} 
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showSecrets['anon'] ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cloudinary" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Cloudinary</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Cloud Name" htmlFor="cl_name">
                                    <Input id="cl_name" value={config.cloudinary.cloudName} onChange={e => handleChange('cloudinary', 'cloudName', e.target.value)} />
                                </FormField>
                                <FormField label="Upload Preset" htmlFor="cl_preset">
                                    <Input id="cl_preset" value={config.cloudinary.uploadPreset} onChange={e => handleChange('cloudinary', 'uploadPreset', e.target.value)} />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="storage" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Storage</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField label="Bucket Name" htmlFor="st_bucket">
                                <Input id="st_bucket" value={config.storage.bucketName} onChange={e => handleChange('storage', 'bucketName', e.target.value)} />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

export default AdminSystemSettingsPage;
