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
