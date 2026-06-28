import React from 'react';
import { Link } from 'react-router-dom';
import AdminSection from '../AdminSection';
import { Button } from '../../ui/Button';
import { PlusCircle, Gift, Edit, UserPlus } from 'lucide-react';

const QuickActionsWidget = React.forwardRef<HTMLElement, { permissions: any } & React.HTMLAttributes<HTMLElement>>(
    ({ permissions, ...props }, ref) => {

    const actions = [
        {
            label: 'منتج جديد',
            to: '/admin/personalized-products/new',
            icon: <Gift size={18} />,
            permission: permissions.canManageEnhaLakProducts
        },
        {
            label: 'مقال جديد',
            to: '/admin/blog', // The modal is opened from here
            icon: <Edit size={18} />,
            permission: permissions.canManageBlog
        },
        {
            label: 'مستخدم جديد',
            to: '/admin/users', // The modal is opened from here
            icon: <UserPlus size={18} />,
            permission: permissions.canManageUsers
        }
    ].filter(action => action.permission);

    if (actions.length === 0) return null;

    return (
        <AdminSection ref={ref} title="إجراءات سريعة" icon={<PlusCircle />} {...props}>
            <div className="grid grid-cols-1 gap-3">
                {actions.map(action => (
                    <Button as={Link} to={action.to} key={action.to} variant="outline" className="justify-start">
                        {action.icon}
                        <span className="mr-2">{action.label}</span>
                    </Button>
                ))}
            </div>
        </AdminSection>
    );
});
QuickActionsWidget.displayName = "QuickActionsWidget";

export default QuickActionsWidget;
