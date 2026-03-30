import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(params: {
        userId: string;
        action: AuditAction;
        documentId?: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
}
