
import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';

interface PostCardProps {
    post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    return (
        <Link to={`/blog/${post.slug}`} className="group block bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <div className="relative h-56 bg-gray-200">
                <img src={post.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-500">{formatDate(post.published_at)}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.content}</p>
                 <div className="mt-4 font-semibold text-blue-600">اقرأ المزيد</div>
            </div>
        </Link>
    );
};

export default PostCard;
