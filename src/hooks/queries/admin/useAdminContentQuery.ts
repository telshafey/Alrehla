
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../../services/contentService';

export const useAdminSiteContent = () => useQuery({
    queryKey: ['adminSiteContent'],
    queryFn: () => contentService.getSiteContent(),
});

export const useAdminBlogPosts = () => useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => contentService.getAllBlogPosts(),
});
