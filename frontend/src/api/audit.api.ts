import type { AuditAction } from '@/types';
import apiClient from './client';

export const auditApi = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        action?: AuditAction;
        documentId?: string;
    }) => apiClient.get('/audit', { params }),
};
