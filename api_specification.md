# مواصفات الواجهة البرمجية لمنصة الرحلة (API Specification)

هذه الوثيقة تحدد "العقد" بين الواجهة الأمامية (Frontend - React) والواجهة الخلفية (Backend API). يجب على الواجهة الخلفية توفير نقاط الاتصال (Endpoints) التالية.

---

## 1. آلية المصادقة (Authentication)

*   **الآلية:** JWT (JSON Web Tokens) عبر Laravel Sanctum.
*   **التدفق:**
    1.  العميل يرسل `email` و `password` إلى `/api/auth/login`.
    2.  الخادم يتحقق من البيانات ويصدر `accessToken` (JWT) يحتوي على `userId` و `role`.
    3.  العميل يخزن الـ Token ويرسله في هيدر `Authorization` لكل طلب محمي (`Authorization: Bearer <token>`).
    4.  الخادم يستخدم Middleware للتحقق من الـ Token في كل طلب محمي.

---

## 2. هيكل الاستجابة الموحد (Standard Response Structure)

لضمان الاتساق وسهولة التعامل مع الـ API من جهة الواجهة الأمامية، يجب أن تتبع جميع الاستجابات الهيكل التالي:

**استجابة ناجحة (Success Response):**
```json
{
  "success": true,
  "data": { ... } // أو [ ... ]
}
```

**استجابة خطأ (Error Response):**
(على سبيل المثال، خطأ في التحقق من صحة البيانات)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password confirmation does not match."]
  }
}
```

---

## 3. نقاط الاتصال (Endpoints)

### 3.1. المصادقة (Auth)

*   **`POST /api/auth/register`**
    *   **الوصف:** إنشاء حساب مستخدم جديد.
    *   **الطلب (Body):** `{ "name": "...", "email": "...", "password": "..." }`
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "user": { ... }, "accessToken": "..." } }`
    *   **حماية:** عام (Public).

*   **`POST /api/auth/login`**
    *   **الوصف:** تسجيل دخول المستخدم.
    *   **الطلب (Body):** `{ "email": "...", "password": "..." }`
    *   **الاستجابة (Success 200):** `{ "success": true, "data": { "user": { ... }, "accessToken": "..." } }`
    *   **حماية:** عام (Public).

*   **`GET /api/auth/me`**
    *   **الوصف:** جلب بيانات المستخدم المسجل دخوله حاليًا.
    *   **الاستجابة (Success 200):** `{ "success": true, "data": { "user": { ... } } }`
    *   **حماية:** محمي (Protected).

---

### 3.2. البيانات العامة (Public Data)

*   **`GET /api/public/data`**
    *   **الوصف:** نقطة تجميع واحدة لجلب كل البيانات العامة التي يحتاجها الموقع عند التحميل الأولي لتقليل عدد الطلبات.
    *   **الاستجابة (Success 200):**
        ```json
        {
          "success": true,
          "data": {
            "instructors": [ ... ],
            "blogPosts": [ ... ],
            "personalizedProducts": [ ... ],
            "creativeWritingPackages": [ ... ],
            "standaloneServices": [ ... ],
            "siteContent": { ... },
            "socialLinks": { ... },
            "communicationSettings": { ... },
            "subscriptionPlans": [ ... ]
          }
        }
        ```
    *   **حماية:** عام (Public).

---

### 3.3. بيانات المستخدم (User Data)

*   **`GET /api/user/account-data`**
    *   **الوصف:** جلب جميع البيانات الخاصة بحساب المستخدم المسجل دخوله (الطلبات، الحجوزات، ملفات الأطفال، الإشعارات، إلخ).
    *   **الاستجابة (Success 200):**
        ```json
        {
          "success": true,
          "data": {
            "userOrders": [ ... ],
            "userSubscriptions": [ ... ],
            "userBookings": [ ... ],
            "childProfiles": [ ... ],
            "notifications": [ ... ]
          }
        }
        ```
    *   **حماية:** محمي (Protected).

*   **`PUT /api/user/profile`**
    *   **الوصف:** تحديث بيانات الملف الشخصي للمستخدم.
    *   **الطلب (Body):** `{ "name": "...", "address": "...", "governorate": "...", "phone": "..." }`
    *   **الاستجابة (Success 200):** `{ "success": true, "data": { "user": { ... } } }`
    *   **حماية:** محمي (Protected).

*   **`POST /api/user/child-profiles`**
    *   **الوصف:** إضافة ملف طفل جديد.
    *   **الطلب (Body):** `{ "name": "...", "birth_date": "...", "gender": "...", ... }` (مع `avatar_file` كـ `multipart/form-data` إذا تم رفع صورة).
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "childProfile": { ... } } }`
    *   **حماية:** محمي (Protected).

*   **`PUT /api/user/child-profiles/:id`**
    *   **الوصف:** تحديث ملف طفل موجود.
    *   **حماية:** محمي (Protected).

---

### 3.4. الطلبات والحجوزات (Orders & Bookings)

*   **`POST /api/orders`** (لـ "إنها لك" والخدمات)
    *   **الوصف:** إنشاء طلب جديد لقصة مخصصة أو خدمة.
    *   **الطلب (Body):** `multipart/form-data` يحتوي على حقل `payload` (JSON stringified) وصور القصة.
        *   `payload`: `{ "productKey": "...", "formData": { ... }, "selectedAddons": [...], "totalPrice": ..., ... }`
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "order": { ... } } }`
    *   **حماية:** محمي (Protected).

*   **`POST /api/subscriptions`**
    *   **الوصف:** إنشاء اشتراك جديد في صندوق الرحلة.
    *   **الطلب (Body):** `multipart/form-data` يحتوي على `payload` وصور الطفل.
        *   `payload`: `{ "plan": { ... }, "formData": { ... }, "total": ... }`
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "subscription": { ... } } }`
    *   **حماية:** محمي (Protected).

*   **`POST /api/bookings`** (لـ "بداية الرحلة")
    *   **الوصف:** إنشاء حجز جديد لجلسة/باقة كتابة إبداعية.
    *   **الطلب (Body):** `{ "payload": { "child": { ... }, "package": { ... }, "instructor": { ... }, "dateTime": { ... }, "total": ... } }`
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "booking": { ... } } }`
    *   **حماية:** محمي (Protected).

*   **`POST /api/items/:id/receipt`**
    *   **الوصف:** رفع إيصال دفع لطلب أو حجز أو اشتراك.
    *   **الطلب (Body):** `multipart/form-data` مع ملف الإيصال.
    *   **الاستجابة (Success 200):** `{ "success": true, "data": { "message": "Receipt uploaded successfully" } }`
    *   **حماية:** محمي (Protected).

---

### 3.5. التواصل (Communication)

*   **`POST /api/support-tickets`**
    *   **الوصف:** إرسال رسالة من نموذج "تواصل معنا".
    *   **الطلب (Body):** `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "message": "Ticket created" } }`
    *   **حماية:** عام (Public).

*   **`POST /api/join-requests`**
    *   **الوصف:** إرسال طلب من نموذج "انضم إلينا".
    *   **الطلب (Body):** `{ "name": "...", "email": "...", "phone": "...", "role": "...", "message": "...", "portfolio_url": "..." }`
    *   **الاستجابة (Success 201):** `{ "success": true, "data": { "message": "Request submitted" } }`
    *   **حماية:** عام (Public).

---

## 4. ملاحظات التنفيذ (Laravel Implementation Notes)

*   **المصادقة:** يوصى باستخدام **Laravel Sanctum** لتوفير مصادقة API خفيفة الوزن ومناسبة لتطبيقات SPA.
*   **التحكم:** العديد من نقاط الاتصال يمكن تنظيمها باستخدام **Resource Controllers** في Laravel لاتباع نمط RESTful.
*   **رفع الملفات:** تعامل Laravel مع طلبات `multipart/form-data` بسيط ومباشر.
*   **الصلاحيات:** يجب حماية جميع نقاط اتصال الإدارة (`/api/admin/*`) باستخدام `middleware('auth:sanctum')`. يوصى بشدة باستخدام **Policies & Gates** في Laravel لتطبيق صلاحيات دقيقة ومفصلة لكل إجراء.
*   **نقاط اتصال الإدارة (Admin API):** ستحتاج لوحة التحكم إلى مجموعة كاملة من نقاط الاتصال من نوع CRUD لإدارة جميع الموارد المذكورة في مخطط قاعدة البيانات، مثل:
    *   `GET, PUT /api/admin/users/:id`
    *   `GET, POST, PUT, DELETE /api/admin/personalized-products`
    *   `GET, PUT /api/admin/orders/:id/status`
    *   `GET, PUT /api/admin/settings/site-content`
    *   وغيرها الكثير...