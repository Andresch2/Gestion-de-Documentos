import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [data, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return {
            data,
            unreadCount,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async readAll(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { message: 'Todas las notificaciones marcadas como leídas' };
    }

    async read(id: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) throw new NotFoundException('Notificación no encontrada');
        if (notification.userId !== userId) throw new ForbiddenException();

        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return { message: 'Notificación marcada como leída' };
    }
}
