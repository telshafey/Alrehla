
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../contexts/ToastContext';

const NotificationListener: React.FC = () => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    useEffect(() => {
        if (!currentUser) return;

        // إنشاء قناة استماع خاصة بالمستخدم الحالي
        const channel = supabase
            .channel(`notifications_user_${currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    const newNotification = payload.new as any;
                    
                    // 1. تحديث كاش البيانات فوراً ليظهر الرقم على الجرس
                    queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
                    
                    // 2. إظهار تنبيه منبثق (Toast)
                    addToast(newNotification.message, 'info');
                    
                    // 3. تشغيل صوت تنبيه بسيط (اختياري)
                    try {
                        // صوت "Ding" خفيف
                        const audio = new Audio('https://cdn.freesound.org/previews/536/536108_10672036-lq.mp3');
                        audio.volume = 0.3;
                        audio.play().catch(() => {}); // تجاهل الخطأ إذا كان المتصفح يمنع التشغيل التلقائي
                    } catch(e) {}
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log("Listening for notifications...");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, queryClient, addToast]);

    return null; // هذا المكون يعمل في الخلفية ولا يعرض شيئاً
};

export default NotificationListener;
