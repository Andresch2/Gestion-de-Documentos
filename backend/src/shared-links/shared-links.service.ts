import {
    ForbiddenException,
    GoneException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';

@Injectable()
export class SharedLinksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly auditService: AuditService,
    ) { }

    async create(userId: string, dto: CreateSharedLinkDto) {
        const doc = await this.prisma.document.findUnique({
            where: { id: dto.documentId },
        });
        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.userId !== userId) throw new ForbiddenException();
        if (doc.isDeleted) throw new ForbiddenException('No se puede compartir un documento eliminado');

        let expiresAt: Date | null = null;
        if (dto.expiresIn) {
            const now = new Date();
            const map: Record<string, number> = {
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

        const frontendUrl = this.configService.get<string>('frontendUrl', 'http://localhost:5173');
        return {
            id: link.id,
            documentId: link.documentId,
            userId: link.userId,
            token: link.token,
            expiresAt: link.expiresAt,
            isOneTime: link.isOneTime,
            accessCount: link.accessCount,
            accessedAt: link.accessedAt,
            createdAt: link.createdAt,
            document: {
                id: link.document.id,
                name: link.document.name,
                mimeType: link.document.mimeType,
                originalName: link.document.originalName,
            },
            accessUrl: `${frontendUrl}/shared/${link.token}`,
        };
    }

    async findAll(userId: string) {
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

    async delete(id: string, userId: string) {
        const link = await this.prisma.sharedLink.findUnique({ where: { id } });
        if (!link) throw new NotFoundException('Link no encontrado');
        if (link.userId !== userId) throw new ForbiddenException();

        await this.prisma.sharedLink.delete({ where: { id } });

        await this.auditService.log({
            userId,
            action: 'REVOKE_SHARE',
            documentId: link.documentId,
        });

        return { message: 'Link revocado' };
    }

    async accessByToken(token: string) {
        const link = await this.prisma.sharedLink.findUnique({
            where: { token },
            include: {
                document: {
                    select: { id: true, name: true, mimeType: true, originalName: true, fileKey: true },
                },
            },
        });

        if (!link) throw new NotFoundException('Link no encontrado');

        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new GoneException('Este link ha expirado');
        }

        if (link.isOneTime && link.accessCount > 0) {
            throw new GoneException('Este link ya fue utilizado');
        }

        // Update access info
        await this.prisma.sharedLink.update({
            where: { id: link.id },
            data: {
                accessCount: { increment: 1 },
                accessedAt: new Date(),
            },
        });

        // Notify owner
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

    async publicDownload(documentId: string, token: string) {
        const link = await this.prisma.sharedLink.findUnique({
            where: { token },
            include: { document: true },
        });

        if (!link || link.documentId !== documentId) {
            throw new NotFoundException('Link no encontrado');
        }

        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new GoneException('Este link ha expirado');
        }

        if (link.isOneTime && link.accessCount > 1) {
            throw new GoneException('Este link ya fue utilizado');
        }

        return link.document;
    }
}
