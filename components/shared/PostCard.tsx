import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface PostCardProps {
    post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    return (
        <Card asChild className="overflow-hidden transition-transform transform hover:-translate-y-2 duration-300 h-full flex flex-col">
            <Link to={`/blog/${post.slug}`}>
                <img src={post.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} alt={post.title} className="w-full h-56 object-cover" loading="lazy" />
                <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{formatDate(post.published_at)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                </CardContent>
                <CardFooter>
                    <span className="text-sm font-semibold text-primary">اقرأ المزيد</span>
                </CardFooter>
            </Link>
        </Card>
    );
};

export default React.memo(PostCard);