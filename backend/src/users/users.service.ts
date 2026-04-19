import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';

import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService
    ) { }

    async findMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                categories: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: {
                        documents: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const { passwordHash, refreshTokenHash, ...result } = user;
        return {
            ...result,
            storageUsedBytes: result.storageUsedBytes.toString(),
            storageQuotaBytes: result.storageQuotaBytes.toString(),
        };
    }

    async update(userId: string, dto: UpdateUserDto) {
        if (dto.email) {
            const existing = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id: userId } },
            });
            if (existing) {
                throw new ConflictException('El email ya está en uso');
            }
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
        });

        const { passwordHash, refreshTokenHash, ...result } = user;
        return {
            ...result,
            storageUsedBytes: result.storageUsedBytes.toString(),
            storageQuotaBytes: result.storageQuotaBytes.toString(),
        };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('La contraseña actual es incorrecta');
        }

        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });

        return { message: 'Contraseña actualizada exitosamente' };
    }

    async exportData(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                documents: {
                    where: { isDeleted: false },
                    include: {
                        category: true,
                        tags: { include: { tag: true } },
                    },
                },
                categories: true,
            },
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const { passwordHash, refreshTokenHash, ...userData } = user;
        return {
            exportedAt: new Date().toISOString(),
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                createdAt: userData.createdAt,
            },
            categories: userData.categories,
            documents: userData.documents.map((doc) => ({
                id: doc.id,
                name: doc.name,
                description: doc.description,
                mimeType: doc.mimeType,
                originalName: doc.originalName,
                issuingAuthority: doc.issuingAuthority,
                documentNumber: doc.documentNumber,
                issueDate: doc.issueDate,
                expiryDate: doc.expiryDate,
                category: doc.category?.name,
                tags: doc.tags.map((t) => t.tag.name),
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })),
        };
    }

    async remove(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { documents: true },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        for (const doc of user.documents) {
            try {
                await this.storageService.delete(doc.fileKey);
            } catch (err) {
                console.error(`Error deleting file for doc ${doc.id}: ${err}`);
            }
        }

        if (user.avatarUrl) {
            try {
                await this.storageService.delete(user.avatarUrl);
            } catch(e) {}
        }

        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Cuenta eliminada exitosamente' };
    }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        
        if (user.avatarUrl) {
            try {
                await this.storageService.delete(user.avatarUrl);
            } catch(e) {}
        }
        
        const fileExtension = file.originalname.split('.').pop() || 'jpg';
        const fileKey = `avatars/${userId}-${Date.now()}.${fileExtension}`;
        
        await this.storageService.upload(fileKey, file.buffer, file.mimetype);
        
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: fileKey }
        });
        
        const { passwordHash, refreshTokenHash, ...result } = updated;
        return {
            ...result,
            storageUsedBytes: result.storageUsedBytes.toString(),
            storageQuotaBytes: result.storageQuotaBytes.toString(),
        };
    }

    async getAvatar(fileKey: string) {
        return this.storageService.download(fileKey);
    }
}
