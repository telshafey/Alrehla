import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminPersonalizedProducts } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useProductMutations } from '../../hooks/mutations/useProductMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save, Plus, Trash2, Gift, Settings, Type, Image as ImageIcon, Star } from 'lucide-react';
import type { PersonalizedProduct } from '../../lib/database.types';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AdminProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';
    
    const { data: products = [], isLoading: productsLoading } = useAdminPersonalizedProducts();
    const { createPersonalizedProduct, updatePersonalizedProduct } = useProductMutations();
    const isSaving = createPersonalizedProduct.isPending || updatePersonalizedProduct.isPending;

    const [product, setProduct] = useState<Partial<PersonalizedProduct>>({
        title: '',
        key: '',
        description: '',
        features: [],
        sort_order: 99,
        is_featured: false,
        is_addon: false,
        has_printed_version: true,
        price_printed: 0,
        price_electronic: 0,
        image_slots: [],
        text_fields: [],
        goal_config: 'predefined_and_custom',
        story_goals: [],
    });

    useEffect(() => {
        if (!isNew && products.length > 0) {
            const productToEdit = products.find(p => p.id === parseInt(id!));
            if (productToEdit) {
                setProduct(productToEdit);
            } else {
                navigate('/admin/personalized-products');
            }
        }
    }, [id, isNew, products, navigate]);

    if (productsLoading && !isNew) return <PageLoader />;
    
    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        setProduct(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : value
        }));
    };
    
    const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProduct(prev => ({ ...prev, features: e.target.value.split('\n') }));
    };

    const handleDynamicListChange = (listName: 'image_slots' | 'text_fields' | 'story_goals', index: number, field: string, value: any) => {
        setProduct(prev => {
            const list = [...(prev[listName as keyof PersonalizedProduct] as any[] || [])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listName]: list };
        });
    };
    
    const addDynamicListItem = (listName: 'image_slots' | 'text_fields' | 'story_goals') => {
        let newItem: any;
        if (listName === 'image_slots') {
            newItem = { id: `img_${uuidv4()}`, label: '', required: false };
        } else if (listName === 'text_fields') {
             newItem = { id: `txt_${uuidv4()}`, label: '', placeholder: '', required: false, type: 'textarea' };
        } else if (listName === 'story_goals') {
             newItem = { key: `goal_${uuidv4()}`, title: '' };
        }
       
        setProduct(prev => ({ ...prev, [listName]: [...(prev[listName as keyof PersonalizedProduct] as any[] || []), newItem] }));
    };

    const removeDynamicListItem = (listName: 'image_slots' | 'text_fields' | 'story_goals', index: number) => {
        setProduct(prev => ({ ...prev, [listName]: (prev[listName as keyof PersonalizedProduct] as any[] || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...product,
            price_printed: product.has_printed_version ? Number(product.price_printed) : null,
            price_electronic: Number(product.price_electronic) || null
        };

        if (isNew) {
            await createPersonalizedProduct.mutateAsync(payload);
        } else {
            await updatePersonalizedProduct.mutateAsync(payload);
        }
        navigate('/admin/personalized-products');
    };

    return (
         <div className="animate-fadeIn space-y-8">
            <Link to="/admin/personalized-products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold mb-4">
                <ArrowLeft size={16} />
                العودة إلى قائمة المنتجات
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground">
                {isNew ? 'إضافة منتج جديد' : `تعديل: ${product.title}`}
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Gift /> المعلومات الأساسية</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                               <FormField label="اسم المنتج*" htmlFor="title">
                                    <Input id="title" name="title" value={product.title} onChange={handleSimpleChange} required />
                                </FormField>
                                <FormField label="الوصف" htmlFor="description">
                                    <Textarea id="description" name="description" value={product.description || ''} onChange={handleSimpleChange} rows={3} />
                                </FormField>
                                <FormField label="الميزات (كل ميزة في سطر)" htmlFor="features">
                                    <Textarea id="features" name="features" value={(product.features || []).join('\n')} onChange={handleFeaturesChange} rows={4} />
                                </FormField>
                            </CardContent>
                        </Card>
                        
                         <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Type /> حقول النصوص المخصصة</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {(product.text_fields || []).map((field, index) => (
                                    <div key={field.id || index} className="p-4 border rounded-lg bg-muted grid grid-cols-2 gap-4 items-end">
                                        <Input placeholder="المعرّف (ID)" value={field.id} onChange={(e) => handleDynamicListChange('text_fields', index, 'id', e.target.value)} disabled />
                                        <Input placeholder="العنوان الظاهر للعميل" value={field.label} onChange={(e) => handleDynamicListChange('text_fields', index, 'label', e.target.value)} />
                                        <div className="col-span-2">
                                           <Input placeholder="النص المؤقت (Placeholder)" value={field.placeholder} onChange={(e) => handleDynamicListChange('text_fields', index, 'placeholder', e.target.value)} />
                                        </div>
                                        <Select value={field.type} onChange={(e) => handleDynamicListChange('text_fields', index, 'type', e.target.value)}>
                                            <option value="textarea">مربع نص كبير</option>
                                            <option value="input">حقل نصي صغير</option>
                                        </Select>
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.required} onChange={(e) => handleDynamicListChange('text_fields', index, 'required', e.target.checked)} /> إلزامي</label>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeDynamicListItem('text_fields', index)}><Trash2 size={16}/></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => addDynamicListItem('text_fields')} icon={<Plus />}>إضافة حقل نصي</Button>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon /> حقول رفع الصور</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                 {(product.image_slots || []).map((slot, index) => (
                                    <div key={slot.id || index} className="p-4 border rounded-lg bg-muted grid grid-cols-2 gap-4 items-center">
                                         <Input placeholder="المعرّف (ID)" value={slot.id} onChange={(e) => handleDynamicListChange('image_slots', index, 'id', e.target.value)} disabled/>
                                         <Input placeholder="العنوان الظاهر للعميل" value={slot.label} onChange={(e) => handleDynamicListChange('image_slots', index, 'label', e.target.value)} />
                                         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={slot.required} onChange={(e) => handleDynamicListChange('image_slots', index, 'required', e.target.checked)} /> إلزامي</label>
                                         <Button type="button" variant="destructive" size="icon" onClick={() => removeDynamicListItem('image_slots', index)} className="justify-self-end"><Trash2 size={16}/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => addDynamicListItem('image_slots')} icon={<Plus />}>إضافة حقل صورة</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Star /> إدارة الأهداف المحددة مسبقاً</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {(product.story_goals || []).map((goal, index) => (
                                    <div key={goal.key || index} className="p-4 border rounded-lg bg-muted grid grid-cols-2 gap-4 items-center">
                                        <Input placeholder="المعرّف (key)" value={goal.key} onChange={(e) => handleDynamicListChange('story_goals', index, 'key', e.target.value)} />
                                        <Input placeholder="العنوان" value={goal.title} onChange={(e) => handleDynamicListChange('story_goals', index, 'title', e.target.value)} />
                                        <div className="col-span-2 flex justify-end">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeDynamicListItem('story_goals', index)}><Trash2 size={16}/></Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => addDynamicListItem('story_goals')} icon={<Plus />} disabled={product.goal_config !== 'predefined' && product.goal_config !== 'predefined_and_custom'}>
                                    إضافة هدف
                                </Button>
                                {(product.goal_config !== 'predefined' && product.goal_config !== 'predefined_and_custom') && (
                                    <p className="text-xs text-muted-foreground mt-2">يجب تفعيل خيار "قائمة محددة" في إعدادات الهدف من القصة لتتمكن من إضافة أهداف.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 sticky top-24">
                        <Card>
                             <CardHeader><CardTitle className="flex items-center gap-2"><Settings /> الإعدادات والتسعير</CardTitle></CardHeader>
                             <CardContent className="space-y-6">
                                <FormField label="المعرّف (Key)*" htmlFor="key">
                                    <Input id="key" name="key" value={product.key} onChange={handleSimpleChange} required disabled={!isNew} dir="ltr" />
                                </FormField>
                                <FormField label="ترتيب العرض" htmlFor="sort_order">
                                    <Input type="number" id="sort_order" name="sort_order" value={product.sort_order || ''} onChange={handleSimpleChange} />
                                </FormField>
                                <FormField label="السعر (إلكتروني)" htmlFor="price_electronic">
                                    <Input type="number" name="price_electronic" value={product.price_electronic || ''} onChange={handleSimpleChange} />
                                </FormField>
                                 <FormField label="السعر (مطبوع)" htmlFor="price_printed">
                                    <Input type="number" name="price_printed" value={product.price_printed || ''} onChange={handleSimpleChange} disabled={!product.has_printed_version} />
                                </FormField>
                                 <FormField label="إعدادات الهدف من القصة" htmlFor="goal_config">
                                    <Select id="goal_config" name="goal_config" value={product.goal_config} onChange={handleSimpleChange}>
                                        <option value="none">بدون هدف</option>
                                        <option value="predefined">قائمة محددة فقط</option>
                                        <option value="custom">هدف مخصص فقط</option>
                                        <option value="predefined_and_custom">قائمة وهدف مخصص</option>
                                    </Select>
                                </FormField>
                                <div className="space-y-2 pt-4 border-t">
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" checked={product.is_featured} onChange={handleSimpleChange}/> منتج مميز</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_addon" checked={product.is_addon} onChange={handleSimpleChange}/> إضافة إبداعية (Addon)</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="has_printed_version" checked={product.has_printed_version} onChange={handleSimpleChange}/> له نسخة مطبوعة</label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end sticky bottom-6 mt-8">
                    <Button type="submit" loading={isSaving} size="lg" icon={<Save />}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductDetailPage;