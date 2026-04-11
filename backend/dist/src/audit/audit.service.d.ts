import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string, params?: {
        page?: number;
        limit?: number;
        action?: AuditAction;
        documentId?: string;
    }): Promise<{
        data: ({
            document: {
                name: string;
                id: string;
            } | null;
        } & {
            action: import(".prisma/client").$Enums.AuditAction;
            documentId: string | null;
            id: string;
            userId: string;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    log(params: {
        userId: string;
        action: AuditAction;
        documentId?: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
}
