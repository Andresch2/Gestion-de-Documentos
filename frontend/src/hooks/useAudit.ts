import { auditApi } from '@/api/audit.api';
import { useAuthStore } from '@/store/auth.store';
import type { AuditAction } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useAudit(params?: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    documentId?: string;
}) {
    const userId = useAuthStore((s) => s.user?.id);

    return useQuery({
        queryKey: ['audit', userId, params],
        queryFn: async () => {
            const { data } = await auditApi.getAll(params);
            return data.data || data;
        },
        enabled: !!userId,
    });
}
