import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class ExpiryProcessor {
    private readonly logger = new Logger(ExpiryProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) { }

    @Cron('0 8 * * *') // Daily at 8 AM
    async checkExpiry() {
        this.logger.log('Running expiry check...');
        const thresholds = [90, 30, 7];

        for (const days of thresholds) {
            const targetStart = new Date();
            targetStart.setDate(targetStart.getDate() + days - 1);
            targetStart.setHours(0, 0, 0, 0);

            const targetEnd = new Date();
            targetEnd.setDate(targetEnd.getDate() + days);
            targetEnd.setHours(23, 59, 59, 999);

            const docs = await this.prisma.document.findMany({
                where: {
                    isDeleted: false,
                    expiryDate: {
                        gte: targetStart,
                        lte: targetEnd,
                    },
                },
                include: { user: true },
            });

            for (const doc of docs) {
                // Check if notification already exists for this document and threshold
                const existing = await this.prisma.notification.findFirst({
                    where: {
                        userId: doc.userId,
                        type: 'EXPIRY_WARNING',
                        data: {
                            path: ['documentId'],
                            equals: doc.id,
                        },
                        message: {
                            contains: `${days} días`,
                        },
                    },
                });

                if (!existing) {
                    await this.prisma.notification.create({
                        data: {
                            userId: doc.userId,
                            type: 'EXPIRY_WARNING',
                            message: `El documento "${doc.name}" vence en ${days} días`,
                            data: { documentId: doc.id, daysUntilExpiry: days },
                        },
                    });
                    this.logger.log(`Expiry warning created for document ${doc.id} (${days} days)`);
                }
            }
        }
    }

    @Cron('0 2 * * *') // Daily at 2 AM
    async cleanupTrash() {
        this.logger.log('Running trash cleanup...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const docs = await this.prisma.document.findMany({
            where: {
                isDeleted: true,
                deletedAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        for (const doc of docs) {
            try {
                // Delete file from disk
                await this.storageService.delete(doc.fileKey);

                // Decrement storage used
                await this.prisma.user.update({
                    where: { id: doc.userId },
                    data: {
                        storageUsedBytes: {
                            decrement: doc.fileSizeBytes,
                        },
                    },
                });

                // Delete from DB
                await this.prisma.document.delete({ where: { id: doc.id } });

                this.logger.log(`Auto-deleted document ${doc.id}`);
            } catch (error) {
                this.logger.error(`Failed to auto-delete document ${doc.id}: ${error}`);
            }
        }
    }
}
