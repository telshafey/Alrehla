import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldQuestion, ShoppingBag, BookOpen, CalendarCheck, UserCog, MessageSquare, UserPlus, ArrowLeft } from 'lucide-react';
import AdminSection from '../AdminSection';
import { Button } from '../../ui/Button';
import { formatDate } from '../../../utils/helpers';

const ActionItem: React.FC<{ title: string; subtitle?: string; to: string; state?: any; }> = ({ title, subtitle, to, state }) => (
    <div className="flex items-center justify-between p-3 bg-background hover:bg-muted/50 rounded-lg border">
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
            items: data.orders.filter((o: any) => o.status === 'بانتظار المراجعة'),
            render: (item: any) => `طلب #${item.id.substring(0,6)} لـ ${item.child_profiles?.name || 'طفل'}`,
            permission: permissions.canManageEnhaLakOrders,
            to: '/admin/orders',
            icon: <ShoppingBag className="text-pink-500" />
        },
        {
            title: 'طلبات خدمات جديدة للمراجعة',
            items: data.serviceOrders.filter((o: any) => o.status === 'بانتظار المراجعة'),
            render: (item: any) => `طلب خدمة لـ ${item.child_profiles?.name || 'طفل'}`,
            permission: permissions.canManageCreativeWritingBookings,
            to: '/admin/service-orders',
            icon: <BookOpen className="text-purple-500" />
        },
        {
            title: 'حجوزات بانتظار تأكيد الدفع',
            items: data.bookings.filter((b: any) => b.status === 'بانتظار الدفع'),
            render: (item: any) => `حجز ${item.package_name} لـ ${item.child_profiles?.name}`,
            permission: permissions.canManageCreativeWritingBookings,
            to: '/admin/creative-writing',
            state: { statusFilter: 'بانتظار الدفع' },
            icon: <CalendarCheck className="text-blue-500" />
        },
        {
            title: 'طلبات تعديل جداول المدربين',
            items: data.instructors.filter((i: any) => i.schedule_status === 'pending'),
            render: (item: any) => `طلب من ${item.name}`,
            permission: permissions.canManageInstructorUpdates,
            to: '/admin/instructors',
            icon: <UserCog className="text-teal-500" />
        },
        {
            title: 'رسائل دعم جديدة',
            items: data.supportTickets.filter((t: any) => t.status === 'جديدة'),
            render: (item: any) => `رسالة من ${item.name} حول "${item.subject}"`,
            permission: permissions.canManageSupportTickets,
            to: '/admin/support',
            icon: <MessageSquare className="text-cyan-500" />
        },
         {
            title: 'طلبات انضمام جديدة',
            items: data.joinRequests.filter((r: any) => r.status === 'جديد'),
            render: (item: any) => `طلب من ${item.name} للانضمام كـ ${item.role}`,
            permission: permissions.canManageJoinRequests,
            to: '/admin/join-requests',
            icon: <UserPlus className="text-indigo-500" />
        },
    ].filter(group => group.permission && group.items.length > 0);

    const totalActions = actionGroups.reduce((acc, group) => acc + group.items.length, 0);

    return (
        <AdminSection ref={ref} title="مركز المهام" icon={<ShieldQuestion className="text-destructive"/>} {...props}>
            {totalActions > 0 ? (
                <div className="space-y-6">
                    {actionGroups.map(group => (
                        <div key={group.title}>
                            <h3 className="font-bold text-md mb-2 flex items-center gap-2">
                                {group.icon}
                                {group.title}
                                <span className="text-xs bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">{group.items.length}</span>
                            </h3>
                            <div className="space-y-2">
                                {group.items.slice(0, 3).map((item: any) => (
                                    <ActionItem 
                                        key={item.id}
                                        title={group.render(item)}
                                        subtitle={formatDate(item.order_date || item.created_at || item.requested_at)}
                                        to={group.to}
                                        state={group.state}
                                    />
                                ))}
                                {group.items.length > 3 && (
                                    <div className="text-center">
                                         <Button as={Link} to={group.to} state={group.state} variant="link" size="sm">
                                            عرض كل الـ {group.items.length} طلبات
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-10">لا توجد مهام عاجلة في الوقت الحالي. عمل رائع!</p>
            )}
        </AdminSection>
    );
});
ActionCenterWidget.displayName = "ActionCenterWidget";

export default ActionCenterWidget;
