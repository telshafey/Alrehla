
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { cloudinaryService } from '../../services/cloudinaryService';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Database, UploadCloud, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

const AdminMigrationPage: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isMigrating, setIsMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const addLog = (message: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
    };

    const urlToBlob = async (url: string) => {
        try {
            // Try standard fetch with CORS
            const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.blob();
        } catch (error) {
            console.warn(`Direct fetch failed for ${url}, trying alternative...`, error);
            // In a real browser environment without a proxy, we cannot fetch opaque resources (no-cors) and then read the blob.
            // This is a browser security limitation.
            // For now, we log the error. In production, you'd need a server-side proxy.
            return null;
        }
    };

    const processTable = async (tableName: string, column: string, folder: string, idColumn: string = 'id') => {
        addLog(`بدء فحص جدول: ${tableName}...`);
        
        // 1. Fetch records
        const { data: records, error } = await supabase
            .from(tableName)
            .select(`${idColumn}, ${column}`)
            .not(column, 'is', null);

        if (error) {
            addLog(`❌ خطأ في جلب بيانات ${tableName}: ${error.message}`);
            return 0;
        }

        // 2. Filter records that need migration (not already cloudinary)
        const toMigrate = records.filter((rec: any) => {
            const url = rec[column];
            return url && !url.includes('cloudinary.com') && url.startsWith('http');
        });

        addLog(`وجد ${toMigrate.length} سجل بحاجة للترحيل في ${tableName}.`);
        
        let successCount = 0;

        for (const record of toMigrate) {
            const oldUrl = record[column];
            addLog(`Processing ID ${record[idColumn]}...`);

            // Download
            const blob = await urlToBlob(oldUrl);
            if (!blob) {
                addLog(`⚠️ فشل تحميل الصورة (CORS/Network) للسجل ${record[idColumn]}. تخطي.`);
                continue;
            }

            // Convert to File
            const fileName = `${tableName}_${record[idColumn]}_migrated`;
            const file = new File([blob], fileName, { type: blob.type });

            try {
                // Upload to Cloudinary
                const newUrl = await cloudinaryService.uploadImage(file, folder);
                
                // Update Supabase
                const { error: updateError } = await supabase
                    .from(tableName)
                    .update({ [column]: newUrl })
                    .eq(idColumn, record[idColumn]);

                if (updateError) {
                    addLog(`❌ فشل تحديث قاعدة البيانات للسجل ${record[idColumn]}: ${updateError.message}`);
                } else {
                    addLog(`✅ تم الترحيل بنجاح: ${record[idColumn]}`);
                    successCount++;
                }
            } catch (err: any) {
                addLog(`❌ خطأ أثناء الرفع/التحديث: ${err.message}`);
            }
            
            // Artificial delay to prevent rate limiting
            await new Promise(r => setTimeout(r, 500));
            setProgress(prev => prev + 1);
        }

        return successCount;
    };

    const handleStartMigration = async () => {
        if (!window.confirm("هذه العملية قد تستغرق وقتاً طويلاً وتستهلك موارد الشبكة. هل أنت متأكد؟")) return;
        
        setIsMigrating(true);
        setLogs([]);
        setProgress(0);
        
        try {
            // Count total (Approximate)
            setTotalItems(100); // Dummy total for progress bar visual

            await processTable('child_profiles', 'avatar_url', 'alrehla_profiles');
            await processTable('instructors', 'avatar_url', 'alrehla_instructors');
            await processTable('instructors', 'intro_video_url', 'alrehla_instructors_videos'); 
            await processTable('personalized_products', 'image_url', 'alrehla_products');
            await processTable('blog_posts', 'image_url', 'alrehla_blog');
            
            addLog('🎉 اكتملت عملية الترحيل!');
        } catch (error: any) {
            addLog(`❌ خطأ غير متوقع: ${error.message}`);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">أداة ترحيل الصور</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Database /> نقل الصور إلى Cloudinary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                        <p className="font-bold mb-2">تنبيه هام:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>هذه الأداة ستقوم بفحص الجداول (الطلاب، المدربين، المنتجات، المدونة).</li>
                            <li>أي رابط صورة لا يتبع لـ Cloudinary سيتم تنزيل الصورة وإعادة رفعها إلى Cloudinary.</li>
                            <li>قد تفشل بعض الصور بسبب قيود الأمان (CORS) إذا لم يسمح الخادم المصدر بذلك.</li>
                            <li>يرجى عدم إغلاق هذه الصفحة حتى انتهاء العملية.</li>
                        </ul>
                    </div>

                    <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                            <UploadCloud className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="font-bold">الحالة: {isMigrating ? 'جاري العمل...' : 'جاهز'}</p>
                                <p className="text-xs text-muted-foreground">{logs.length} عمليات مسجلة</p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleStartMigration} 
                            disabled={isMigrating} 
                            loading={isMigrating}
                            icon={isMigrating ? <Loader2 className="animate-spin"/> : <Play />}
                        >
                            {isMigrating ? 'جاري الترحيل...' : 'بدء الترحيل'}
                        </Button>
                    </div>

                    {isMigrating && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((progress / (totalItems || 100)) * 100, 100)}%` }}></div>
                        </div>
                    )}

                    <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto" dir="ltr">
                        {logs.length === 0 ? (
                            <span className="text-gray-500">// السجلات ستظهر هنا...</span>
                        ) : (
                            logs.map((log, i) => <div key={i}>{log}</div>)
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminMigrationPage;
