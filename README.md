# Alrehla (منصة الرحلة)

**منصة 'الرحلة': منظومة تربوية إبداعية متكاملة. اكتشف رحلة طفلك من بطل يكتشف ذاته في قصص 'إنها لك' المخصصة، إلى مبدع يصنع عوالمه الخاصة في برنامج 'بداية الرحلة' للكتابة.**

The "Alrehla" Platform is an integrated, creative educational system. It guides a child's journey from being the hero of their own personalized story ("It's for You" project) to becoming a creator of their own worlds through the "Start of the Journey" creative writing program.

This project is a comprehensive full-stack application built with a modern tech stack, featuring a complete user-facing e-commerce and educational platform, alongside a powerful, role-based admin and instructor dashboard. The backend is simulated using mock data files.

---

## ✨ Features

### 👤 User & Student Features

- **Dual Product Lines**:
    - **"إنها لك" (It's for You)**: Personalized storybooks and related products.
    - **"بداية الرحلة" (Start of the Journey)**: A creative writing program.
- **Deep Customization**: A multi-step ordering process for personalized stories, including child details, story goals, and image uploads.
- **Subscription Model**: Monthly subscription box for the "إنها لك" project.
- **Program Booking**: A guided flow for booking creative writing packages, including package comparison, instructor selection, and scheduling.
- **Authentication & Account Management**: Secure user/student login and registration. A comprehensive user dashboard to manage:
    - **My Library**: View all orders, subscriptions, and booked journeys.
    - **Family Center**: Manage child profiles and create linked student accounts.
    - **Settings**: Update profile and address information.
- **E-commerce Functionality**: Fully featured shopping cart and checkout process with mock payment receipt uploads.
- **Interactive Learning**:
    - **Student Portal**: A dedicated dashboard for students to view their creative writing journeys and upcoming sessions.
    - **Live Sessions**: Real-time video-conferencing for writing sessions, integrated with Jitsi Meet.
    - **Journey Workspace**: A collaborative space for students and instructors to chat, share files, and track progress for each training journey.
- **Content Pages**: Rich content pages including a Blog, About Us, Support (with FAQ and contact form), and Join Us.

### 🛡️ Admin & Instructor Features

- **Role-Based Access Control (RBAC)**: Granular permissions for various roles (Super Admin, Supervisors for each department, Content Editor, Support Agent, Instructor).
- **Comprehensive Admin Dashboard**:
    - A central hub with actionable insights, summary statistics, and a recent activity feed.
    - Specialized views for different supervisors.
- **Management Panels**:
    - **User Management**: View, create, edit, and delete users. Link student accounts to child profiles.
    - **E-commerce Management**: Manage personalized story orders, service orders, and subscriptions.
    - **Content Management (CMS)**: A full CMS to edit site-wide content (hero titles, descriptions) and manage a blog (create, edit, publish posts).
    - **Product & Settings Management**:
        - Configure personalized products, including dynamic text fields and image slots.
        - Manage creative writing packages, services, subscription plans, and shipping costs.
        - Update site branding (logos, images).
- **Instructor Portal**:
    - A dedicated dashboard for instructors to view their schedule, manage student journeys, track financials, and update their public profiles.
    - **Schedule Management**: Instructors can submit weekly availability for admin approval. Admins have a manual override for scheduling.
    - **Student Progress**: Instructors can write and save progress notes for each student's journey.
- **Approval Workflows**: System for admins to approve/reject instructor requests for schedule and profile changes.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Data Fetching & State Management**: Tanstack Query
- **Backend (Simulated)**: Mock data files (`/src/data/mockData.ts`) are used to simulate a Supabase backend, providing a realistic development experience without a live database.
- **Video Conferencing**: Jitsi Meet External API

---

## 🚀 Getting Started

This application is designed to run in a pre-configured web-based environment.

1.  All dependencies are managed via an `importmap`.
2.  The application uses mock data, so no database setup is required.

---

## 🔑 Demo Access

The platform supports multiple user roles for demonstration purposes. Use the "Quick Login" buttons on the login page or the credentials below.

**Password for all demo accounts:** `123456`

| Role                             | Email                     |
| -------------------------------- | ------------------------- |
| Parent / Regular User            | `parent@alrehlah.com`     |
| Student                          | `student@alrehlah.com`    |
| **--- Admin Roles ---**          |                           |
| System Administrator (Full Access) | `admin@alrehlah.com`      |
| General Supervisor               | `supervisor@alrehlah.com` |
| "It's for You" Supervisor      | `enhalak@alrehlah.com`    |
| "Creative Writing" Supervisor    | `cws@alrehlah.com`        |
| Instructor                       | `instructor@alrehlah.com` |
| Support Agent                    | `support@alrehlah.com`    |
| Content Editor                   | `editor@alrehlah.com`     |