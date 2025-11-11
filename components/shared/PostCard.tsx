import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import Image from '../ui/Image';

interface PostCardProps {
    post: BlogPost;
}

const PostCard = React.forwardRef<HTMLElement, PostCardProps>(({ post }, ref) => {
    return (
        <Card ref={ref} as={Link} to={`/blog/${post.slug}`} className="overflow-hidden transition-transform transform hover:-translate-y-2 duration-300 h-full flex flex-col no-underline">
            <Image src={post.image_url || 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg'} alt={post.title} className="w-full aspect-[16/9]" />
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
        </Card>
    );
});
PostCard.displayName = 'PostCard';

export default React.memo(PostCard);

export const PostCardSkeleton: React.FC = () => (
    <Card className="overflow-hidden h-full flex flex-col">
        <div className="w-full aspect-[16/9] bg-muted animate-pulse" />
        <CardHeader>
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2"></div>
        </CardHeader>
        <CardContent className="flex-grow">
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
            </div>
        </CardContent>
        <CardFooter>
             <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
        </CardFooter>
    </Card>
);