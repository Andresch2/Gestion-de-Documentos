import { categoriesApi } from '@/api/categories.api';
import type { Category } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await categoriesApi.getAll();
            return (data.data || data) as Category[];
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; color?: string; icon?: string }) =>
            categoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
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
