
import { useQuery } from '@tanstack/react-query';
import { mockSiteContent, mockBlogPosts } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminSiteContent = () => useQuery({
    queryKey: ['adminSiteContent'],
    queryFn: async () => {
        const stored = localStorage.getItem('alrehla_site_content');
        if (stored) {
            try {
                // Deep merge is ideal, but shallow merge of top keys works for this structure
                // We spread mockSiteContent first to ensure structure, then overwrite with stored
                return { ...mockSiteContent, ...JSON.parse(stored) };
            } catch (e) {
                console.error("Error parsing site content from local storage:", e);
                return mockFetch(mockSiteContent);
            }
        }
        return mockFetch(mockSiteContent);
    },
});

export const useAdminBlogPosts = () => useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => mockFetch(mockBlogPosts),
});
