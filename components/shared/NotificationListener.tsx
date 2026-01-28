
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../contexts/ToastContext';

const NotificationListener: React.FC = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload notification sound
        audioRef.current = new Audio('https://cdn.freesound.org/previews/536/536108_10672036-lq.mp3');
        audioRef.current.volume = 0.5;
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        // Unique channel name per user to avoid conflicts
        const channelName = `notifications:user:${currentUser.id}`;
        
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`, // Listen ONLY for notifications sent to ME
                },
                (payload) => {
                    const newNotification = payload.new as any;
                    
                    // 1. Invalidate queries to refresh the list UI
                    queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
                    
                    // 2. Show Toast
                    addToast(newNotification.message, 'info');
                    
                    // 3. Play Sound
                    if (audioRef.current) {
                        audioRef.current.play().catch(e => console.warn("Audio play blocked (user interaction needed first):", e));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, queryClient, addToast]); // Depend on ID specifically to prevent loop

    return null; 
};

export default NotificationListener;
