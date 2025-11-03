import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { formatDate } from '../../utils/helpers';
import { ShoppingCart, Calendar, Info, Trash2 } from 'lucide-react';

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'order': return <ShoppingCart className="w-5 h-5 text-primary" />;
        case 'booking': return <Calendar className="w-5 h-5 text-purple-500" />;
        default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
};

interface NotificationDropdownProps {
    notifications: any[];
    onClose: () => void;
    onMarkAsRead: (id: number) => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose, onMarkAsRead, onDelete }) => (
    <Card className="absolute top-full left-0 mt-2 w-80 animate-fadeIn z-50">
        <CardHeader className="p-3 border-b">
            <h3 className="font-semibold text-sm">الإشعارات</h3>
        </CardHeader>
        <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length > 0 ? notifications.map((notif: any) => (
                <Link
                    key={notif.id}
                    to={notif.link}
                    state={notif.link === '/account' ? { defaultTab: 'myLibrary' } : undefined}
                    onClick={() => { onClose(); onMarkAsRead(notif.id); }}
                    className={`flex items-start gap-3 p-3 text-sm hover:bg-accent ${!notif.read ? 'bg-blue-50' : ''}`}
                >
                    <NotificationIcon type={notif.type} />
                    <div className="flex-grow">
                        <p className="text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => onDelete(e, notif.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                    </Button>
                </Link>
            )) : (
                <p className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات.</p>
            )}
        </CardContent>
        <CardFooter className="p-2 border-t">
            <Button as={Link} to="/account" state={{ defaultTab: 'notifications' }} onClick={onClose} variant="link" size="sm" className="w-full">
                عرض كل الإشعارات
            </Button>
        </CardFooter>
    </Card>
);

export default React.memo(NotificationDropdown);
