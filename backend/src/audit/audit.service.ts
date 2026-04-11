import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(
        userId: string,
        params?: {
            page?: number;
            limit?: number;
            action?: AuditAction;
            documentId?: string;
        },
    ) {
        const page = Math.max(1, params?.page || 1);
        const limit = Math.min(100, Math.max(1, params?.limit || 20));
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(params?.action ? { action: params.action } : {}),
            ...(params?.documentId ? { documentId: params.documentId } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    document: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

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
