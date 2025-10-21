import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers.ts';
import { ArrowLeft } from 'lucide-react';
import { BlogPost } from '../../lib/database.types.ts';

const PostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <Link to={`/blog/${post.slug}`} className="group bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border">
            <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>}
                <img
                    src={post.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'}
                    alt={post.title}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="text-sm text-gray-500 mt-2">
                    بواسطة {post.author_name} &bull; {formatDate(post.published_at)}
                </p>
                <p className="mt-4 text-gray-600 text-sm flex-grow line-clamp-3">
                    {post.content}
                </p>
                <div className="mt-6 flex items-center font-semibold text-blue-600">
                    <span>اقرأ المزيد</span>
                    <ArrowLeft size={20} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
};

export default React.memo(PostCard);