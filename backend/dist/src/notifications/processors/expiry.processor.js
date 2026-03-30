"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExpiryProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiryProcessor = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../../storage/storage.service");
let ExpiryProcessor = ExpiryProcessor_1 = class ExpiryProcessor {
    constructor(prisma, storageService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.logger = new common_1.Logger(ExpiryProcessor_1.name);
    }
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
                await this.storageService.delete(doc.fileKey);
                await this.prisma.user.update({
                    where: { id: doc.userId },
                    data: {
                        storageUsedBytes: {
                            decrement: doc.fileSizeBytes,
                        },
                    },
                });
                await this.prisma.document.delete({ where: { id: doc.id } });
                this.logger.log(`Auto-deleted document ${doc.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to auto-delete document ${doc.id}: ${error}`);
            }
        }
    }
};
exports.ExpiryProcessor = ExpiryProcessor;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExpiryProcessor.prototype, "checkExpiry", null);
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExpiryProcessor.prototype, "cleanupTrash", null);
exports.ExpiryProcessor = ExpiryProcessor = ExpiryProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], ExpiryProcessor);
//# sourceMappingURL=expiry.processor.js.map