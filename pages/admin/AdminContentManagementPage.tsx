import React, { useState, useEffect } from 'react';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { pageConfigs, FieldConfig } from './content-editor/pageConfigs';
import { cn } from '../../lib/utils';

// Helper to get/set nested properties
const get = (obj: any, path: string) => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
const set = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || typeof current[keys[i]] !== 'object') {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
};

const AdminContentManagementPage: React.FC = () => {
    const { data: siteContent, isLoading: contentLoading } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();

    const [selectedPageKey, setSelectedPageKey] = useState(pageConfigs[0].key);
    const [formData, setFormData] = useState<Record<string, string | string[]>>({});
    
    const pageConfig = pageConfigs.find(p => p.key === selectedPageKey);

    useEffect(() => {
        if (siteContent) {
            const allFieldsData: Record<string, string | string[]> = {};
            pageConfigs.forEach(page => {
                page.sections.forEach(section => {
                    section.fields.forEach(field => {
                        allFieldsData[field.key] = get(siteContent, field.key) || '';
                    });
                });
            });
            setFormData(allFieldsData);
        }
    }, [siteContent]);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (siteContent) {
            let newContent = JSON.parse(JSON.stringify(siteContent));
            for (const key in formData) {
                // Handle features array specifically
                if (key.endsWith('.features') && typeof formData[key] === 'string') {
                    newContent = set(newContent, key, (formData[key] as string).split('\n').filter(f => f.trim()));
                } else {
                    newContent = set(newContent, key, formData[key]);
                }
            }
            await updateSiteContent.mutateAsync(newContent);
        }
    };

    if (contentLoading || Object.keys(formData).length === 0) return <PageLoader />;

    const renderField = (field: FieldConfig) => {
        const value = formData[field.key];
        if (field.type === 'textarea') {
            return (
                <Textarea id={field.key} value={Array.isArray(value) ? value.join('\n') : value} onChange={e => handleChange(field.key, e.target.value)} rows={field.rows || 3} />
            );
        }
        return <Input id={field.key} value={value as string} onChange={e => handleChange(field.key, e.target.value)} />;
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">مركز إدارة المحتوى</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1 sticky top-24">
                    <Card>
                        <CardHeader><CardTitle>اختر صفحة</CardTitle></CardHeader>
                        <CardContent className="p-2">
                            <ul className="space-y-1">
                                {pageConfigs.map(page => (
                                    <li key={page.key}>
                                        <button
                                            onClick={() => setSelectedPageKey(page.key)}
                                            className={cn(
                                                'w-full flex items-center gap-3 p-3 rounded-md text-right font-semibold transition-colors text-sm',
                                                selectedPageKey === page.key ? 'bg-muted text-primary border-r-4 border-primary' : 'text-foreground hover:bg-muted/50'
                                            )}
                                        >
                                            {page.icon} {page.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="md:col-span-3 space-y-6">
                    {pageConfig ? (
                        <>
                            {pageConfig.sections.map(section => (
                                <Card key={section.key}>
                                    <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {section.fields.map(field => (
                                            <FormField key={field.key} label={field.label} htmlFor={field.key}>
                                                {renderField(field)}
                                            </FormField>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                            <div className="flex justify-end sticky bottom-6 mt-8">
                                <Button onClick={handleSave} loading={updateSiteContent.isPending} size="lg" icon={<Save />}>
                                    {updateSiteContent.isPending ? 'جاري الحفظ...' : `حفظ تغييرات ${pageConfig.title}`}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <p>الرجاء اختيار صفحة من القائمة.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminContentManagementPage;
