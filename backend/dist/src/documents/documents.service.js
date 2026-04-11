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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let DocumentsService = class DocumentsService {
    constructor(prisma, storageService, auditService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.auditService = auditService;
    }
    async findAll(userId, query) {
        const { page = 1, limit = 20, categoryId, search, tags, isDeleted, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {
            userId,
            isDeleted: isDeleted ?? false,
        };
        if (categoryId)
            where.categoryId = categoryId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { issuingAuthority: { contains: search, mode: 'insensitive' } },
                { documentNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (tags) {
            const tagNames = tags.split(',').map((t) => t.trim());
            where.tags = {
                some: {
                    tag: { name: { in: tagNames } },
                },
            };
        }
        if (query.startDate || query.endDate) {
            where.issueDate = {};
            if (query.startDate)
                where.issueDate.gte = new Date(query.startDate);
            if (query.endDate)
                where.issueDate.lte = new Date(query.endDate);
        }
        const orderBy = {};
        orderBy[sortBy || 'createdAt'] = sortOrder || 'desc';
        const [data, total] = await Promise.all([
            this.prisma.document.findMany({
                where,
                include: {
                    category: true,
                    tags: { include: { tag: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.document.count({ where }),
        ]);
        return {
            data: data.map((d) => ({
                ...d,
                fileSizeBytes: d.fileSizeBytes.toString(),
                tags: d.tags.map((t) => t.tag),
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, userId) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        if (doc.userId !== userId)
            throw new common_1.ForbiddenException();
        return {
            ...doc,
            fileSizeBytes: doc.fileSizeBytes.toString(),
            tags: doc.tags.map((t) => t.tag),
        };
    }
    async create(userId, dto, file, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const newUsed = Number(user.storageUsedBytes) + file.size;
        if (newUsed > Number(user.storageQuotaBytes)) {
            throw new common_1.BadRequestException('Se ha excedido la cuota de almacenamiento');
        }
        const fileKey = `${userId}/${file.filename}`;
        let tagConnections = [];
        if (dto.tags && dto.tags.length > 0) {
            const tagRecords = await Promise.all(dto.tags.map(async (tagName) => {
                return this.prisma.tag.upsert({
                    where: { userId_name: { userId, name: tagName } },
                    create: { userId, name: tagName },
                    update: {},
                });
            }));
            tagConnections = tagRecords.map((t) => ({ tagId: t.id }));
        }
        const document = await this.prisma.document.create({
            data: {
                userId,
                categoryId: dto.categoryId || null,
                name: dto.name,
                description: dto.description,
                fileKey,
                fileSizeBytes: BigInt(file.size),
                mimeType: file.mimetype,
                originalName: file.originalname,
                issuingAuthority: dto.issuingAuthority,
                documentNumber: dto.documentNumber,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
                tags: {
                    create: tagConnections.map((tc) => ({ tagId: tc.tagId })),
                },
            },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { storageUsedBytes: BigInt(newUsed) },
        });
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'UPLOAD_SUCCESS',
                message: `Documento "${dto.name}" subido exitosamente`,
                data: { documentId: document.id },
            },
        });
        await this.auditService.log({
            userId,
            action: 'UPLOAD',
            documentId: document.id,
            ipAddress,
            userAgent,
        });
        return {
            ...document,
            fileSizeBytes: document.fileSizeBytes.toString(),
            tags: document.tags.map((t) => t.tag),
        };
    }
    async findExpiring(userId) {
        const now = new Date();
        const sixtyDays = new Date();
        sixtyDays.setDate(sixtyDays.getDate() + 60);
        const docs = await this.prisma.document.findMany({
            where: {
                userId,
                isDeleted: false,
                expiryDate: {
                    gte: now,
                    lte: sixtyDays,
                },
            },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
            orderBy: { expiryDate: 'asc' },
        });
        return docs.map((d) => ({
            ...d,
            fileSizeBytes: d.fileSizeBytes.toString(),
            tags: d.tags.map((t) => t.tag),
        }));
    }
    async update(id, userId, dto, ipAddress, userAgent) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        if (doc.userId !== userId)
            throw new common_1.ForbiddenException();
        if (dto.tags !== undefined) {
            await this.prisma.documentTag.deleteMany({ where: { documentId: id } });
            if (dto.tags.length > 0) {
                const tagRecords = await Promise.all(dto.tags.map(async (tagName) => {
                    return this.prisma.tag.upsert({
                        where: { userId_name: { userId, name: tagName } },
                        create: { userId, name: tagName },
                        update: {},
                    });
                }));
                await this.prisma.documentTag.createMany({
                    data: tagRecords.map((t) => ({ documentId: id, tagId: t.id })),
                });
            }
        }
        const { tags, ...updateData } = dto;
        const updated = await this.prisma.document.update({
            where: { id },
            data: {
                ...updateData,
                issueDate: updateData.issueDate ? new Date(updateData.issueDate) : undefined,
                expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : undefined,
            },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
        });
        await this.auditService.log({
            userId,
            action: 'UPDATE',
            documentId: id,
            ipAddress,
            userAgent,
        });
        return {
            ...updated,
            fileSizeBytes: updated.fileSizeBytes.toString(),
            tags: updated.tags.map((t) => t.tag),
        };
    }
    async softDelete(id, userId, ipAddress, userAgent) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        if (doc.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.document.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        await this.auditService.log({
            userId,
            action: 'DELETE',
            documentId: id,
            ipAddress,
            userAgent,
        });
        return { message: 'Documento movido a la papelera' };
    }
    async restore(id, userId, ipAddress, userAgent) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        if (doc.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.document.update({
            where: { id },
            data: { isDeleted: false, deletedAt: null },
        });
        await this.auditService.log({
            userId,
            action: 'RESTORE',
            documentId: id,
            ipAddress,
            userAgent,
        });
        return { message: 'Documento restaurado' };
    }
    async permanentDelete(id, userId) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        if (doc.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.storageService.delete(doc.fileKey);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                storageUsedBytes: {
                    decrement: doc.fileSizeBytes,
                },
            },
        });
        await this.prisma.document.delete({ where: { id } });
        return { message: 'Documento eliminado permanentemente' };
    }
    async getStats(userId) {
        const [totalDocs, expiringDocs, deletedDocs, totalCategories] = await Promise.all([
            this.prisma.document.count({ where: { userId, isDeleted: false } }),
            this.prisma.document.count({
                where: {
                    userId,
                    isDeleted: false,
                    expiryDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            this.prisma.document.count({ where: { userId, isDeleted: true } }),
            this.prisma.category.count({ where: { userId } }),
        ]);
        return { totalDocs, expiringDocs, deletedDocs, totalCategories };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        audit_service_1.AuditService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map