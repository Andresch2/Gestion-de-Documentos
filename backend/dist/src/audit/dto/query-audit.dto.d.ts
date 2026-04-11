import { AuditAction } from '@prisma/client';
export declare class QueryAuditDto {
    page?: number;
    limit?: number;
    action?: AuditAction;
    documentId?: string;
}
