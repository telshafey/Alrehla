
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';

const PrivacyPolicyPage: React.FC = () => {
  const { data, isLoading } = usePublicData();
  const privacy = data?.siteContent?.privacyPage;

  if (isLoading) return <PageLoader />;

  return (
    <div className="bg-muted/50 py-16 sm:py-20 animate-fadeIn">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-4xl sm:text-5xl font-extrabold text-primary">
                    {privacy?.title || "سياسة الخصوصية"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-lg max-w-none text-right leading-relaxed mx-auto whitespace-pre-wrap">
                    {privacy?.content || "جاري تحميل السياسة..."}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
