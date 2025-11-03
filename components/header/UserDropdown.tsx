import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { LogOut } from 'lucide-react';

interface UserDropdownProps {
    currentUser: any;
    hasAdminAccess: boolean;
    onSignOut: () => void;
    onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ currentUser, hasAdminAccess, onSignOut, onClose }) => (
     <Card className="absolute top-full left-0 mt-2 w-56 animate-fadeIn z-50">
         <CardHeader className="p-4">
            <p className="text-sm font-semibold">مرحباً، {currentUser?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
        </CardHeader>
        <CardContent className="p-1">
            <Link to="/account" onClick={onClose} className="block w-full text-right px-3 py-2 text-sm rounded-md hover:bg-accent">حسابي</Link>
            {hasAdminAccess && <Link to="/admin" onClick={onClose} className="block w-full text-right px-3 py-2 text-sm rounded-md hover:bg-accent">لوحة التحكم</Link>}
        </CardContent>
        <CardFooter className="p-1 border-t">
                <button onClick={onClose} className="w-full">
                    <span onClick={onSignOut} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md">
                        <LogOut size={16} /> تسجيل الخروج
                    </span>
                </button>
        </CardFooter>
    </Card>
);

export default React.memo(UserDropdown);
