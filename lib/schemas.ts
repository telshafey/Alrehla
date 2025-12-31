
import { z } from 'zod';
import { PersonalizedProduct } from './database.types';

// تعبير نمطي لأرقام الهواتف المصرية (يبدأ بـ 01 ويتبعه 9 أرقام)
const phoneRegex = /^01[0125][0-9]{8}$/;

// Base Schema parts
export const childDetailsSchema = z.object({
  childName: z.string().min(1, "اسم الطفل مطلوب"),
  childBirthDate: z.string().min(1, "تاريخ الميلاد مطلوب"),
  childGender: z.enum(['ذكر', 'أنثى'], { errorMap: () => ({ message: "الجنس مطلوب" }) }),
});

// Function to generate dynamic schema based on product configuration
export const createOrderSchema = (product: PersonalizedProduct | undefined) => {
  if (!product) return z.object({});

  // 1. Child Details (Always present)
  let schemaObject: any = {
    ...childDetailsSchema.shape,
    deliveryType: z.enum(['printed', 'electronic']),
    shippingOption: z.enum(['my_address', 'gift']),
    governorate: z.string().optional(),
    recipientName: z.string().optional(),
    recipientAddress: z.string().optional(),
    recipientPhone: z.string().optional(),
    recipientEmail: z.string().optional(),
    giftMessage: z.string().optional(),
    sendDigitalCard: z.boolean().optional(),
    storyValue: z.string().optional(),
    customGoal: z.string().optional(),
  };

  // 2. Dynamic Text Fields
  if (product.text_fields) {
    product.text_fields.forEach((field) => {
      if (field.required) {
        schemaObject[field.id] = z.string().min(1, `${field.label.replace('*', '')} مطلوب`);
      } else {
        schemaObject[field.id] = z.string().optional();
      }
    });
  }

  // 3. Goal Config Validation
  if (product.goal_config !== 'none') {
    schemaObject.storyValue = z.string().min(1, "الهدف من القصة مطلوب");
  }

  // 4. Image Slots
  if (product.image_slots) {
    product.image_slots.forEach((slot) => {
      if (slot.required) {
        schemaObject[slot.id] = z.any().refine((val) => val instanceof File || (typeof val === 'string' && val.length > 0), {
          message: `${slot.label} مطلوب`,
        });
      } else {
        schemaObject[slot.id] = z.any().optional();
      }
    });
  }

  // Build the base schema
  let baseSchema = z.object(schemaObject);

  // Add Refinements (Cross-field validation)
  return baseSchema.superRefine((data, ctx) => {
    // Custom Goal Validation
    if (product.goal_config === 'custom' || (product.goal_config === 'predefined_and_custom' && data.storyValue === 'custom')) {
      if (!data.customGoal || data.customGoal.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الرجاء كتابة الهدف المخصص",
          path: ["customGoal"],
        });
      }
    }

    // Shipping & Gift Validation (Strict Checks)
    if (data.deliveryType === 'printed' && data.shippingOption === 'gift') {
      if (!data.recipientName || data.recipientName.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اسم المستلم مطلوب", path: ["recipientName"] });
      }
      if (!data.recipientAddress || data.recipientAddress.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "عنوان المستلم مطلوب", path: ["recipientAddress"] });
      }
      
      // الهاتف: يجب أن يكون أرقاماً فقط ويتبع التنسيق
      if (!data.recipientPhone || !phoneRegex.test(data.recipientPhone)) {
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          message: "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)", 
          path: ["recipientPhone"] 
        });
      }

      // البريد الإلكتروني: يجب أن يكون صحيحاً إذا تم تفعيل البطاقة الرقمية أو إذا تم إدخاله
      if (data.sendDigitalCard) {
          if (!data.recipientEmail || data.recipientEmail.trim() === '') {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "البريد الإلكتروني مطلوب لإرسال البطاقة الرقمية", path: ["recipientEmail"] });
          } else if (!z.string().email().safeParse(data.recipientEmail).success) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "صيغة البريد الإلكتروني غير صحيحة", path: ["recipientEmail"] });
          }
      } else if (data.recipientEmail && data.recipientEmail.trim() !== '' && !z.string().email().safeParse(data.recipientEmail).success) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "صيغة البريد الإلكتروني غير صحيحة", path: ["recipientEmail"] });
      }
    }
  });
};

// Type inference
export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>;
