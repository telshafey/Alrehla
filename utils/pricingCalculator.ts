
import type { PricingSettings } from '../lib/database.types';

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
 * يحسب هامش ربح المنصة من عملية واحدة.
 */
export const calculatePlatformMargin = (customerPrice: number, instructorNet: number): number => {
    return Math.max(0, customerPrice - instructorNet);
};
