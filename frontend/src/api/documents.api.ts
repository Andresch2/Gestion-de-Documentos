import type { DocumentQueryParams } from '@/types';
import apiClient from './client';

export const documentsApi = {
    getAll: (params?: DocumentQueryParams) =>
        apiClient.get('/documents', { params }),

    getOne: (id: string) => apiClient.get(`/documents/${id}`),

    getStats: () => apiClient.get('/documents/stats'),

    getExpiring: () => apiClient.get('/documents/expiring'),

    create: (formData: FormData, onUploadProgress?: (progress: number) => void) =>
        apiClient.post('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (onUploadProgress && event.total) {
                    onUploadProgress(Math.round((event.loaded / event.total) * 100));
                }
            },
        }),

    update: (id: string, data: Record<string, any>) =>
        apiClient.patch(`/documents/${id}`, data),

    delete: (id: string) => apiClient.delete(`/documents/${id}`),

    restore: (id: string) => apiClient.post(`/documents/${id}/restore`),

    permanentDelete: (id: string) =>
        apiClient.delete(`/documents/${id}/permanent`),

    download: (id: string) =>
        apiClient.get(`/documents/${id}/download`, { responseType: 'blob' }),
};
