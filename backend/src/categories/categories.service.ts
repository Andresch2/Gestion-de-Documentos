import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.category.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        documents: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async create(userId: string, data: { name: string; color?: string; icon?: string; parentId?: string }) {
        const name = data.name?.trim();
        if (!name) throw new BadRequestException('El nombre de la categoria es obligatorio');

        const exists = await this.prisma.category.findFirst({
            where: {
                userId,
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
        });

        if (exists) {
            throw new ConflictException('Ya existe una categoria con ese nombre');
        }

        if (data.parentId) {
            const parent = await this.prisma.category.findUnique({ where: { id: data.parentId } });
            if (!parent || parent.userId !== userId) {
                throw new BadRequestException('La categoría padre no existe o no te pertenece');
            }
        }

        return this.prisma.category.create({
            data: {
                userId,
                name,
                color: data.color || '#4f8ef7',
                icon: data.icon || 'Folder',
                parentId: data.parentId || null,
            },
        });
    }

    async update(
        id: string,
        userId: string,
        data: { name?: string; color?: string; icon?: string; parentId?: string },
    ) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Categoria no encontrada');
        if (category.userId !== userId) throw new ForbiddenException();

        const name = data.name?.trim();
        if (data.name !== undefined && !name) {
            throw new BadRequestException('El nombre de la categoria es obligatorio');
        }

        if (name && name.toLowerCase() !== category.name.toLowerCase()) {
            const exists = await this.prisma.category.findFirst({
                where: {
                    userId,
                    name: {
                        equals: name,
                        mode: 'insensitive',
                    },
                    NOT: { id },
                },
            });

            if (exists) {
                throw new ConflictException('Ya existe una categoria con ese nombre');
            }
        }

        if (data.parentId) {
            if (data.parentId === id) {
                throw new BadRequestException('Una categoría no puede ser padre de sí misma');
            }
            const parent = await this.prisma.category.findUnique({ where: { id: data.parentId } });
            if (!parent || parent.userId !== userId) {
                throw new BadRequestException('La categoría padre no existe o no te pertenece');
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: {
                ...data,
                name: name ?? data.name,
                parentId: data.parentId !== undefined ? data.parentId || null : category.parentId,
            },
        });
    }

    async delete(id: string, userId: string) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Categoria no encontrada');
        if (category.userId !== userId) throw new ForbiddenException();

        await this.prisma.document.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
        });

        await this.prisma.category.delete({ where: { id } });
        return { message: 'Categoria eliminada' };
    }
}
