import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { pageConfigs } from './content-editor/pageConfigs';
import { ArrowLeft } from 'lucide-react';

const AdminContentManagementPage: React.FC = () => {
    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">مركز إدارة المحتوى</h1>
            <p className="text-muted-foreground -mt-6">
                اختر الصفحة التي ترغب في تعديل محتواها الثابت.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageConfigs.map(page => (
                    <Card key={page.key} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                                    {page.icon}
                                </div>
                                <div>
                                    <CardTitle>{page.title}</CardTitle>
                                    <CardDescription>{page.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow" />
                        <div className="p-4 border-t">
                             <Button asChild className="w-full">
                                <Link to={`/admin/content/${page.key}`}>
                                    تعديل المحتوى
                                    <ArrowLeft size={16} className="mr-2" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminContentManagementPage;