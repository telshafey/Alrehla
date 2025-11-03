import React from 'react';
import { Home, Info, ShoppingBag, BookOpen } from 'lucide-react';

export type FieldType = 'input' | 'textarea';

export interface FieldConfig {
    key: string;
    label: string;
    type: FieldType;
    rows?: number;
}

export interface SectionConfig {
    key: string;
    title: string;
    fields: FieldConfig[];
}

export interface PageConfig {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    sections: SectionConfig[];
}

export const pageConfigs: PageConfig[] = [
    {
        key: 'portalPage',
        title: 'الصفحة الرئيسية',
        description: 'تحكم في المحتوى الرئيسي للمنصة.',
        icon: <Home />,
        sections: [
            {
                key: 'hero',
                title: 'قسم الهيرو (الافتتاحي)',
                fields: [
                    { key: 'portalPage.heroTitle', label: 'العنوان الرئيسي', type: 'textarea', rows: 2 },
                    { key: 'portalPage.heroSubtitle', label: 'النص التعريفي', type: 'textarea', rows: 3 },
                ]
            },
            {
                key: 'projects',
                title: 'قسم المشاريع',
                fields: [
                    { key: 'portalPage.projectsTitle', label: 'عنوان القسم', type: 'input' },
                    { key: 'portalPage.projectsSubtitle', label: 'النص التعريفي للقسم', type: 'textarea', rows: 2 },
                    { key: 'portalPage.enhaLakTitle', label: 'عنوان "إنها لك"', type: 'input' },
                    { key: 'portalPage.enhaLakDescription', label: 'وصف "إنها لك"', type: 'textarea', rows: 2 },
                    { key: 'portalPage.creativeWritingTitle', label: 'عنوان "بداية الرحلة"', type: 'input' },
                    { key: 'portalPage.creativeWritingDescription', label: 'وصف "بداية الرحلة"', type: 'textarea', rows: 2 },
                ]
            },
            {
                key: 'about',
                title: "قسم 'عنا'",
                fields: [
                    { key: 'portalPage.aboutSectionTitle', label: 'عنوان القسم', type: 'input' },
                    { key: 'portalPage.aboutSectionContent', label: 'محتوى القسم', type: 'textarea', rows: 3 },
                ]
            },
             {
                key: 'finalCta',
                title: "قسم الدعوة النهائية (CTA)",
                fields: [
                    { key: 'portalPage.finalCtaTitle', label: 'عنوان القسم', type: 'input' },
                    { key: 'portalPage.finalCtaSubtitle', label: 'النص التعريفي للقسم', type: 'textarea', rows: 2 },
                ]
            }
        ]
    },
    {
        key: 'aboutPage',
        title: 'صفحة "رحلتنا"',
        description: 'عدّل رسالة ورؤية وقصة المنصة.',
        icon: <Info />,
        sections: [
            {
                key: 'main',
                title: 'المحتوى الرئيسي',
                fields: [
                    { key: 'aboutPage.heroTitle', label: 'العنوان الرئيسي', type: 'input' },
                    { key: 'aboutPage.missionStatement', label: 'رسالتنا', type: 'textarea', rows: 3 },
                    { key: 'aboutPage.ourStory', label: 'قصتنا', type: 'textarea', rows: 4 },
                    { key: 'aboutPage.ourVision', label: 'رؤيتنا', type: 'textarea', rows: 3 },
                    { key: 'aboutPage.valuesTitle', label: 'عنوان قسم القيم', type: 'input' },
                ]
            },
            {
                key: 'team',
                title: 'فريق العمل (حتى 4 أعضاء)',
                fields: [
                    { key: 'aboutPage.teamMembers[0].name', label: 'اسم العضو 1', type: 'input' },
                    { key: 'aboutPage.teamMembers[0].role', label: 'دور العضو 1', type: 'input' },
                    { key: 'aboutPage.teamMembers[0].imageUrl', label: 'رابط صورة العضو 1', type: 'input' },
                    { key: 'aboutPage.teamMembers[1].name', label: 'اسم العضو 2', type: 'input' },
                    { key: 'aboutPage.teamMembers[1].role', label: 'دور العضو 2', type: 'input' },
                    { key: 'aboutPage.teamMembers[1].imageUrl', label: 'رابط صورة العضو 2', type: 'input' },
                    { key: 'aboutPage.teamMembers[2].name', label: 'اسم العضو 3', type: 'input' },
                    { key: 'aboutPage.teamMembers[2].role', label: 'دور العضو 3', type: 'input' },
                    { key: 'aboutPage.teamMembers[2].imageUrl', label: 'رابط صورة العضو 3', type: 'input' },
                    { key: 'aboutPage.teamMembers[3].name', label: 'اسم العضو 4', type: 'input' },
                    { key: 'aboutPage.teamMembers[3].role', label: 'دور العضو 4', type: 'input' },
                    { key: 'aboutPage.teamMembers[3].imageUrl', label: 'رابط صورة العضو 4', type: 'input' },
                ]
            }
        ]
    },
    {
        key: 'enhaLakPage',
        title: 'صفحات "إنها لك"',
        description: 'محتوى الصفحة الرئيسية للمشروع وصفحاته الفرعية.',
        icon: <ShoppingBag />,
        sections: [
            {
                key: 'main',
                title: 'الصفحة التعريفية للقسم',
                fields: [
                    { key: 'enhaLakPage.main.heroTitle', label: 'العنوان الرئيسي', type: 'input' },
                    { key: 'enhaLakPage.main.heroSubtitle', label: 'النص التعريفي', type: 'textarea', rows: 2 },
                    { key: 'enhaLakPage.main.productsTitle', label: 'عنوان "ماذا نصنع؟"', type: 'input' },
                    { key: 'enhaLakPage.main.howItWorksTitle', label: 'عنوان "كيف نعمل؟"', type: 'input' },
                    { key: 'enhaLakPage.main.testimonialsTitle', label: 'عنوان "آراء العائلات"', type: 'input' },
                    { key: 'enhaLakPage.main.customStoryImageUrl', label: 'رابط صورة القصة المخصصة', type: 'input' },
                    { key: 'enhaLakPage.main.subscriptionBoxImageUrl', label: 'رابط صورة صندوق الاشتراك', type: 'input' },
                ]
            },
            {
                key: 'store',
                title: 'صفحة متجر القصص',
                fields: [
                     { key: 'enhaLakPage.store.heroTitle', label: 'العنوان الرئيسي', type: 'input' },
                     { key: 'enhaLakPage.store.heroSubtitle', label: 'النص التعريفي', type: 'textarea', rows: 2 },
                     { key: 'enhaLakPage.store.subscriptionBannerTitle', label: 'عنوان بانر الاشتراك', type: 'input' },
                ]
            },
            {
                key: 'subscription',
                title: 'صفحة الاشتراك',
                fields: [
                     { key: 'enhaLakPage.subscription.heroTitle', label: 'العنوان الرئيسي', type: 'input' },
                     { key: 'enhaLakPage.subscription.heroSubtitle', label: 'النص التعريفي', type: 'textarea', rows: 2 },
                ]
            }
        ]
    },
    {
        key: 'creativeWritingPage',
        title: 'صفحات "بداية الرحلة"',
        description: 'محتوى الصفحة الرئيسية للبرنامج وصفحاته الفرعية.',
        icon: <BookOpen />,
        sections: [
             {
                key: 'main',
                title: 'الصفحة الرئيسية للبرنامج',
                fields: [
                    { key: 'creativeWritingPage.main.heroTitle', label: 'العنوان الرئيسي', type: 'input' },
                    { key: 'creativeWritingPage.main.heroSubtitle', label: 'النص التعريفي', type: 'textarea', rows: 2 },
                ]
            },
            {
                key: 'about',
                title: "صفحة 'فلسفة البرنامج'",
                fields: [
                    { key: 'creativeWritingPage.about.heroTitle', label: 'العنوان الرئيسي', type: 'input' },
                    { key: 'creativeWritingPage.about.heroSubtitle', label: 'النص التعريفي', type: 'textarea', rows: 2 },
                    { key: 'creativeWritingPage.about.heroImageUrl', label: 'رابط صورة الهيرو', type: 'input' },
                ]
            }
        ]
    }
];