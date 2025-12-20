
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldQuestion, ShoppingBag, BookOpen, CalendarCheck, UserCog, MessageSquare, UserPlus, ArrowLeft, FileEdit, Clock, CheckCircle } from 'lucide-react';
import AdminSection from '../AdminSection';
import { Button } from '../../ui/Button';
import { formatDate } from '../../../utils/helpers';

const ActionItem: React.FC<{ title: string; subtitle?: string; border?: string; to: string; state?: any; }> = ({ title, subtitle, border, to, state }) => (
    <div className={`flex items-center justify-between p-3 bg-background hover:bg-muted/50 rounded-lg border-l-4 ${border || 'border-l-primary/30'} border-t border-b border-r`}>
        <div>
            <p className="font-semibold text-sm">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Button as={Link} to={to} state={state} variant="ghost" size="sm">
            <span className="hidden sm:inline">عرض</span>
            <ArrowLeft size={16} className="sm:mr-1" />
        </Button>
    </div>
);

const ActionCenterWidget = React.forwardRef<HTMLElement, { data: any; permissions: any } & React.HTMLAttributes<HTMLElement>>(
    ({ data, permissions, ...props }, ref) => {
    
    const actionGroups = [
        {
            title: 'طلبات جديدة بانتظار المراجعة',
            items: data.orders?.filter((o: any) => o.status === 'بانتظار المراجعة') || [],
            render: (item: any) => `طلب #${item.id.substring(0,6)} لـ ${item.child_profiles?.name || 'طفل'}`,
            permission: permissions.canManageEnhaLakOrders,
            to: '/admin/orders',
            icon: <ShoppingBag className="text-pink-500" />,
            border: 'border-l-pink-500'
        },
        {
            title: 'طلبات تحديث بيانات المدربين',
            items: data.instructors?.filter((i: any) => i.profile_update_status === 'pending') || [],
            render: (item: any) => `تحديث بيانات/أسعار: ${item.name}`,
            permission: permissions.canManageInstructorUpdates,
            to: '/admin/instructors',
            icon: <FileEdit className="text-orange-500" />,
            border: 'border-l-orange-500'
        },
        {
            title: 'طلبات تعديل جداول المدربين',
            items: data.instructors?.filter((i: any) => i.schedule_status === 'pending') || [],
            render: (item: any) => `تعديل جدول: ${item.name}`,
            permission: permissions.canManageInstructorUpdates,
            to: '/admin/instructors',
            icon: <Clock className="text-blue-500" />,
            border: 'border-l-blue-500'
        },
        {
            title: 'حجوزات بانتظار تأكيد الدفع',
            items: data.bookings?.filter((b: any) => b.status === 'بانتظار الدفع') || [],
            render: (item: any) => `حجز ${item.package_name} لـ ${item.child_profiles?.name}`,
            permission: permissions.canManageCreativeWritingBookings,
            to: '/admin/creative-writing',
            state: { statusFilter: 'بانتظار الدفع' },
            icon: <CalendarCheck className="text-purple-500" />,
            border: 'border-l-purple-500'
        },
        {
            title: 'رسائل دعم جديدة',
            items: data.supportTickets?.filter((t: any) => t.status === 'جديدة') || [],
            render: (item: any) => `رسالة من ${item.name}`,
            permission: permissions.canManageSupportTickets,
            to: '/admin/support',
            icon: <MessageSquare className="text-cyan-500" />,
            border: 'border-l-cyan-500'
        }
    ].filter(group => group.permission && group.items.length > 0);

    const totalActions = actionGroups.reduce((acc, group) => acc + group.items.length, 0);

    return (
        <AdminSection ref={ref} title="مركز المهام العاجلة" icon={<ShieldQuestion className="text-destructive"/>} {...props}>
            {totalActions > 0 ? (
                <div className="space-y-6">
                    {actionGroups.map(group => (
                        <div key={group.title}>
                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-700">
                                {group.icon}
                                {group.title}
                                <span className="text-[10px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full border">{group.items.length}</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {group.items.slice(0, 4).map((item: any) => (
                                    <ActionItem 
                                        key={item.id}
                                        title={group.render(item)}
                                        subtitle={formatDate(item.order_date || item.created_at || (item.pending_profile_data?.requested_at))}
                                        border={group.border}
                                        to={group.to}
                                        state={group.state}
                                    />
                                ))}
                            </div>
                            {group.items.length > 4 && (
                                <div className="mt-2 text-left">
                                     <Link to={group.to} state={group.state} className="text-xs font-bold text-primary hover:underline">
                                        + عرض {group.items.length - 4} طلبات إضافية
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4 opacity-20" />
                    <p className="text-muted-foreground">لا توجد مهام بانتظار المراجعة حالياً.</p>
                </div>
            )}
        </AdminSection>
    );
});
ActionCenterWidget.displayName = "ActionCenterWidget";

export default ActionCenterWidget;
