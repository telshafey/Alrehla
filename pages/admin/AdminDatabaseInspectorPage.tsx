
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PageLoader from '../../components/ui/PageLoader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Database, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert, Bug } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface TableStatus {
    name: string;
    count: number | null;
    status: 'online' | 'error' | 'checking';
    rls_enabled?: boolean;
    error?: string;
}

const tableNames = [
    'profiles', 'child_profiles', 'instructors', 'orders', 'bookings', 
    'subscriptions', 'service_orders', 'scheduled_sessions', 'site_settings',
    'blog_posts', 'support_tickets', 'join_requests', 'audit_logs', 'notifications'
];

const AdminDatabaseInspectorPage: React.FC = () => {
    const { addToast } = useToast();
    const [results, setResults] = useState<TableStatus[]>(
        tableNames.map(name => ({ name, count: null, status: 'checking' }))
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);

    const runDiagnosis = async () => {
        setIsRefreshing(true);
        const newResults: TableStatus[] = [];

        for (const name of tableNames) {
            try {
                // محاولة جلب عدد السجلات (اختبار الوصول)
                const { count, error } = await supabase
                    .from(name)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    newResults.push({ 
                        name, 
                        count: null, 
                        status: 'error', 
                        error: error.message,
                        rls_enabled: true 
                    });
                } else {
                    newResults.push({ 
                        name, 
                        count: count || 0, 
                        status: 'online', 
                        rls_enabled: true 
                    });
                }
            } catch (err: any) {
                newResults.push({ name, count: null, status: 'error', error: err.message });
            }
        }
        setResults(newResults);
        setIsRefreshing(false);
        addToast('اكتمل فحص حالة الجداول والأمان', 'info');
    };

    const exploreTable = async (name: string) => {
        setSelectedTable(name);
        setIsLoadingTable(true);
        try {
            const { data, error } = await supabase.from(name).select('*').limit(5);
            if (error) throw error;
            setTableData(data || []);
        } catch (err: any) {
            addToast(`خطأ في الوصول للبيانات: ${err.message}`, 'error');
            setTableData([]);
        } finally {
            setIsLoadingTable(false);
        }
    };

    useEffect(() => { runDiagnosis(); }, []);

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3"><Database className="text-primary" /> مراقب القاعدة والأمان</h1>
                    <p className="text-sm text-muted-foreground italic">في حال ظهور اللون الأحمر، فهذا يعني وجود مشكلة في سياسات الـ RLS.</p>
                </div>
                <Button onClick={runDiagnosis} loading={isRefreshing} icon={<RefreshCw size={16}/>}>تحديث الفحص</Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <Card className="xl:col-span-1 max-h-[75vh] overflow-y-auto border-t-4 border-primary">
                    <CardHeader className="p-4 border-b bg-muted/20">
                        <CardTitle className="text-sm">حالة الجداول ({tableNames.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {results.map((table) => (
                            <button 
                                key={table.name} 
                                onClick={() => exploreTable(table.name)} 
                                className={`w-full text-right p-4 border-b hover:bg-muted/50 flex justify-between items-center transition-colors ${selectedTable === table.name ? 'bg-primary/5 border-r-4 border-r-primary' : ''}`}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-xs font-bold truncate">{table.name}</p>
                                        {table.status === 'error' ? (
                                            <ShieldAlert size={12} className="text-red-500 animate-pulse" />
                                        ) : (
                                            <ShieldCheck size={12} className="text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {table.status === 'online' ? `${table.count} سجل متاح` : 'خطأ في الوصول (Recursion?)'}
                                    </p>
                                </div>
                                {table.status === 'online' ? <CheckCircle size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <div className="xl:col-span-3 space-y-6">
                    {selectedTable ? (
                        <Card className="animate-fadeIn">
                            <CardHeader className="border-b bg-muted/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-mono text-primary">{selectedTable}</CardTitle>
                                        <CardDescription>معاينة عينة البيانات والتحقق من الأخطاء.</CardDescription>
                                    </div>
                                    {results.find(t => t.name === selectedTable)?.status === 'error' && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                                            <Bug size={14}/> Infinite Recursion Detected
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoadingTable ? <div className="p-20"><PageLoader /></div> : (
                                    tableData.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {Object.keys(tableData[0]).map(k => <TableHead key={k} className="text-[10px] font-mono">{k}</TableHead>)}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tableData.map((row, i) => (
                                                        <TableRow key={i}>
                                                            {Object.values(row).map((v, j) => (
                                                                <TableCell key={j} className="text-[10px] font-mono max-w-[150px] truncate">
                                                                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center space-y-4">
                                            <AlertTriangle className="mx-auto text-red-400" size={48} />
                                            <div className="max-w-md mx-auto">
                                                <p className="font-bold text-red-600">تعذر جلب البيانات لهذا الجدول</p>
                                                <p className="text-sm text-muted-foreground mt-2 bg-red-50 p-3 rounded border border-red-100 font-mono">
                                                    {results.find(t => t.name === selectedTable)?.error || 'الوصول مقيد بسياسات الأمان أو وجود تداخل برمي (Recursion).'}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/5">
                            <Database size={64} className="opacity-10 mb-4 text-primary"/>
                            <p className="font-semibold text-lg">اختر جدولاً لتحليل حالة أمانه</p>
                            <p className="text-sm">سيتم عرض أي أخطاء متعلقة بـ "Infinite Recursion" هنا بشكل مباشر.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDatabaseInspectorPage;
