
import type { PricingSettings, LibraryPricingSettings } from '../lib/database.types';

/**
 * يحسب السعر النهائي للعميل بناءً على صافي ربح المدرب وإعدادات المنصة.
 * المعادلة: (صافي المدرب * نسبة المنصة) + الرسوم الثابتة
 */
export const calculateCustomerPrice = (netPrice: number | undefined | null, config: PricingSettings | null | undefined): number => {
    if (netPrice === undefined || netPrice === null || isNaN(netPrice) || netPrice === 0) return 0;
    if (!config) return netPrice;
    
    // تأكد من أن الأرقام صحيحة لتجنب الكسور العشرية الغريبة
    const calculated = (netPrice * config.company_percentage) + config.fixed_fee;
    return Math.ceil(calculated);
};

/**
 * يحسب صافي ربح المدرب بناءً على السعر النهائي (عملية عكسية).
 * المعادلة: (سعر العميل - الرسوم الثابتة) / نسبة المنصة
 */
export const calculateInstructorNet = (customerPrice: number, config: PricingSettings): number => {
    if (!customerPrice || !config) return 0;
    const net = (customerPrice - config.fixed_fee) / config.company_percentage;
    return Math.max(0, Math.floor(net)); // ضمان عدم وجود قيم سالبة
};

/**
 * يحسب هامش ربح المنصة من عملية تدريبية واحدة.
 */
export const calculatePlatformMargin = (customerPrice: number, instructorNet: number): number => {
    return Math.max(0, customerPrice - instructorNet);
};

// --- Library Products Pricing ---

/**
 * يحسب السعر النهائي للعميل للمنتجات/الكتب بناءً على صافي ربح الناشر وإعدادات المكتبة.
 * المعادلة: (صافي الناشر * نسبة المنصة) + الرسوم الثابتة
 */
export const calculateLibraryProductPrice = (netPrice: number | undefined | null, config: LibraryPricingSettings | null | undefined): number => {
    if (netPrice === undefined || netPrice === null || isNaN(netPrice) || netPrice === 0) return 0;
    if (!config) return netPrice;
    
    const calculated = (netPrice * config.company_percentage) + config.fixed_fee;
    return Math.ceil(calculated);
};

/**
 * يحسب صافي ربح الناشر بناءً على السعر النهائي (عملية عكسية للعرض).
 * المعادلة: (سعر العميل - الرسوم الثابتة) / نسبة المنصة
 */
export const calculatePublisherNet = (customerPrice: number, config: LibraryPricingSettings | null | undefined): number => {
    if (!customerPrice || !config) return 0;
    const net = (customerPrice - config.fixed_fee) / config.company_percentage;
    return Math.max(0, Math.floor(net));
};

/**
 * يحسب هامش ربح المنصة من المنتجات (إنها لك/المكتبة).
 * (القديم كان نسبة ثابتة، الجديد ديناميكي)
 */
export const calculateProductMargin = (totalPrice: number, publisherNet: number = 0): number => {
    // If no publisher net provided (legacy or own product), assume 20% flat margin
    if (publisherNet === 0) return Math.floor(totalPrice * 0.20);
    return Math.max(0, totalPrice - publisherNet);
};

/**
 * يحسب تكلفة المنتج (تشغيل/طباعة) وهي المتبقي بعد خصم هامش المنصة (80%).
 * (للمنتجات القديمة)
 */
export const calculateProductCost = (totalPrice: number): number => {
    return Math.ceil(totalPrice * 0.80);
};
