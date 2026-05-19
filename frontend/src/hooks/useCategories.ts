import { categoriesApi } from '@/api/categories.api';
import { useAuthStore } from '@/store/auth.store';
import type { Category } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCategories() {
    const userId = useAuthStore((s) => s.user?.id);

    return useQuery({
        queryKey: ['categories', userId],
        queryFn: async () => {
            const { data } = await categoriesApi.getAll();
            return (data.data || data) as Category[];
        },
        enabled: !!userId,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; color?: string; icon?: string; parentId?: string }) =>
            categoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string; icon?: string; parentId?: string } }) =>
            categoriesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}
