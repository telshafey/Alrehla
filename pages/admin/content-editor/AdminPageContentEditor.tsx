import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminSiteContent } from '../../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../../hooks/mutations/useContentMutations';
import PageLoader from '../../../components/ui/PageLoader';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import FormField from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { pageConfigs, FieldConfig } from './pageConfigs';

// Helper to get/set nested properties
const get = (obj: any, path: string) => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
const set = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
};


const AdminPageContentEditor: React.FC = () => {
    const { pageKey } = useParams<{ pageKey: string }>();
    const { data: siteContent, isLoading: contentLoading } = useAdminSiteContent();
    const { updateSiteContent } = useContentMutations();

    const [formData, setFormData] = useState<Record<string, string | string[]>>({});
    
    const pageConfig = pageConfigs.find(p => p.key === pageKey);

    useEffect(() => {
        if (siteContent && pageConfig) {
            const initialData: Record<string, string | string[]> = {};
            pageConfig.sections.forEach(section => {
                section.fields.forEach(field => {
                    initialData[field.key] = get(siteContent, field.key) || '';
                });
            });
            setFormData(initialData);
        }
    }, [siteContent, pageConfig]);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (siteContent) {
            let newContent = JSON.parse(JSON.stringify(siteContent));
            for (const key in formData) {
                newContent = set(newContent, key, formData[key]);
            }
            await updateSiteContent.mutateAsync(newContent);
        }
    };

    if (contentLoading || Object.keys(formData).length === 0) return <PageLoader />;
    if (!pageConfig) return <div>Page configuration not found.</div>;

    const renderField = (field: FieldConfig) => {
        const value = formData[field.key];

        if (field.type === 'textarea') {
            return (
                <Textarea
                    id={field.key}
                    value={Array.isArray(value) ? value.join('\n') : value}
                    onChange={e => handleChange(field.key, e.target.value)}
                    rows={field.rows || 3}
                />
            );
        }
        
        return (
            <Input
                id={field.key}
                value={value as string}
                onChange={e => handleChange(field.key, e.target.value)}
            />
        );
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <div>
                 <Link to="/admin/content-management" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold mb-4">
                    <ArrowLeft size={16} />
                    العودة إلى مركز المحتوى
                </Link>
                <h1 className="text-3xl font-extrabold text-foreground">تعديل محتوى: {pageConfig.title}</h1>
            </div>

            <div className="space-y-6">
                {pageConfig.sections.map(section => (
                    <Card key={section.key}>
                        <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {section.fields.map(field => (
                                <FormField key={field.key} label={field.label} htmlFor={field.key}>
                                    {renderField(field)}
                                </FormField>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

             <div className="flex justify-end sticky bottom-6 mt-8">
                <Button onClick={handleSave} loading={updateSiteContent.isPending} size="lg" icon={<Save />}>
                    {updateSiteContent.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </div>
        </div>
    );
};

export default AdminPageContentEditor;