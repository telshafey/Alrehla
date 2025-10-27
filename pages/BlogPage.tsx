
import React from 'react';
import { usePublicData } from '../hooks/publicQueries';
import PostCard from '../components/shared/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import ShareButtons from '../components/shared/ShareButtons';

const BlogPage: React.FC = () => {
    const { data, isLoading, error } = usePublicData();
    const blogPosts = data?.blogPosts || [];
    const pageUrl = window.location.href;

    if (error) return <div className="text-center text-red-500 py-12">{error.message}</div>;

    const publishedPosts = blogPosts.filter(p => p.status === 'published');

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">المدونة</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        مقالات ونصائح تربوية وإبداعية لمساعدتكم في رحلة تنمية أطفالكم.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <ShareButtons 
                            title="مدونة الرحلة | مقالات ونصائح تربوية وإبداعية" 
                            url={pageUrl} 
                            label="شارك المدونة:"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
                    ) : publishedPosts.length > 0 ? (
                        publishedPosts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-500">لا توجد مقالات منشورة حاليًا.</p>
                    )}
                </div>
                {/* Add pagination controls here if needed */}
            </div>
        </div>
    );
};

export default BlogPage;