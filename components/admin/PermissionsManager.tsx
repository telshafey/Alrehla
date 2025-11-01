import React, { useState, useEffect } from 'react';
import { useAdminRolePermissions } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useSettingsMutations } from '../../hooks/mutations/useSettingsMutations';
import { roleNames, permissionKeys, permissionLabels, UserRole, Permissions } from '../../lib/roles';
import PageLoader from '../ui/PageLoader';
import { Button } from '../ui/Button';
import { Save } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';

const PermissionsManager: React.FC = () => {
    const { data: initialPermissions, isLoading: permissionsLoading, error } = useAdminRolePermissions();
    const { updateRolePermissions } = useSettingsMutations();
    
    const [permissions, setPermissions] = useState<Record<UserRole, Permissions> | null>(null);

    useEffect(() => {
        if (initialPermissions) {
            setPermissions(initialPermissions as Record<UserRole, Permissions>);
        }
    }, [initialPermissions]);

    const handlePermissionChange = (role: UserRole, permission: keyof Permissions, isChecked: boolean) => {
        setPermissions(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [role]: {
                    ...prev[role],
                    [permission]: isChecked
                }
            };
        });
    };
    
    const handleSave = () => {
        if (permissions) {
            updateRolePermissions.mutate(permissions);
        }
    };

    if (permissionsLoading || !permissions) {
        return <PageLoader text="جاري تحميل صلاحيات الأدوار..." />;
    }
    
    if (error) {
        return <p className="text-destructive">{(error as Error).message}</p>;
    }

    const rolesToManage = (Object.keys(roleNames) as UserRole[]).filter(role => role !== 'user' && role !== 'student');
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>إدارة صلاحيات الأدوار</CardTitle>
                <CardDescription>
                    حدد الصلاحيات لكل دور في النظام. تذكر أن منح صلاحيات واسعة قد يؤثر على أمان المنصة.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background z-10 font-bold min-w-[150px]">الصلاحية</TableHead>
                                {rolesToManage.map(role => (
                                    <TableHead key={role} className="text-center font-semibold">{roleNames[role]}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white divide-y divide-gray-200">
                            {permissionKeys.map(permission => (
                                <TableRow key={permission}>
                                    <TableCell className="sticky left-0 bg-white font-medium text-gray-900 min-w-[150px]">{permissionLabels[permission]}</TableCell>
                                    {rolesToManage.map(role => (
                                        <TableCell key={`${role}-${permission}`} className="text-center">
                                            <Checkbox
                                                checked={!!permissions[role]?.[permission]}
                                                onCheckedChange={(isChecked) => handlePermissionChange(role, permission, !!isChecked)}
                                                disabled={role === 'super_admin'}
                                                aria-label={`صلاحية ${permissionLabels[permission]} لـ ${roleNames[role]}`}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSave} loading={updateRolePermissions.isPending} icon={<Save />}>
                        حفظ الصلاحيات
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground mt-4 text-center">ملاحظة: قد تحتاج الأدوار المتأثرة إلى تسجيل الخروج والدخول مرة أخرى لتطبيق التغييرات.</p>
            </CardContent>
        </Card>
    );
};

export default PermissionsManager;