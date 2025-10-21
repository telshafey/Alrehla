import { UserRole } from "./database.types.ts";

// Re-export UserRole for consistency
export type { UserRole };

export const roleNames: { [key in UserRole]: string } = {
    user: 'مستخدم عادي',
    guardian: 'ولي أمر',
    super_admin: 'مدير عام',
    enha_lak_supervisor: 'مشرف "إنها لك"',
    creative_writing_supervisor: 'مشرف "بداية الرحلة"',
    instructor: 'مدرب',
    content_editor: 'محرر محتوى',
    support_agent: 'وكيل دعم',
    student: 'طالب'
};

export const staffRoles: UserRole[] = [
    'user',
    'guardian',
    'super_admin',
    'enha_lak_supervisor',
    'creative_writing_supervisor',
    'instructor',
    'content_editor',
    'support_agent',
    'student'
];

export const adminAccessRoles: UserRole[] = staffRoles.filter(r => r !== 'user' && r !== 'student' && r !== 'guardian');


// --- NEW: Permissions System ---

export interface Permissions {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canManageEnhaLakOrders: boolean;
    canManageEnhaLakSubscriptions: boolean;
    canManageEnhaLakProducts: boolean;
    canManagePrices: boolean;
    canManageShipping: boolean;
    canManageCreativeWritingBookings: boolean;
    canManageCreativeWritingInstructors: boolean;
    canManageContent: boolean;
    canManageBlog: boolean;
    canManageSupportTickets: boolean;
    canManageJoinRequests: boolean;
    // Dashboard specific permissions
    canViewDashboard: boolean;
    canViewEnhaLakStats: boolean;
    canViewCreativeWritingStats: boolean;
    canViewContentStats: boolean;
    canViewSupportStats: boolean;
    canViewGlobalStats: boolean;
}

const defaultPermissions: Permissions = {
    canManageUsers: false,
    canManageSettings: false,
    canManageEnhaLakOrders: false,
    canManageEnhaLakSubscriptions: false,
    canManageEnhaLakProducts: false,
    canManagePrices: false,
    canManageShipping: false,
    canManageCreativeWritingBookings: false,
    canManageCreativeWritingInstructors: false,
    canManageContent: false,
    canManageBlog: false,
    canManageSupportTickets: false,
    canManageJoinRequests: false,
    canViewDashboard: false,
    canViewEnhaLakStats: false,
    canViewCreativeWritingStats: false,
    canViewContentStats: false,
    canViewSupportStats: false,
    canViewGlobalStats: false,
};

export const ROLES_CONFIG: Record<UserRole, Partial<Permissions>> = {
    user: {},
    guardian: {},
    instructor: { canViewDashboard: true },
    student: {},
    support_agent: {
        canViewDashboard: true,
        canManageSupportTickets: true,
        canManageJoinRequests: true,
        canViewSupportStats: true,
    },
    content_editor: {
        canViewDashboard: true,
        canManageContent: true,
        canManageBlog: true,
        canViewContentStats: true,
    },
    creative_writing_supervisor: {
        canViewDashboard: true,
        canManageCreativeWritingBookings: true,
        canManageCreativeWritingInstructors: true,
        canViewCreativeWritingStats: true,
    },
    enha_lak_supervisor: {
        canViewDashboard: true,
        canManageEnhaLakOrders: true,
        canManageEnhaLakSubscriptions: true,
        canManageEnhaLakProducts: true,
        canManagePrices: true,
        canManageShipping: true,
        canViewEnhaLakStats: true,
    },
    super_admin: {
        canManageUsers: true,
        canManageSettings: true,
        canManageEnhaLakOrders: true,
        canManageEnhaLakSubscriptions: true,
        canManageEnhaLakProducts: true,
        canManagePrices: true,
        canManageShipping: true,
        canManageCreativeWritingBookings: true,
        canManageCreativeWritingInstructors: true,
        canManageContent: true,
        canManageBlog: true,
        canManageSupportTickets: true,
        canManageJoinRequests: true,
        canViewDashboard: true,
        canViewEnhaLakStats: true,
        canViewCreativeWritingStats: true,
        canViewContentStats: true,
        canViewSupportStats: true,
        canViewGlobalStats: true,
    },
};

export const getPermissions = (role: UserRole): Permissions => {
    return {
        ...defaultPermissions,
        ...(ROLES_CONFIG[role] || {}),
    };
};