import { usersApi } from '@/api/users.api';
import { documentsApi } from '@/api/documents.api';
import type { Document, DocumentQueryParams, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

async function syncCurrentUser() {
    const { data } = await usersApi.getMe();
    const currentUser = (data.data || data) as {
        storageUsedBytes: string;
        storageQuotaBytes: string;
        name?: string;
        email?: string;
    };

    useAuthStore.getState().updateUser(currentUser);
}

export function useDocuments(params?: DocumentQueryParams) {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: async () => {
            const { data } = await documentsApi.getAll(params);
            // Si el backend devuelve { data: [...], meta: {...} }, entonces `data` ya es ese objeto.
            // Si está envuelto de nuevo { data: { data: [...], meta: {...} } }, entonces es data.data
            return (data.meta ? data : data.data) as PaginatedResponse<Document>;
        },
    });
}

export function useDocument(id: string) {
    return useQuery({
        queryKey: ['documents', id],
        queryFn: async () => {
            const { data } = await documentsApi.getOne(id);
            return (data.data || data) as Document;
        },
        enabled: !!id,
    });
}

export function useDocumentStats() {
    return useQuery({
        queryKey: ['documents', 'stats'],
        queryFn: async () => {
            const { data } = await documentsApi.getStats();
            return data.data || data;
        },
    });
}

export function useExpiringDocuments() {
    return useQuery({
        queryKey: ['documents', 'expiring'],
        queryFn: async () => {
            const { data } = await documentsApi.getExpiring();
            return (data.data || data) as Document[];
        },
    });
}

export function useUploadDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ formData, onProgress }: { formData: FormData; onProgress?: (p: number) => void }) =>
            documentsApi.create(formData, onProgress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            void syncCurrentUser();
        },
    });
}

export function useUpdateDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
            documentsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            void syncCurrentUser();
        },
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => documentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}

export function useRestoreDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => documentsApi.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}

export function usePermanentDeleteDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => documentsApi.permanentDelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            void syncCurrentUser();
        },
    });
}
