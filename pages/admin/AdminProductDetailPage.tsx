
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAdminPersonalizedProducts } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useProductMutations } from '../../hooks/mutations/useProductMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save, Gift, Settings, Type, Image as ImageIcon, Star } from 'lucide-react';
import type { PersonalizedProduct } from '../../lib/database.types';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/Checkbox';
import ImageUploadField from '../../components/admin/ui/ImageUploadField';
import DynamicListManager from '../../components/admin/DynamicListManager';

const AdminProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';
    const productType = searchParams.get('type'); 
    
    const { data: allProducts = [], isLoading: productsLoading } = useAdminPersonalizedProducts();
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
        component_keys: [],
    });

    useEffect(() => {
        if (!isNew && allProducts.length > 0) {
            const productToEdit = allProducts.find(p => p.id === parseInt(id!));
            if (productToEdit) {
                setProduct(productToEdit);
            } else {
                navigate('/admin/personalized-products');
            }
        } else if (isNew) {
            // ... (Initial setup logic remains same)
             if (productType === 'subscription_box') {
                setProduct(prev => ({
                    ...prev,
                    title: 'صندوق الرحلة الشهري',
                    key: 'subscription_box',
                    description: 'اشتراك شهري متجدد يحتوي على قصة مخصصة وأنشطة وهدايا.',
                    features: ['قصة مخصصة جديدة كل شهر', 'أنشطة تفاعلية وألعاب', 'هدية إضافية مختارة بعناية'],
                    goal_config: 'none',
                    image_slots: [{ id: 'child_photo_1', label: 'صورة وجه الطفل (إلزامي)', required: true }],
                    text_fields: [{ id: 'childTraits', label: 'اخبرنا عن بطل القصة*', placeholder: 'مثال: شجاع، يحب الديناصورات...', required: true, type: 'textarea' }],
                    has_printed_version: true,
                    sort_order: -1,
                }));
            } else if (productType === 'emotion_story') {
                setProduct(prev => ({
                    ...prev,
                    title: 'القصة المميزة',
                    key: 'emotion_story',
                    description: 'قصة علاجية مخصصة لمساعدة طفلك على فهم مشاعره والتعبير عنها.',
                    features: ['تخصيص نفسى وسلوكي عميق', 'معالجة مشاعر محددة', 'بناء على مواقف واقعية'],
                    goal_config: 'predefined_and_custom',
                    is_featured: true,
                    story_goals: [
                        { key: 'anger', title: 'الغضب' },
                        { key: 'fear', title: 'الخوف' },
                    ],
                    image_slots: [{ id: 'child_photo_1', label: 'صورة وجه الطفل (إلزامي)', required: true }],
                    text_fields: [
                        { id: 'homeEnvironment', label: 'البيئة المنزلية', placeholder: 'أسماء الوالدين...', required: true, type: 'textarea' },
                    ]
                }));
            }
        }
    }, [id, isNew, allProducts, navigate, productType]);

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
    
    // Generic handler for all dynamic lists using the new component
    const handleDynamicListChange = (listKey: keyof PersonalizedProduct, index: number, field: string, value: any) => {
        setProduct(prev => {
            const list = [...(prev[listKey] as any[] || [])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listKey]: list };
        });
    };

    const handleAddItem = (listKey: keyof PersonalizedProduct) => {
        let newItem: any;
        if (listKey === 'image_slots') newItem = { id: `img_${uuidv4().slice(0,4)}`, label: '', required: false };
        else if (listKey === 'text_fields') newItem = { id: `txt_${uuidv4().slice(0,4)}`, label: '', placeholder: '', required: false, type: 'textarea' };
        else if (listKey === 'story_goals') newItem = { key: `goal_${uuidv4().slice(0,4)}`, title: '' };

        setProduct(prev => ({ ...prev, [listKey]: [...(prev[listKey] as any[] || []), newItem] }));
    };

    const handleRemoveItem = (listKey: keyof PersonalizedProduct, index: number) => {
        setProduct(prev => ({ ...prev, [listKey]: (prev[listKey] as any[] || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            ...product,
            price_printed: product.has_printed_version ? Number(product.price_printed) : null,
            price_electronic: Number(product.price_electronic) || null
        };

        // Ensure key is present if creating new
        if (isNew && !payload.key) {
             payload.key = `prod_${uuidv4().slice(0,8)}`;
        }

        if (isNew) await createPersonalizedProduct.mutateAsync(payload);
        else await updatePersonalizedProduct.mutateAsync(payload);
        navigate('/admin/personalized-products');
    };

    return (
         <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <Link to="/admin/personalized-products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                    <ArrowLeft size={16} /> العودة
                </Link>
                <h1 className="text-2xl font-bold text-foreground">
                    {isNew ? 'منتج جديد' : `تعديل: ${product.title}`}
                </h1>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                                <ImageUploadField 
                                    label="صورة المنتج" 
                                    fieldKey="image_url" 
                                    currentUrl={product.image_url || ''} 
                                    onUrlChange={(k, v) => setProduct(p => ({...p, [k]: v}))}
                                    recommendedSize="800x800px" 
                                />
                                <FormField label="الميزات (كل ميزة في سطر)" htmlFor="features">
                                    <Textarea id="features" value={(product.features || []).join('\n')} onChange={e => setProduct({...product, features: e.target.value.split('\n')})} rows={4} />
                                </FormField>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Type /> حقول النصوص المخصصة</CardTitle></CardHeader>
                        <CardContent>
                            <DynamicListManager 
                                items={product.text_fields || []}
                                onAdd={() => handleAddItem('text_fields')}
                                onRemove={(idx) => handleRemoveItem('text_fields', idx)}
                                onChange={(idx, key, val) => handleDynamicListChange('text_fields', idx, key, val)}
                                addButtonLabel="إضافة حقل نصي"
                                fields={[
                                    { key: 'id', placeholder: 'ID (txt_...)', disabled: productType === 'emotion_story' },
                                    { key: 'label', placeholder: 'العنوان الظاهر' },
                                    { key: 'placeholder', placeholder: 'النص التوضيحي', width: 'flex-[2]' },
                                    { key: 'type', placeholder: 'النوع', type: 'select', options: [{label: 'نص طويل', value: 'textarea'}, {label: 'نص قصير', value: 'input'}] },
                                    { key: 'required', placeholder: 'إلزامي؟', type: 'checkbox', width: 'w-24' },
                                ]}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon /> حقول رفع الصور</CardTitle></CardHeader>
                        <CardContent>
                             <DynamicListManager 
                                items={product.image_slots || []}
                                onAdd={() => handleAddItem('image_slots')}
                                onRemove={(idx) => handleRemoveItem('image_slots', idx)}
                                onChange={(idx, key, val) => handleDynamicListChange('image_slots', idx, key, val)}
                                addButtonLabel="إضافة حقل صورة"
                                fields={[
                                    { key: 'id', placeholder: 'ID (img_...)' },
                                    { key: 'label', placeholder: 'عنوان الحقل (مثال: صورة الطفل)' },
                                    { key: 'required', placeholder: 'إلزامي؟', type: 'checkbox', width: 'w-24' },
                                ]}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Star /> الأهداف التربوية</CardTitle></CardHeader>
                        <CardContent>
                             <DynamicListManager 
                                items={product.story_goals || []}
                                onAdd={() => handleAddItem('story_goals')}
                                onRemove={(idx) => handleRemoveItem('story_goals', idx)}
                                onChange={(idx, key, val) => handleDynamicListChange('story_goals', idx, key, val)}
                                addButtonLabel="إضافة هدف"
                                disableAdd={product.goal_config !== 'predefined' && product.goal_config !== 'predefined_and_custom'}
                                emptyMessage="يجب تفعيل 'قائمة محددة' أدناه لإضافة أهداف."
                                fields={[
                                    { key: 'key', placeholder: 'المعرف (key)' },
                                    { key: 'title', placeholder: 'عنوان الهدف (مثال: الصدق)' },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 sticky top-24 space-y-6">
                    <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Settings /> الإعدادات</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                            <FormField label="المعرّف (Key)*" htmlFor="key">
                                <Input id="key" name="key" value={product.key} onChange={handleSimpleChange} required disabled={!isNew} dir="ltr" />
                            </FormField>
                            <FormField label="ترتيب العرض" htmlFor="sort_order">
                                <Input type="number" id="sort_order" name="sort_order" value={product.sort_order || ''} onChange={handleSimpleChange} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="سعر (إلكتروني)" htmlFor="price_electronic">
                                    <Input type="number" name="price_electronic" value={product.price_electronic || ''} onChange={handleSimpleChange} />
                                </FormField>
                                <FormField label="سعر (مطبوع)" htmlFor="price_printed">
                                    <Input type="number" name="price_printed" value={product.price_printed || ''} onChange={handleSimpleChange} disabled={!product.has_printed_version} />
                                </FormField>
                            </div>
                                <FormField label="نوع الهدف" htmlFor="goal_config">
                                <Select id="goal_config" name="goal_config" value={product.goal_config} onChange={handleSimpleChange}>
                                    <option value="none">بدون هدف</option>
                                    <option value="predefined">قائمة محددة</option>
                                    <option value="custom">هدف مخصص</option>
                                    <option value="predefined_and_custom">قائمة + مخصص</option>
                                </Select>
                            </FormField>
                            <div className="space-y-3 pt-4 border-t">
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" checked={product.is_featured} onChange={handleSimpleChange}/> منتج مميز (الرئيسية)</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_addon" checked={product.is_addon} onChange={handleSimpleChange}/> إضافة إبداعية (Addon)</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="has_printed_version" checked={product.has_printed_version} onChange={handleSimpleChange}/> نسخة مطبوعة متاحة</label>
                            </div>
                            <Button type="submit" loading={isSaving} size="lg" icon={<Save />} className="w-full">
                                {isSaving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default AdminProductDetailPage;
