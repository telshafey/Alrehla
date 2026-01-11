
import React, { useState, useEffect } from 'react';
import { Database, Image as ImageIcon, Server, Save, Eye, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdminSystemConfig } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { DEFAULT_CONFIG } from '../../lib/config';

const AdminSystemSettingsPage: React.FC = () => {
    const { data: configData, isLoading, refetch } = useAdminSystemConfig();
    const { updateSystemConfig } = useSettingsMutations();
    
    // Local state for form
    const [config, setConfig] = useState<typeof DEFAULT_CONFIG>(DEFAULT_CONFIG);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (configData) {
            setConfig(configData);
        }
    }, [configData]);

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
        if (window.confirm("تحذير: تغيير هذه الإعدادات قد يؤدي إلى توقف بعض خدمات الموقع. هل أنت متأكد؟")) {
            await updateSystemConfig.mutateAsync(config);
            refetch(); // Force UI refresh
        }
    };

    const handleReset = () => {
        if (window.confirm("هل تريد استعادة الإعدادات الافتراضية من ملف config.ts؟")) {
            setConfig(DEFAULT_CONFIG);
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل إعدادات النظام..." />;

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                        <Server className="text-primary" /> تكوين النظام (Credentials)
                    </h1>
                    <p className="text-muted-foreground mt-1">إدارة مفاتيح الربط والاتصال بالخدمات الخارجية.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} icon={<RefreshCw size={16}/>}>استعادة الافتراضي</Button>
                    <Button onClick={handleSave} loading={updateSystemConfig.isPending} icon={<Save size={16}/>}>حفظ التغييرات</Button>
                </div>
            </div>

            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-red-800">منطقة حساسة جداً</h3>
                        <p className="text-sm text-red-700">
                            هذه الصفحة تحتوي على مفاتيح الوصول لقاعدة البيانات وخدمات التخزين. 
                            يرجى عدم مشاركة هذه البيانات أو عرضها في مكان عام. 
                            تغيير هذه القيم سيؤثر فوراً على عمل الموقع.
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="supabase">
                <TabsList className="mb-6">
                    <TabsTrigger value="supabase" className="gap-2"><Database size={16}/> قاعدة البيانات (Supabase)</TabsTrigger>
                    <TabsTrigger value="cloudinary" className="gap-2"><ImageIcon size={16}/> الصور (Cloudinary)</TabsTrigger>
                    <TabsTrigger value="storage" className="gap-2"><Server size={16}/> الملفات (Storage)</TabsTrigger>
                </TabsList>

                <TabsContent value="supabase" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supabase Connection</CardTitle>
                            <CardDescription>إعدادات الاتصال بمشروع Supabase الأساسي.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField label="Project Name" htmlFor="sb_name">
                                <Input id="sb_name" value={config.supabase.projectName} onChange={e => handleChange('supabase', 'projectName', e.target.value)} />
                            </FormField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Project ID" htmlFor="sb_id">
                                    <Input id="sb_id" value={config.supabase.projectId} onChange={e => handleChange('supabase', 'projectId', e.target.value)} className="font-mono" />
                                </FormField>
                                <FormField label="Project URL" htmlFor="sb_url">
                                    <Input id="sb_url" value={config.supabase.projectUrl} onChange={e => handleChange('supabase', 'projectUrl', e.target.value)} className="font-mono" dir="ltr" />
                                </FormField>
                            </div>
                            
                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-bold mb-3 text-sm text-green-700">مفاتيح الوصول (API Keys)</h4>
                                <FormField label="Anon Public Key (للاستخدام العام)" htmlFor="sb_anon">
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
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showSecrets['anon'] ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                </FormField>

                                <FormField label="Service Role Key (سري للغاية - للإدارة فقط)" htmlFor="sb_service">
                                    <div className="relative">
                                        <Input 
                                            id="sb_service" 
                                            value={config.supabase.serviceRoleKey} 
                                            onChange={e => handleChange('supabase', 'serviceRoleKey', e.target.value)} 
                                            className="font-mono pr-10 border-red-200 bg-red-50/30" 
                                            type={showSecrets['service'] ? 'text' : 'password'}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => toggleSecret('service')} 
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                                        >
                                            {showSecrets['service'] ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                    <p className="text-xs text-red-600 mt-1 font-semibold">تنبيه: هذا المفتاح يمنح صلاحيات كاملة لتجاوز جميع سياسات الأمان (RLS).</p>
                                </FormField>
                                
                                <FormField label="Database Password (للحفظ فقط)" htmlFor="sb_pass">
                                     <div className="relative">
                                        <Input 
                                            id="sb_pass" 
                                            value={config.supabase.databasePassword} 
                                            onChange={e => handleChange('supabase', 'databasePassword', e.target.value)} 
                                            className="font-mono pr-10" 
                                            type={showSecrets['dbpass'] ? 'text' : 'password'}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => toggleSecret('dbpass')} 
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showSecrets['dbpass'] ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cloudinary" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cloudinary Integration</CardTitle>
                            <CardDescription>إعدادات خدمة استضافة الصور والوسائط.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Cloud Name" htmlFor="cl_name">
                                    <Input id="cl_name" value={config.cloudinary.cloudName} onChange={e => handleChange('cloudinary', 'cloudName', e.target.value)} />
                                </FormField>
                                <FormField label="Upload Preset Name" htmlFor="cl_preset">
                                    <Input id="cl_preset" value={config.cloudinary.uploadPreset} onChange={e => handleChange('cloudinary', 'uploadPreset', e.target.value)} />
                                </FormField>
                            </div>
                            
                            <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold mb-3 text-sm text-gray-700">بيانات API (للاستخدام المستقبلي/الخلفي)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="API Key" htmlFor="cl_key">
                                        <Input id="cl_key" value={config.cloudinary.apiKey} onChange={e => handleChange('cloudinary', 'apiKey', e.target.value)} className="font-mono"/>
                                    </FormField>
                                    <FormField label="API Secret" htmlFor="cl_secret">
                                        <div className="relative">
                                            <Input 
                                                id="cl_secret" 
                                                value={config.cloudinary.apiSecret} 
                                                onChange={e => handleChange('cloudinary', 'apiSecret', e.target.value)} 
                                                className="font-mono pr-10" 
                                                type={showSecrets['cl_secret'] ? 'text' : 'password'}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => toggleSecret('cl_secret')} 
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showSecrets['cl_secret'] ? <EyeOff size={16}/> : <Eye size={16}/>}
                                            </button>
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="storage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>File Storage (Buckets)</CardTitle>
                            <CardDescription>إعدادات سلال تخزين الملفات داخل Supabase.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField label="Receipts Bucket Name" htmlFor="st_bucket">
                                <Input id="st_bucket" value={config.storage.bucketName} onChange={e => handleChange('storage', 'bucketName', e.target.value)} />
                                <p className="text-xs text-muted-foreground mt-1">اسم السلة المخصصة لرفع إيصالات الدفع والملفات المرفقة.</p>
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminSystemSettingsPage;
