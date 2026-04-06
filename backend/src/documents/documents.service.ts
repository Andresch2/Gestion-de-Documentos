import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly auditService: AuditService,
    ) { }

    async findAll(userId: string, query: QueryDocumentsDto) {
        const { page = 1, limit = 20, categoryId, search, tags, isDeleted, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.DocumentWhereInput = {
            userId,
            isDeleted: isDeleted ?? false,
        };

        if (categoryId) where.categoryId = categoryId;

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
            if (query.startDate) where.issueDate.gte = new Date(query.startDate);
            if (query.endDate) where.issueDate.lte = new Date(query.endDate);
        }

        const orderBy: any = {};
        orderBy[sortBy || 'createdAt'] = sortOrder || 'desc';

        console.log('--- FIND_ALL QUERY LOGS ---');
        console.log('User ID:', userId);
        console.log('Query Input Params:', query);
        console.log('Constructed Where Filter:', JSON.stringify(where, null, 2));

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

        console.log('Prisma Found Data Length:', data.length);
        console.log('Prisma Count Total:', total);
        console.log('---------------------------');

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

    async findOne(id: string, userId: string) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
        });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.userId !== userId) throw new ForbiddenException();

        return {
            ...doc,
            fileSizeBytes: doc.fileSizeBytes.toString(),
            tags: doc.tags.map((t) => t.tag),
        };
    }

    async create(
        userId: string,
        dto: CreateDocumentDto,
        file: Express.Multer.File,
        ipAddress?: string,
        userAgent?: string,
    ) {
        // Check storage quota
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const newUsed = Number(user.storageUsedBytes) + file.size;
        if (newUsed > Number(user.storageQuotaBytes)) {
            throw new BadRequestException('Se ha excedido la cuota de almacenamiento');
        }

        const fileKey = `${userId}/${file.filename}`;

        // Handle tags
        let tagConnections: { tagId: string }[] = [];
        if (dto.tags && dto.tags.length > 0) {
            const tagRecords = await Promise.all(
                dto.tags.map(async (tagName) => {
                    return this.prisma.tag.upsert({
                        where: { userId_name: { userId, name: tagName } },
                        create: { userId, name: tagName },
                        update: {},
                    });
                }),
            );
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

        // Update storage used
        await this.prisma.user.update({
            where: { id: userId },
            data: { storageUsedBytes: BigInt(newUsed) },
        });

        // Notification
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'UPLOAD_SUCCESS',
                message: `Documento "${dto.name}" subido exitosamente`,
                data: { documentId: document.id },
            },
        });

        // Audit
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

    async findExpiring(userId: string) {
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

    async update(
        id: string,
        userId: string,
        dto: UpdateDocumentDto,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.userId !== userId) throw new ForbiddenException();

        // Handle tags sync
        if (dto.tags !== undefined) {
            // Delete existing tags
            await this.prisma.documentTag.deleteMany({ where: { documentId: id } });

            if (dto.tags.length > 0) {
                const tagRecords = await Promise.all(
                    dto.tags.map(async (tagName) => {
                        return this.prisma.tag.upsert({
                            where: { userId_name: { userId, name: tagName } },
                            create: { userId, name: tagName },
                            update: {},
                        });
                    }),
                );
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

    async softDelete(id: string, userId: string, ipAddress?: string, userAgent?: string) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.userId !== userId) throw new ForbiddenException();

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

    async restore(id: string, userId: string, ipAddress?: string, userAgent?: string) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.userId !== userId) throw new ForbiddenException();

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

    async permanentDelete(id: string, userId: string) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.userId !== userId) throw new ForbiddenException();

        // Delete file from disk
        await this.storageService.delete(doc.fileKey);

        // Decrement storage used
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

    async getStats(userId: string) {
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
}
