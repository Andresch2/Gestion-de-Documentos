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
exports.SharedLinksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let SharedLinksService = class SharedLinksService {
    constructor(prisma, configService, auditService) {
        this.prisma = prisma;
        this.configService = configService;
        this.auditService = auditService;
    }
    async create(userId, dto) {
        const doc = await this.prisma.document.findUnique({
            where: { id: dto.documentId },
        });
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        if (doc.userId !== userId)
            throw new common_1.ForbiddenException();
        if (doc.isDeleted)
            throw new common_1.ForbiddenException('No se puede compartir un documento eliminado');
        let expiresAt = null;
        if (dto.expiresIn) {
            const now = new Date();
            const map = {
                '1h': 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000,
            };
            const ms = map[dto.expiresIn];
            if (ms) {
                expiresAt = new Date(now.getTime() + ms);
            }
        }
        const link = await this.prisma.sharedLink.create({
            data: {
                documentId: dto.documentId,
                userId,
                expiresAt,
                isOneTime: dto.isOneTime ?? false,
            },
            include: { document: true },
        });
        await this.auditService.log({
            userId,
            action: 'SHARE',
            documentId: dto.documentId,
        });
        const frontendUrl = this.configService.get('frontendUrl', 'http://localhost:5173');
        return {
            ...link,
            accessUrl: `${frontendUrl}/shared/${link.token}`,
        };
    }
    async findAll(userId) {
        return this.prisma.sharedLink.findMany({
            where: { userId },
            include: {
                document: {
                    select: { id: true, name: true, mimeType: true, originalName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async delete(id, userId) {
        const link = await this.prisma.sharedLink.findUnique({ where: { id } });
        if (!link)
            throw new common_1.NotFoundException('Link no encontrado');
        if (link.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.sharedLink.delete({ where: { id } });
        await this.auditService.log({
            userId,
            action: 'REVOKE_SHARE',
            documentId: link.documentId,
        });
        return { message: 'Link revocado' };
    }
    async accessByToken(token) {
        const link = await this.prisma.sharedLink.findUnique({
            where: { token },
            include: {
                document: {
                    select: { id: true, name: true, mimeType: true, originalName: true, fileKey: true },
                },
            },
        });
        if (!link)
            throw new common_1.NotFoundException('Link no encontrado');
        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new common_1.GoneException('Este link ha expirado');
        }
        if (link.isOneTime && link.accessCount > 0) {
            throw new common_1.GoneException('Este link ya fue utilizado');
        }
        await this.prisma.sharedLink.update({
            where: { id: link.id },
            data: {
                accessCount: { increment: 1 },
                accessedAt: new Date(),
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: link.userId,
                type: 'LINK_ACCESSED',
                message: `Alguien accedió al documento "${link.document.name}" mediante link compartido`,
                data: { documentId: link.documentId, token },
            },
        });
        return {
            downloadUrl: `/api/documents/${link.documentId}/public-download/${token}`,
            documentName: link.document.name,
            mimeType: link.document.mimeType,
            originalName: link.document.originalName,
        };
    }
    async publicDownload(documentId, token) {
        const link = await this.prisma.sharedLink.findUnique({
            where: { token },
            include: { document: true },
        });
        if (!link || link.documentId !== documentId) {
            throw new common_1.NotFoundException('Link no encontrado');
        }
        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new common_1.GoneException('Este link ha expirado');
        }
        if (link.isOneTime && link.accessCount > 1) {
            throw new common_1.GoneException('Este link ya fue utilizado');
        }
        return link.document;
    }
};
exports.SharedLinksService = SharedLinksService;
exports.SharedLinksService = SharedLinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], SharedLinksService);
//# sourceMappingURL=shared-links.service.js.map