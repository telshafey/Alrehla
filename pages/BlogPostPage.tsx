import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import PageLoader from '../components/ui/PageLoader';
import { formatDate } from '../utils/helpers';
import ShareButtons from '../components/shared/ShareButtons';
import { ArrowLeft } from 'lucide-react';
import Image from '../components/ui/Image';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading, error } = usePublicData();
    const pageUrl = window.location.href;

    if (isLoading) {
        return <PageLoader text="جاري تحميل المقال..." />;
    }

    const post = data?.blogPosts.find(p => p.slug === slug && p.status === 'published');

    if (error) {
        return <div className="text-center py-20 text-red-500">{(error as Error).message}</div>;
    }

    if (!post) {
        return <div className="text-center py-20">لم يتم العثور على المقال.</div>;
    }

    return (
        <div className="bg-white py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-8">
                        <ArrowLeft size={16} />
                        العودة إلى المدونة
                    </Link>
                    <article>
                        <header className="mb-8">
                             <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight">{post.title}</h1>
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                               <span>{post.author_name}</span>
                               <span>{formatDate(post.published_at)}</span>
                            </div>
                        </header>
                        
                        {post.image_url && (
                             <Image src={post.image_url} alt={post.title} className="w-full rounded-2xl shadow-lg mb-8 aspect-video" />
                        )}

                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-right">
                           {post.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        <footer className="mt-12 pt-8 border-t">
                             <ShareButtons title={post.title} url={pageUrl} label="شارك المقال:" />
                        </footer>
                    </article>
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;
