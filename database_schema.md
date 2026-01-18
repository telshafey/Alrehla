
# مخطط قاعدة بيانات منصة الرحلة (Database Schema)

هذه الوثيقة تصف الهيكل المقترح لقاعدة البيانات (MySQL/PostgreSQL) اللازمة لتشغيل منصة الرحلة.

... (Keep existing tables 1-8) ...

---

### جدول 9: `site_settings` (إعدادات النظام)

يستخدم لتخزين الإعدادات العامة بتنسيق Key-Value، مما يتيح مرونة عالية دون الحاجة لتعديل هيكل قاعدة البيانات لكل إعداد جديد.

| اسم العمود        | النوع           | ملاحظات                                                                 |
| ----------------- | ---------------- | ----------------------------------------------------------------------- |
| `key`             | `VARCHAR(255)`   | **PK**. اسم الإعداد (مثال: `branding`, `prices`, `global_content`).      |
| `value`           | `JSON`           | `NOT NULL`. قيمة الإعداد (كائن JSON كامل).                              |
| `updated_at`      | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`.                                            |

---

### جدول 10: `audit_logs` (سجل النشاطات)

لتتبع جميع الإجراءات الإدارية وتعديلات البيانات لأغراض الأمان والمراجعة.

| اسم العمود             | النوع           | ملاحظات                                                                 |
| ---------------------- | ---------------- | ----------------------------------------------------------------------- |
| `id`                   | `CHAR(36)`       | **PK, UUID**.                                                           |
| `user_id`              | `CHAR(36)`       | `NULLABLE`, **FK** to `users(id)`. المستخدم الذي قام بالإجراء.          |
| `action`               | `VARCHAR(255)`   | نوع الإجراء (مثال: `CREATE_USER`, `UPDATE_ORDER`).                      |
| `target_description`   | `VARCHAR(255)`   | وصف مختصر للهدف (مثال: `طلب #12345`).                                   |
| `details`              | `TEXT`           | تفاصيل إضافية.                                                          |
| `timestamp`            | `TIMESTAMP`      | `DEFAULT CURRENT_TIMESTAMP`.                                            |

---

### جدول 11: `instructor_payouts` (دفعات المدربين)

| اسم العمود        | النوع           | ملاحظات                                                                 |
| ----------------- | ---------------- | ----------------------------------------------------------------------- |
| `id`              | `CHAR(36)`       | **PK, UUID**.                                                           |
| `instructor_id`   | `CHAR(36)`       | `NOT NULL`, **FK** to `instructors(id)`.                                |
| `amount`          | `DECIMAL(10, 2)` | `NOT NULL`. المبلغ المدفوع.                                             |
| `payout_date`     | `DATE`           | `NOT NULL`.                                                             |
| `details`         | `TEXT`           | `NULLABLE`. ملاحظات الدفع.                                              |

---

### جداول البيانات الثابتة (Static-like Data)

*   **`personalized_products`**: `id` (UUID, PK), `key`, `title`, `description`, `features` (JSON), `sort_order`, `is_featured`, `is_addon`, ...
*   **`creative_writing_packages`**: `id` (UUID, PK), `name`, `sessions`, `price`, `features` (JSON), `popular`, `description`.
*   **`standalone_services`**: `id` (UUID, PK), `name`, `price`, `description`, `category` (VARCHAR), `icon_name`, `requires_file_upload`, `provider_type` (VARCHAR).
*   **`subscription_plans`**: `id` (UUID, PK), `name`, `duration_months`, `price`, `price_per_month`, `savings_text`, `is_best_value`.
*   **`comparison_items`**: `id` (VARCHAR, PK), `label`, `type`, `sort_order`.

---

### جداول أخرى

*   **`blog_posts`**: `id` (UUID, PK), `title`, `slug` (UNIQUE), `content`, `status`, `updated_at`, `deleted_at`.
*   **`support_tickets`**: `id` (PK), `name`, `email`, `subject`, `message`, `status` (VARCHAR).
*   **`join_requests`**: `id` (PK), `name`, `email`, `phone`, `role`, `message`, `status` (VARCHAR), `portfolio_url`.
*   **`badges`**: `id` (UUID, PK), `name`, `description`, `icon_name`.
*   **`child_badges`**: `id` (UUID, PK), `child_id` (FK), `badge_id` (FK), `earned_at`.
*   **`session_messages`**: `id` (UUID, PK), `booking_id` (FK), `sender_id` (FK), `message_text`.
*   **`session_attachments`**: `id` (UUID, PK), `booking_id` (FK), `uploader_id` (FK), `file_url`.
*   **`support_session_requests`**: `id` (UUID, PK), `instructor_id` (FK), `child_id` (FK), `reason`, `status`.

... (Implementation Notes kept same)
