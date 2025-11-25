
import React, { useState, useEffect, useCallback } from 'react';
import { useAdminSiteContent } from '../../hooks/queries/admin/useAdminContentQuery';
import { useContentMutations } from '../../hooks/mutations/useContentMutations';
import { useProduct } from '../../contexts/ProductContext';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { pageConfigs, FieldConfig } from './content-editor/pageConfigs';
import { cn } from '../../lib/utils';
import ImageUploadField from '../../components/admin/ui/ImageUploadField';
import Accordion from '../../components/ui/Accordion';
import { Checkbox } from '../../components/ui/Checkbox';

// Helper to get/set nested properties safely
const getNestedValue = (obj: any, path: string) => {
    if (!path || !obj) return undefined;
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const setNestedValue = (obj: any, path: string, value: any) => {
    if (!path) return obj;
    const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone
    const keys = path.split('.');
    let current = newObj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || current[keys[i]] === null) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return newObj;
};

const AdminContentManagementPage: React.FC = () => {
    const { data: siteContent, isLoading: contentLoading } = useAdminSiteContent();
    const { siteBranding, setSiteBranding, loading: brandingLoading } = useProduct();
    const { updateSiteContent } = useContentMutations();

    const [selectedPageKey, setSelectedPageKey] = useState(pageConfigs[0].key);
    const [combinedState, setCombinedState] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize local state by merging Content and Branding
    useEffect(() => {
        if (siteContent && siteBranding && !combinedState) {
            setCombinedState({
                ...siteContent,
                siteBranding: siteBranding // Inject branding into the state tree
            });
        }
    }, [siteContent, siteBranding, combinedState]);

    const pageConfig = pageConfigs.find(p => p.key === selectedPageKey);

    // --- Change Handlers ---

    const handleFieldChange = useCallback((path: string, value: any) => {
        setCombinedState((prev: any) => {
            const newState = setNestedValue(prev, path, value);
            return newState;
        });
        setHasChanges(true);
    }, []);

    // --- Renderers ---

    const renderInputField = (field: FieldConfig, value: any) => (
        <Input 
            id={field.key} 
            value={value || ''} 
            onChange={e => handleFieldChange(field.key, e.target.value)} 
            placeholder={field.placeholder}
        />
    );

    const renderTextareaField = (field: FieldConfig, value: any) => (
        <Textarea 
            id={field.key} 
            value={value || ''} 
            onChange={e => handleFieldChange(field.key, e.target.value)} 
            rows={field.rows || 3} 
            placeholder={field.placeholder}
        />
    );

    const renderImageField = (field: FieldConfig, value: any) => (
        <ImageUploadField 
            label={field.label}
            fieldKey={field.key}
            currentUrl={value}
            onUrlChange={(key, url) => handleFieldChange(key, url)}
        />
    );

    const renderArrayField = (field: FieldConfig, value: string[]) => {
        const items = Array.isArray(value) ? value : [];
        
        const handleItemChange = (index: number, newVal: string) => {
            const newItems = [...items];
            newItems[index] = newVal;
            handleFieldChange(field.key, newItems);
        };

        const handleAddItem = () => {
            handleFieldChange(field.key, [...items, '']);
        };

        const handleRemoveItem = (index: number) => {
            const newItems = items.filter((_, i) => i !== index);
            handleFieldChange(field.key, newItems);
        };

        return (
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                        <Input 
                            value={item} 
                            onChange={e => handleItemChange(idx, e.target.value)} 
                            placeholder={`عنصر ${idx + 1}`}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)} className="text-destructive">
                            <Trash2 size={18} />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} icon={<Plus size={16}/>}>
                    إضافة عنصر
                </Button>
            </div>
        );
    };

    const renderObjectArrayField = (field: FieldConfig, value: any[]) => {
        const items = Array.isArray(value) ? value : [];
        const schema = field.objectSchema || [];

        const handleAddItem = () => {
            // Create empty object based on schema
            const newItem: any = {};
            schema.forEach(subField => {
                newItem[subField.key] = '';
            });
            handleFieldChange(field.key, [...items, newItem]);
        };

        const handleRemoveItem = (index: number) => {
            const newItems = items.filter((_, i) => i !== index);
            handleFieldChange(field.key, newItems);
        };

        const handleSubFieldChange = (itemIndex: number, subKey: string, subVal: any) => {
            const newItems = [...items];
            newItems[itemIndex] = { ...newItems[itemIndex], [subKey]: subVal };
            handleFieldChange(field.key, newItems);
        };

        return (
            <div className="space-y-4">
                {items.map((item, index) => (
                    <Card key={index} className="bg-muted/30 border-dashed">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                                {field.itemLabel || 'عنصر'}
                            </CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)} className="text-destructive h-8">
                                <Trash2 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 grid gap-4">
                            {schema.map(subField => (
                                <div key={subField.key}>
                                    {subField.type === 'image' ? (
                                         <ImageUploadField 
                                            label={subField.label}
                                            fieldKey={`${field.key}[${index}].${subField.key}`} // Dummy key for UI tracking
                                            currentUrl={item[subField.key]}
                                            onUrlChange={(_, url) => handleSubFieldChange(index, subField.key, url)}
                                        />
                                    ) : (
                                        <FormField label={subField.label} htmlFor={`${field.key}-${index}-${subField.key}`}>
                                            {subField.type === 'textarea' ? (
                                                <Textarea 
                                                    value={item[subField.key] || ''} 
                                                    onChange={e => handleSubFieldChange(index, subField.key, e.target.value)} 
                                                    rows={subField.rows || 2}
                                                />
                                            ) : (
                                                <Input 
                                                    value={item[subField.key] || ''} 
                                                    onChange={e => handleSubFieldChange(index, subField.key, e.target.value)} 
                                                />
                                            )}
                                        </FormField>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem} icon={<Plus size={16}/>} className="w-full">
                    إضافة {field.itemLabel || 'عنصر جديد'}
                </Button>
            </div>
        );
    };

    const renderField = (field: FieldConfig) => {
        if (!combinedState) return null;
        const value = getNestedValue(combinedState, field.key);

        switch (field.type) {
            case 'textarea': return renderTextareaField(field, value);
            case 'image': return renderImageField(field, value);
            case 'array': return renderArrayField(field, value);
            case 'object_array': return renderObjectArrayField(field, value);
            default: return renderInputField(field, value);
        }
    };

    const handleSave = async () => {
        if (combinedState) {
            // Separate SiteContent and SiteBranding
            // 'siteBranding' key holds the branding object, everything else is content
            const { siteBranding: newBranding, ...newContent } = combinedState;
            
            const promises = [];
            
            // Save Content
            promises.push(updateSiteContent.mutateAsync(newContent));
            
            // Save Branding if it was modified and exists
            if (newBranding) {
                promises.push(setSiteBranding(newBranding));
            }

            await Promise.all(promises);
            setHasChanges(false);
        }
    };

    if (contentLoading || brandingLoading || !combinedState) return <PageLoader text="جاري تحميل المحتوى..." />;

    return (
        <div className="animate-fadeIn space-y-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">مركز إدارة المحتوى</h1>
                    <p className="text-muted-foreground mt-1">تحكم كامل في جميع نصوص وصور الموقع.</p>
                </div>
                <Button onClick={handleSave} loading={updateSiteContent.isPending} size="lg" icon={<Save />} disabled={!hasChanges}>
                    {updateSiteContent.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start flex-grow overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="md:col-span-3 lg:col-span-2 h-full overflow-y-auto pb-4">
                    <Card className="h-full">
                        <CardHeader><CardTitle className="text-lg">الصفحات</CardTitle></CardHeader>
                        <CardContent className="p-2">
                            <ul className="space-y-1">
                                {pageConfigs.map(page => (
                                    <li key={page.key}>
                                        <button
                                            onClick={() => setSelectedPageKey(page.key)}
                                            className={cn(
                                                'w-full flex items-center gap-3 p-3 rounded-md text-right font-semibold transition-all text-sm',
                                                selectedPageKey === page.key 
                                                    ? 'bg-primary text-primary-foreground shadow-md' 
                                                    : 'text-foreground hover:bg-muted'
                                            )}
                                        >
                                            {page.icon}
                                            <div className="flex flex-col">
                                                <span>{page.title}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Main Content Editor */}
                <div className="md:col-span-9 lg:col-span-10 h-full overflow-y-auto pb-20 px-1">
                    {pageConfig ? (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">{pageConfig.title}</h2>
                                <p className="text-muted-foreground">{pageConfig.description}</p>
                            </div>

                            {pageConfig.sections.map(section => {
                                const isVisible = section.visibilityKey ? getNestedValue(combinedState, section.visibilityKey) ?? true : true;
                                
                                return (
                                    <Card key={section.key} className={cn("border-t-4 transition-colors", isVisible ? "border-t-primary/20" : "border-t-muted bg-muted/20")}>
                                        <Accordion 
                                            title={
                                                <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                                                    <span>{section.title}</span>
                                                    {section.visibilityKey && (
                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                            <Checkbox 
                                                                checked={isVisible} 
                                                                onCheckedChange={(checked) => handleFieldChange(section.visibilityKey!, checked)} 
                                                                id={`visibility-${section.key}`}
                                                            />
                                                            <label htmlFor={`visibility-${section.key}`} className="text-xs font-normal text-muted-foreground cursor-pointer">
                                                                {isVisible ? 'معروض في الموقع' : 'مخفي'}
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        >
                                            <div className={cn("pt-4", !isVisible && "opacity-50 pointer-events-none")}>
                                                <CardContent className="space-y-6 pt-0">
                                                    {section.description && <p className="text-sm text-muted-foreground mb-4">{section.description}</p>}
                                                    
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {section.fields.map(field => (
                                                            <div key={field.key} className={field.type === 'object_array' ? 'col-span-full' : ''}>
                                                                {field.type !== 'image' && field.type !== 'object_array' && (
                                                                    <label htmlFor={field.key} className="block text-sm font-bold text-gray-700 mb-2">
                                                                        {field.label}
                                                                    </label>
                                                                )}
                                                                {renderField(field)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </Accordion>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p>الرجاء اختيار صفحة من القائمة للبدء في التعديل.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminContentManagementPage;
