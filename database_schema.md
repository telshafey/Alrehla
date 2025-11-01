# مخطط قاعدة بيانات منصة الرحلة (Database Schema)

هذه الوثيقة تصف الهيكل المقترح لقاعدة البيانات (MySQL/PostgreSQL) اللازمة لتشغيل منصة الرحلة. تم اشتقاق هذا المخطط من ملف `lib/database.types.ts`.

---

### جدول 1: `users` (المستخدمون)

يخزن معلومات جميع حسابات المستخدمين، بما في ذلك أولياء الأمور والطلاب والمسؤولون.

| اسم العمود      | النوع                                                                                                                                              | ملاحظات                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `id`             | `VARCHAR(255)`                                                                                                                                     | **Primary Key**. يُفضل أن يكون UUID.                                       |
| `created_at`     | `TIMESTAMP`                                                                                                                                        | `DEFAULT CURRENT_TIMESTAMP`                                             |
| `last_sign_in_at`| `TIMESTAMP`                                                                                                                                        | `NULLABLE`                                                              |
| `name`           | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`                                                              |
| `email`          | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`, `UNIQUE`                                                    |
| `password`       | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`. يجب تخزينه مشفراً (Hashed) باستخدام `bcrypt`.                  |
| `role`           | `ENUM('user', 'student', 'super_admin', 'general_supervisor', 'enha_lak_supervisor', 'creative_writing_supervisor', 'instructor', 'content_editor', 'support_agent')` | `NOT NULL`                                                              |
| `address`        | `TEXT`                                                                                                                                             | `NULLABLE`                                                              |
| `governorate`    | `VARCHAR(255)`                                                                                                                                     | `NULLABLE`                                                              |
| `phone`          | `VARCHAR(255)`                                                                                                                                     | `NULLABLE`                                                              |

---

### جدول 2: `child_profiles` (ملفات الأطفال)

يخزن الملفات الشخصية للأطفال المرتبطين بحسابات أولياء الأمور.

| اسم العمود        | النوع           | ملاحظات                                                                                   |
| ----------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `id`              | `INT`            | **Primary Key**, `AUTO_INCREMENT`                                                         |
| `created_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                                                               |
| `user_id`         | `VARCHAR(255)`   | `NOT NULL`, **Foreign Key** to `users(id)` `ON DELETE CASCADE`                            |
| `name`            | `VARCHAR(255)`   | `NOT NULL`                                                                                |
| `birth_date`      | `DATE`           | `NOT NULL`                                                                                |
| `gender`          | `ENUM('أنثى', 'ذكر')` | `NOT NULL`                                                                                |
| `avatar_url`      | `VARCHAR(255)`   | `NULLABLE`                                                                                |
| `interests`       | `JSON`           | `NULLABLE`. يخزن مصفوفة من السلاسل النصية, e.g., `["الرسم", "الفضاء"]`                     |
| `strengths`       | `JSON`           | `NULLABLE`. يخزن مصفوفة من السلاسل النصية, e.g., `["مبدعة", "فضولية"]`                     |
| `student_user_id` | `VARCHAR(255)`   | `NULLABLE`, `UNIQUE`, **Foreign Key** to `users(id)` `ON DELETE SET NULL`. هذا هو رابط حساب الطالب. |

---

### جدول 3: `orders` (طلبات "إنها لك")

يخزن طلبات المنتجات المخصصة (القصص، صناديق الهدايا، إلخ).

| اسم العمود      | النوع                                                                                                       | ملاحظات                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `id`             | `VARCHAR(255)`                                                                                               | **Primary Key**. يُفضل استخدام معرف فريد مثل `ord_...`                         |
| `order_date`     | `TIMESTAMP`                                                                                                  | `DEFAULT CURRENT_TIMESTAMP`                                                |
| `user_id`        | `VARCHAR(255)`                                                                                               | `NOT NULL`, **Foreign Key** to `users(id)`                                 |
| `child_id`       | `INT`                                                                                                        | `NOT NULL`, **Foreign Key** to `child_profiles(id)`                        |
| `item_summary`   | `VARCHAR(255)`                                                                                               | `NOT NULL`. ملخص للطلب, e.g., "قصة مخصصة لـ فاطمة"                            |
| `total`          | `DECIMAL(10, 2)`                                                                                             | `NOT NULL`                                                                 |
| `status`         | `ENUM('بانتظار الدفع', 'بانتظار المراجعة', 'قيد التجهيز', 'يحتاج مراجعة', 'تم الشحن', 'تم التسليم', 'ملغي', 'قيد التنفيذ', 'مكتمل')` | `NOT NULL`                                                                 |
| `details`        | `JSON`                                                                                                       | `NOT NULL`. يخزن جميع بيانات التخصيص التي أدخلها المستخدم.               |
| `admin_comment`  | `TEXT`                                                                                                       | `NULLABLE`                                                                 |
| `receipt_url`    | `VARCHAR(255)`                                                                                               | `NULLABLE`                                                                 |

---

### جدول 4: `creative_writing_bookings` (حجوزات "بداية الرحلة")

| اسم العمود        | النوع                                     | ملاحظات                                                                   |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `id`              | `VARCHAR(255)`                             | **Primary Key**. e.g., `bk_...`                                           |
| `created_at`      | `TIMESTAMP`                                | `DEFAULT CURRENT_TIMESTAMP`                                               |
| `user_id`         | `VARCHAR(255)`                             | `NOT NULL`, **Foreign Key** to `users(id)`                                |
| `child_id`        | `INT`                                      | `NOT NULL`, **Foreign Key** to `child_profiles(id)`                       |
| `package_name`    | `VARCHAR(255)`                             | `NOT NULL`                                                                |
| `instructor_id`   | `INT`                                      | `NOT NULL`, **Foreign Key** to `instructors(id)`                          |
| `booking_date`    | `DATETIME`                                 | `NOT NULL`. تاريخ ووقت الجلسة الأولى.                                     |
| `total`           | `DECIMAL(10, 2)`                           | `NOT NULL`                                                                |
| `status`          | `ENUM('بانتظار الدفع', 'مؤكد', 'مكتمل', 'ملغي')` | `NOT NULL`                                                                |
| `progress_notes`  | `TEXT`                                     | `NULLABLE`. ملاحظات المدرب على تقدم الطالب.                               |
| `receipt_url`     | `VARCHAR(255)`                             | `NULLABLE`                                                                |
| `session_id`      | `VARCHAR(255)`                             | `NOT NULL`, `UNIQUE`. معرف فريد لجلسة الفيديو.                             |

---

### جدول 5: `scheduled_sessions` (الجلسات المجدولة)

يخزن كل جلسة فردية ضمن حجز أو اشتراك.

| اسم العمود        | النوع                              | ملاحظات                                                                      |
| ----------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| `id`              | `VARCHAR(255)`                      | **Primary Key**                                                              |
| `booking_id`      | `VARCHAR(255)`                      | `NULLABLE`, **Foreign Key** to `creative_writing_bookings(id)`               |
| `subscription_id` | `VARCHAR(255)`                      | `NULLABLE`, **Foreign Key** to `subscriptions(id)`                           |
| `child_id`        | `INT`                               | `NOT NULL`, **Foreign Key** to `child_profiles(id)`                          |
| `instructor_id`   | `INT`                               | `NOT NULL`, **Foreign Key** to `instructors(id)`                             |
| `session_date`    | `DATETIME`                          | `NOT NULL`                                                                   |
| `status`          | `ENUM('upcoming', 'completed', 'missed')` | `NOT NULL`, `DEFAULT 'upcoming'`                                         |

---

### جداول البيانات الثابتة (Static-like Data)

هذه الجداول تخزن معلومات المنتجات والباقات التي يعرضها الموقع.

*   **`personalized_products`**:
    *   `id`, `key`, `title`, `description`, `image_url`, `features` (JSON), `sort_order`, `is_featured`, `is_addon`, `has_printed_version`, `price_printed`, `price_electronic`, `goal_config` (ENUM), `story_goals` (JSON), `image_slots` (JSON), `text_fields` (JSON).
*   **`creative_writing_packages`**:
    *   `id`, `name`, `sessions`, `price`, `features` (JSON), `popular`, `description`.
*   **`standalone_services`**:
    *   `id`, `name`, `price`, `description`, `category` (ENUM), `icon_name`, `requires_file_upload`, `provider_type` (ENUM).
*   **`subscription_plans`**:
    *   `id`, `name`, `duration_months`, `price`, `price_per_month`, `savings_text`, `is_best_value`.

---

### جدول 6: `instructors` (المدربون)

| اسم العمود        | النوع           | ملاحظات                                                                 |
| ----------------- | ---------------- | ----------------------------------------------------------------------- |
| `id`              | `INT`            | **Primary Key**, `AUTO_INCREMENT`                                       |
| `user_id`         | `VARCHAR(255)`   | `NULLABLE`, `UNIQUE`, **Foreign Key** to `users(id)`. رابط حساب المدرب. |
| `name`            | `VARCHAR(255)`   | `NOT NULL`                                                              |
| `specialty`       | `VARCHAR(255)`   | `NOT NULL`                                                              |
| `bio`             | `TEXT`           | `NOT NULL`                                                              |
| `avatar_url`      | `VARCHAR(255)`   | `NULLABLE`                                                              |
| `slug`            | `VARCHAR(255)`   | `NOT NULL`, `UNIQUE`. للمسار في URL.                                    |
| `weekly_schedule` | `JSON`           | `NULLABLE`. قالب المواعيد الأسبوعي.                                     |
| `availability`    | `JSON`           | `NULLABLE`. المواعيد المتاحة بشكل يدوي.                                  |
| `rate_per_session`| `DECIMAL(10, 2)` | `NOT NULL`. السعر الأساسي للمدرب.                                       |
| `service_rates`   | `JSON`           | `NULLABLE`. أسعار مخصصة للخدمات. `{ "service_id": price }`            |
| `package_rates`   | `JSON`           | `NULLABLE`. أسعار مخصصة للباقات. `{ "package_id": price }`             |
| `schedule_status` | `ENUM('approved', 'pending', 'rejected')` | `DEFAULT 'pending'`                                                     |
| `profile_update_status` | `ENUM('approved', 'pending', 'rejected')` | `DEFAULT 'approved'`                                                    |
| `pending_profile_data` | `JSON`      | `NULLABLE`. يخزن التحديثات المقترحة للموافقة.                              |

---

### جداول التواصل (Communication)

*   **`support_tickets`**:
    *   `id` (PK), `created_at`, `name`, `email`, `subject`, `message`, `status` (ENUM: 'جديدة', 'تمت المراجعة', 'مغلقة').
*   **`join_requests`**:
    *   `id` (PK), `created_at`, `name`, `email`, `phone`, `role`, `message`, `status` (ENUM: 'جديد', 'تمت المراجعة', 'مقبول', 'مرفوض'), `portfolio_url`.

---

### جداول الإعدادات (Settings)

*   **`social_links`**: `id`, `facebook_url`, `twitter_url`, `instagram_url`.
*   **`communication_settings`**: `id`, `support_email`, `join_us_email`, `whatsapp_number`, `whatsapp_default_message`.
*   **`pricing_settings`**: `id`, `company_percentage`, `fixed_fee`.
*   **`site_branding`**: `id`, `logoUrl`, `heroImageUrl`, إلخ.
*   **`site_content`**: `id`, `content_data` (JSON).

---

### جداول أخرى

*   **`blog_posts`**: `id`, `created_at`, `published_at`, `title`, `slug` (UNIQUE), `content`, `image_url`, `author_name`, `status` (ENUM: 'published', 'draft').
*   **`notifications`**: `id`, `user_id` (FK), `created_at`, `message`, `link`, `read`, `type`.
*   **`badges`**: `id`, `name`, `description`, `icon_name`.
*   **`child_badges`**: `id`, `child_id` (FK), `badge_id` (FK), `earned_at`.
*   **`session_messages`**: `id`, `booking_id` (FK), `sender_id` (FK to `users`), `sender_role`, `message_text`, `created_at`.
*   **`session_attachments`**: `id`, `booking_id` (FK), `uploader_id` (FK to `users`), `file_name`, `file_url`, `created_at`.
