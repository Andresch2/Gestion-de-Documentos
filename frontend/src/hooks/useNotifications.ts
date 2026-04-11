import { notificationsApi } from '@/api/notifications.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useNotifications(page?: number) {
    return useQuery({
        queryKey: ['notifications', page],
        queryFn: async () => {
            const { data } = await notificationsApi.getAll(page);
            return data;
        },
        refetchInterval: 30000, // Poll every 30s
    });
}

export function useReadAllNotifications() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationsApi.readAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useReadNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationsApi.read(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
