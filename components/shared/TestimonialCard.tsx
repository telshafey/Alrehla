import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

const TestimonialCard: React.FC<{ quote: string, author: string, role: string }> = ({ quote, author, role }) => (
    <Card className="h-full flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
        <CardHeader>
            <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="text-yellow-400 me-1" fill="currentColor" />
                ))}
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-muted-foreground italic">"{quote}"</p>
        </CardContent>
        <CardFooter>
            <div>
                <p className="font-semibold text-foreground">{author}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
            </div>
        </CardFooter>
    </Card>
);

export default React.memo(TestimonialCard);