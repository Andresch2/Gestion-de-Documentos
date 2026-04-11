import { auditApi } from '@/api/audit.api';
import type { AuditAction } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useAudit(params?: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    documentId?: string;
}) {
    return useQuery({
        queryKey: ['audit', params],
        queryFn: async () => {
            const { data } = await auditApi.getAll(params);
            return data.data || data;
        },
    });
}
