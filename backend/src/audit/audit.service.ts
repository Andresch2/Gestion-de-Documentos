import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        userId: string;
        action: AuditAction;
        documentId?: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, any>;
    }) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: params.userId,
                    action: params.action,
                    documentId: params.documentId,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    metadata: params.metadata,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to create audit log: ${error}`);
        }
    }
}
