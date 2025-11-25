
# مخطط قاعدة بيانات منصة الرحلة (Database Schema)

هذه الوثيقة تصف الهيكل المقترح لقاعدة البيانات (MySQL/PostgreSQL) اللازمة لتشغيل منصة الرحلة. تم تحديث هذا المخطط ليشمل أفضل الممارسات التي تم الاتفاق عليها.

---

### جدول 1: `users` (المستخدمون)

يخزن معلومات جميع حسابات المستخدمين، بما في ذلك أولياء الأمور والطلاب والمسؤولون.

| اسم العمود      | النوع                                                                                                                                              | ملاحظات                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `id`             | `CHAR(36)`                                                                                                                                         | **PK, UUID**.                                                           |
| `created_at`     | `TIMESTAMP`                                                                                                                                        | `DEFAULT CURRENT_TIMESTAMP`                                             |
| `updated_at`     | `TIMESTAMP`                                                                                                                                        | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`                 |
| `deleted_at`     | `TIMESTAMP`                                                                                                                                        | `NULLABLE`. لتفعيل الحذف الناعم (Soft Delete).                           |
| `last_sign_in_at`| `TIMESTAMP`                                                                                                                                        | `NULLABLE`                                                              |
| `name`           | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`                                                              |
| `email`          | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`, `UNIQUE`                                                    |
| `password`       | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`. يجب تخزينه مشفراً (Hashed).                                  |
| `role`           | `VARCHAR(255)`                                                                                                                                     | `NOT NULL`. يُفضل استخدام VARCHAR بدلاً من ENUM الأصلي.                   |
| `address`        | `TEXT`                                                                                                                                             | `NULLABLE`                                                              |
| `governorate`    | `VARCHAR(255)`                                                                                                                                     | `NULLABLE`                                                              |
| `phone`          | `VARCHAR(255)`                                                                                                                                     | `NULLABLE`                                                              |
| `version`        | `INT`                                                                                                                                              | `NOT NULL`, `DEFAULT 0`. لـ Optimistic Locking.                             |

---

### جدول 2: `child_profiles` (ملفات الأطفال)

يخزن الملفات الشخصية للأطفال المرتبطين بحسابات أولياء الأمور.

| اسم العمود        | النوع           | ملاحظات                                                                                   |
| ----------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `id`              | `CHAR(36)`       | **PK, UUID**.                                                                             |
| `created_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                                                               |
| `updated_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`                                   |
| `deleted_at`      | `TIMESTAMP`      | `NULLABLE`.                                                                               |
| `user_id`         | `CHAR(36)`       | `NOT NULL`, **FK** to `users(id)` `ON DELETE CASCADE`                                     |
| `name`            | `VARCHAR(255)`   | `NOT NULL`                                                                                |
| `birth_date`      | `DATE`           | `NOT NULL`                                                                                |
| `gender`          | `ENUM('أنثى', 'ذكر')` | `NOT NULL`                                                                                |
| `avatar_url`      | `VARCHAR(255)`   | `NULLABLE`                                                                                |
| `interests`       | `JSON`           | `NULLABLE`. e.g., `["الرسم", "الفضاء"]`                                                    |
| `strengths`       | `JSON`           | `NULLABLE`. e.g., `["مبدعة", "فضولية"]`                                                    |
| `student_user_id` | `CHAR(36)`       | `NULLABLE`, `UNIQUE`, **FK** to `users(id)` `ON DELETE SET NULL`. رابط حساب الطالب. |

---

### جدول 3: `orders` (طلبات "إنها لك")

| اسم العمود      | النوع           | ملاحظات                                                                    |
| ---------------- | ---------------- | -------------------------------------------------------------------------- |
| `id`             | `CHAR(36)`       | **PK, UUID**.                                                              |
| `order_date`     | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                                                |
| `updated_at`     | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`                    |
| `deleted_at`     | `TIMESTAMP`      | `NULLABLE`.                                                                |
| `version`        | `INT`            | `NOT NULL`, `DEFAULT 0`. لـ Optimistic Locking.                             |
| `user_id`        | `CHAR(36)`       | `NOT NULL`, **FK** to `users(id)`                                          |
| `child_id`       | `CHAR(36)`       | `NOT NULL`, **FK** to `child_profiles(id)`                                 |
| `item_summary`   | `VARCHAR(255)`   | `NOT NULL`.                                                                |
| `total`          | `DECIMAL(10, 2)` | `NOT NULL`                                                                 |
| `status`         | `VARCHAR(255)`   | `NOT NULL`. يُفضل VARCHAR.                                                  |
| `details`        | `JSON`           | `NOT NULL`.                                                                |
| `admin_comment`  | `TEXT`           | `NULLABLE`                                                                 |
| `receipt_url`    | `VARCHAR(255)`   | `NULLABLE`                                                                 |

---

### جدول 4: `subscriptions` (الاشتراكات)

| اسم العمود        | النوع           | ملاحظات                                                        |
| ----------------- | ---------------- | -------------------------------------------------------------- |
| `id`              | `CHAR(36)`       | **PK, UUID**.                                                  |
| `created_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                                    |
| `updated_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`        |
| `deleted_at`      | `TIMESTAMP`      | `NULLABLE`.                                                    |
| `user_id`         | `CHAR(36)`       | `NOT NULL`, **FK** to `users(id)`                              |
| `child_id`        | `CHAR(36)`       | `NOT NULL`, **FK** to `child_profiles(id)`                     |
| `plan_id`         | `CHAR(36)`       | `NOT NULL`, **FK** to `subscription_plans(id)`                 |
| `start_date`      | `DATE`           | `NOT NULL`                                                     |
| `next_renewal_date`| `DATE`          | `NOT NULL`                                                     |
| `status`          | `VARCHAR(255)`   | `NOT NULL`. يُفضل VARCHAR.                                      |

---

### جدول 5: `creative_writing_bookings` (حجوزات "بداية الرحلة")

| اسم العمود        | النوع           | ملاحظات                                                           |
| ----------------- | ---------------- | ----------------------------------------------------------------- |
| `id`              | `CHAR(36)`       | **PK, UUID**.                                                     |
| `created_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                                       |
| `updated_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`           |
| `deleted_at`      | `TIMESTAMP`      | `NULLABLE`.                                                       |
| `version`         | `INT`            | `NOT NULL`, `DEFAULT 0`.                                          |
| `user_id`         | `CHAR(36)`       | `NOT NULL`, **FK** to `users(id)`                                 |
| `child_id`        | `CHAR(36)`       | `NOT NULL`, **FK** to `child_profiles(id)`                        |
| `package_id`      | `CHAR(36)`       | `NOT NULL`, **FK** to `creative_writing_packages(id)`             |
| `instructor_id`   | `CHAR(36)`       | `NOT NULL`, **FK** to `instructors(id)`                           |
| `booking_date`    | `DATETIME`       | `NOT NULL`. تاريخ الجلسة الأولى.                                   |
| `total`           | `DECIMAL(10, 2)` | `NOT NULL`                                                        |
| `status`          | `VARCHAR(255)`   | `NOT NULL`. يُفضل VARCHAR.                                         |
| `progress_notes`  | `TEXT`           | `NULLABLE`.                                                       |
| `receipt_url`     | `VARCHAR(255)`   | `NULLABLE`                                                        |
| `session_id`      | `VARCHAR(255)`   | `NOT NULL`, `UNIQUE`.                                             |

---

### جدول 6: `service_orders` (طلبات الخدمات الإبداعية)

| اسم العمود             | النوع           | ملاحظات                                            |
| ---------------------- | ---------------- | -------------------------------------------------- |
| `id`                   | `CHAR(36)`       | **PK, UUID**.                                      |
| `created_at`           | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                        |
| `user_id`              | `CHAR(36)`       | `NOT NULL`, **FK** to `users(id)`                  |
| `child_id`             | `CHAR(36)`       | `NOT NULL`, **FK** to `child_profiles(id)`         |
| `service_id`           | `CHAR(36)`       | `NOT NULL`, **FK** to `standalone_services(id)`    |
| `assigned_instructor_id`| `CHAR(36)`       | `NULLABLE`, **FK** to `instructors(id)`            |
| `total`                | `DECIMAL(10, 2)` | `NOT NULL`                                         |
| `status`               | `VARCHAR(255)`   | `NOT NULL`. يُفضل VARCHAR.                          |
| `details`              | `JSON`           | `NULLABLE`. e.g., `{ "fileUrl": "...", "notes": "..." }` |

---

### جدول 7: `scheduled_sessions` (الجلسات المجدولة)

| اسم العمود        | النوع           | ملاحظات                                                                      |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| `id`              | `CHAR(36)`       | **PK, UUID**                                                                 |
| `booking_id`      | `CHAR(36)`       | `NULLABLE`, **FK** to `creative_writing_bookings(id)`                        |
| `subscription_id` | `CHAR(36)`       | `NULLABLE`, **FK** to `subscriptions(id)`                                    |
| `child_id`        | `CHAR(36)`       | `NOT NULL`, **FK** to `child_profiles(id)`                                   |
| `instructor_id`   | `CHAR(36)`       | `NOT NULL`, **FK** to `instructors(id)`                                      |
| `session_date`    | `DATETIME`       | `NOT NULL`                                                                   |
| `status`          | `VARCHAR(255)`   | `NOT NULL`, `DEFAULT 'upcoming'`. يُفضل VARCHAR.                             |
| `version`         | `INT`            | `NOT NULL`, `DEFAULT 0`.                                                     |
| **القيد (Constraint)** | - | `CHECK (booking_id IS NOT NULL OR subscription_id IS NOT NULL)`              |

---

### جدول 8: `instructors` (المدربون)

| اسم العمود             | النوع           | ملاحظات                                                                 |
| ---------------------- | ---------------- | ----------------------------------------------------------------------- |
| `id`                   | `CHAR(36)`       | **PK, UUID**.                                                           |
| `created_at`           | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`                                             |
| `updated_at`           | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`                 |
| `deleted_at`           | `TIMESTAMP`      | `NULLABLE`.                                                             |
| `version`              | `INT`            | `NOT NULL`, `DEFAULT 0`.                                                |
| `user_id`              | `CHAR(36)`       | `NULLABLE`, `UNIQUE`, **FK** to `users(id)`.                           |
| `name`                 | `VARCHAR(255)`   | `NOT NULL`                                                              |
| `specialty`            | `VARCHAR(255)`   | `NOT NULL`                                                              |
| `bio`                  | `TEXT`           | `NOT NULL`                                                              |
| `avatar_url`           | `VARCHAR(255)`   | `NULLABLE`                                                              |
| `slug`                 | `VARCHAR(255)`   | `NOT NULL`, `UNIQUE`.                                                   |
| `weekly_schedule`      | `JSON`           | `NULLABLE`.                                                             |
| `availability`         | `JSON`           | `NULLABLE`.                                                             |
| `rate_per_session`     | `DECIMAL(10, 2)` | `NOT NULL`.                                                             |
| `service_rates`        | `JSON`           | `NULLABLE`.                                                             |
| `package_rates`        | `JSON`           | `NULLABLE`.                                                             |
| `schedule_status`      | `VARCHAR(255)`   | `DEFAULT 'pending'`. يُفضل VARCHAR.                                      |
| `profile_update_status`| `VARCHAR(255)`   | `DEFAULT 'approved'`. يُفضل VARCHAR.                                     |
| `pending_profile_data` | `JSON`           | `NULLABLE`.                                                             |

---

### جداول البيانات الثابتة (Static-like Data)

*   **`personalized_products`**: `id` (UUID, PK), `key`, `title`, `description`, `features` (JSON), `sort_order`, `is_featured`, `is_addon`, ...
*   **`creative_writing_packages`**: `id` (UUID, PK), `name`, `sessions`, `price`, `features` (JSON), `popular`, `description`.
*   **`standalone_services`**: `id` (UUID, PK), `name`, `price`, `description`, `category` (VARCHAR), `icon_name`, `requires_file_upload`, `provider_type` (VARCHAR).
*   **`subscription_plans`**: `id` (UUID, PK), `name`, `duration_months`, `price`, `price_per_month`, `savings_text`, `is_best_value`.

---

### جداول أخرى

*   **`blog_posts`**: `id` (UUID, PK), `title`, `slug` (UNIQUE), `content`, `status`, `updated_at`, `deleted_at`.
*   **`support_tickets`**: `id` (PK), `name`, `email`, `subject`, `message`, `status` (VARCHAR).
*   **`join_requests`**: `id` (PK), `name`, `email`, `phone`, `role`, `message`, `status` (VARCHAR), `portfolio_url`.
*   **`badges`**: `id` (UUID, PK), `name`, `description`, `icon_name`.
*   **`child_badges`**: `id` (UUID, PK), `child_id` (FK), `badge_id` (FK), `earned_at`.
*   **`session_messages`**: `id` (UUID, PK), `booking_id` (FK), `sender_id` (FK), `message_text`.
*   **`session_attachments`**: `id` (UUID, PK), `booking_id` (FK), `uploader_id` (FK), `file_url`.

---

## ملاحظات التنفيذ للواجهة الخلفية (Backend Implementation Notes)

هذه الملاحظات موجهة لفريق الواجهة الخلفية لضمان أفضل الممارسات عند تطبيق هذا المخطط في بيئة Laravel & MySQL.

1.  **أنواع الحقول `ENUM`**:
    *   بينما يدعم Laravel الـ `ENUM`، قد يكون من الأفضل استخدام `VARCHAR` للحقول التي قد تتوسع خياراتها مستقبلاً (مثل `roles` أو `statuses`) لمرونة أكبر.
    *   **مثال عملي في Laravel Migration:**
        ```php
        // بدلاً من ENUM (محدود):
        $table->enum('role', ['user', 'student', ...]); // صعب التعديل لاحقاً

        // الأفضل - استخدام VARCHAR:
        $table->string('role'); // يمكن التحقق منه في validation rules
        ```

2.  **استراتيجية الفهارس (Index Strategy)**:
    *   **مهم جداً للأداء**: تأكد من إضافة فهارس لجميع حقول المفاتيح الخارجية (Foreign Keys) وأي حقول أخرى يتم الاستعلام عنها بشكل متكرر.
    *   استخدم `->index()` للفهارس العادية و `->unique()` للفهارس الفريدة.
    *   **مثال عملي في Laravel Migration:**
        ```php
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('child_id')->constrained('child_profiles')->onDelete('cascade');
            // ... other columns
            
            // Indexes
            $table->index('user_id');
            $table->index('child_id');
            $table->index('status');
        });
        ```

3.  **حقول `JSON`**:
    *   للحقول من نوع `JSON` (مثل `interests` أو `details`)، استخدم دالة Laravel المخصصة في الـ migrations: `$table->json('column_name')->nullable();`.

4.  **العلاقات متعددة الأشكال (Polymorphic Relations)**:
    *   للمستقبل، إذا كان هناك نموذج يمكن أن يرتبط بأكثر من نوع آخر من النماذج (على سبيل المثال، إذا كان من الممكن إضافة تعليقات على المقالات والمنتجات)، ففكر في استخدام `$table->morphs('commentable');` في Laravel لتسهيل الأمر.

5.  **أداء الاستعلامات**:
    *   عند بناء نقاط الـ API التي تجلب بيانات معقدة (خاصة لصفحات لوحة التحكم)، اعتمد بشكل كبير على **Eager Loading** باستخدام `with()` في Eloquent لمنع مشكلة "N+1 query".
    *   استخدم **Query Scopes** في نماذج Eloquent لإنشاء استعلامات قابلة لإعادة الاستخدام والحفاظ على نظافة الكود في الـ Controllers.
