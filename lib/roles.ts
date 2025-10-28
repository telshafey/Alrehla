import type { UserRole } from './database.types';

export type { UserRole };

export const roleNames: { [key in UserRole]: string } = {
  user: 'مستخدم عادي',
  parent: 'ولي أمر',
  student: 'طالب',
  super_admin: 'مدير النظام',
  general_supervisor: 'مشرف عام',
  enha_lak_supervisor: 'مشرف إنها لك',
  creative_writing_supervisor: 'مشرف بداية الرحلة',
  instructor: 'مدرب',
  content_editor: 'محرر محتوى',
  support_agent: 'وكيل دعم',
};

export interface Permissions {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageEnhaLakOrders: boolean;
  canManageEnhaLakSubscriptions: boolean;
  canManageEnhaLakProducts: boolean;
  canManagePrices: boolean;
  canManageShipping: boolean;
  canManageCreativeWritingBookings: boolean;
  canManageCreativeWritingSettings: boolean;
  canManageCreativeWritingInstructors: boolean;
  canManageInstructorUpdates: boolean;
  canManageSupportRequests: boolean;
  canManageContent: boolean;
  canManageBlog: boolean;
  canManageSupportTickets: boolean;
  canManageJoinRequests: boolean;
  canManageSchedules: boolean;
  canViewGlobalStats: boolean;
  canViewEnhaLakStats: boolean;
  canViewCreativeWritingStats: boolean;
  canViewContentStats: boolean;
  canViewSupportStats: boolean;
}

const allPermissions: Permissions = {
  canViewDashboard: true,
  canManageUsers: true,
  canManageSettings: true,
  canManageEnhaLakOrders: true,
  canManageEnhaLakSubscriptions: true,
  canManageEnhaLakProducts: true,
  canManagePrices: true,
  canManageShipping: true,
  canManageCreativeWritingBookings: true,
  canManageCreativeWritingSettings: true,
  canManageCreativeWritingInstructors: true,
  canManageInstructorUpdates: true,
  canManageSupportRequests: true,
  canManageContent: true,
  canManageBlog: true,
  canManageSupportTickets: true,
  canManageJoinRequests: true,
  canManageSchedules: true,
  canViewGlobalStats: true,
  canViewEnhaLakStats: true,
  canViewCreativeWritingStats: true,
  canViewContentStats: true,
  canViewSupportStats: true,
};

const noPermissions: Permissions = Object.keys(allPermissions).reduce((acc, key) => {
  acc[key as keyof Permissions] = false;
  return acc;
}, {} as Permissions);

export const getPermissions = (role: UserRole): Permissions => {
  switch (role) {
    case 'super_admin':
      return { ...allPermissions };

    case 'general_supervisor':
      return {
        ...noPermissions,
        canViewDashboard: true,
        canViewGlobalStats: true,
        canViewEnhaLakStats: true,
        canViewCreativeWritingStats: true,
        canViewContentStats: true,
        canViewSupportStats: true,
        canManageUsers: true,
        canManageEnhaLakOrders: true,
        canManageCreativeWritingBookings: true,
      };

    case 'enha_lak_supervisor':
      return {
        ...noPermissions,
        canViewDashboard: true,
        canViewEnhaLakStats: true,
        canManageEnhaLakOrders: true,
        canManageEnhaLakSubscriptions: true,
        canManageEnhaLakProducts: true,
        canManagePrices: true,
        canManageShipping: true,
      };

    case 'creative_writing_supervisor':
      return {
        ...noPermissions,
        canViewDashboard: true,
        canViewCreativeWritingStats: true,
        canManageCreativeWritingBookings: true,
        canManageCreativeWritingSettings: true,
        canManageCreativeWritingInstructors: true,
        canManageInstructorUpdates: true,
        canManageSupportRequests: true,
        canManageSchedules: true,
      };

    case 'instructor':
      return {
        ...noPermissions,
        canViewDashboard: true,
      };

    case 'content_editor':
      return {
        ...noPermissions,
        canViewDashboard: true,
        canViewContentStats: true,
        canManageContent: true,
        canManageBlog: true,
      };

    case 'support_agent':
      return {
        ...noPermissions,
        canViewDashboard: true,
        canViewSupportStats: true,
        canManageSupportTickets: true,
        canManageJoinRequests: true,
      };

    default:
      return { ...noPermissions, canViewDashboard: false };
  }
};