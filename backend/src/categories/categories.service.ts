import {
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

    async create(userId: string, data: { name: string; color?: string; icon?: string }) {
        return this.prisma.category.create({
            data: {
                userId,
                name: data.name,
                color: data.color || '#4f8ef7',
                icon: data.icon || '📁',
            },
        });
    }

    async update(
        id: string,
        userId: string,
        data: { name?: string; color?: string; icon?: string },
    ) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Categoría no encontrada');
        if (category.userId !== userId) throw new ForbiddenException();

        return this.prisma.category.update({
            where: { id },
            data,
        });
    }

    async delete(id: string, userId: string) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Categoría no encontrada');
        if (category.userId !== userId) throw new ForbiddenException();

        // Move documents to uncategorized
        await this.prisma.document.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
        });

        await this.prisma.category.delete({ where: { id } });
        return { message: 'Categoría eliminada' };
    }
}
