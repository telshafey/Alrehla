import { useQuery } from '@tanstack/react-query';
import { mockSiteContent, mockBlogPosts } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminSiteContent = () => useQuery({
    queryKey: ['adminSiteContent'],
    queryFn: () => mockFetch(mockSiteContent),
});

export const useAdminBlogPosts = () => useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => mockFetch(mockBlogPosts),
});
