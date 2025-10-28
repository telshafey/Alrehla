import React from 'react';
import { useParams, Link } from 'react-router-dom';
// FIX: Corrected import path
import { usePublicData } from '../hooks/publicQueries';
import PageLoader from '../components/ui/PageLoader';
import { formatDate } from '../utils/helpers';
import ShareButtons from '../components/shared/ShareButtons';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading, error } = usePublicData();
    const blogPosts = data?.blogPosts || [];

    if (isLoading) return <PageLoader />;

    const post = blogPosts.find(p => p.slug === slug);

    if (error) return <div className="text-center text-red-500 py-12">{error.message}</div>;
    if (!post) return <div className="text-center py-12">لم يتم العثور على المقال.</div>;

    const pageUrl = window.location.href;

    return (
        <div className="bg-white py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <article>
                    <header className="mb-12">
                         <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-6">
                            <ArrowLeft size={18} />
                            <span>العودة إلى المدونة</span>
                        </Link>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><User size={16} /><span>{post.author_name}</span></div>
                            <div className="flex items-center gap-2"><Calendar size={16} /><span>{formatDate(post.published_at)}</span></div>
                        </div>
                    </header>
                    {post.image_url && (
                        <img src={post.image_url} alt={post.title} className="w-full h-auto rounded-2xl shadow-lg mb-12" />
                    )}
                    <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
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
    );
};

export default BlogPostPage;
