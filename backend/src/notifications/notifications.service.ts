import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    private async ensureExpiryNotifications(userId: string) {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const maxDate = new Date(startOfToday);
        maxDate.setDate(maxDate.getDate() + 60);

        const [documents, notifications] = await Promise.all([
            this.prisma.document.findMany({
                where: {
                    userId,
                    isDeleted: false,
                    expiryDate: {
                        gte: startOfToday,
                        lte: maxDate,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    expiryDate: true,
                },
            }),
            this.prisma.notification.findMany({
                where: {
                    userId,
                    type: 'EXPIRY_WARNING',
                },
                select: {
                    message: true,
                },
            }),
        ]);

        if (!documents.length) return;

        const existingMessages = new Set(notifications.map((notification) => notification.message));
        const dayMs = 24 * 60 * 60 * 1000;

        for (const document of documents) {
            if (!document.expiryDate) continue;

            const expiryDate = new Date(document.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);

            const remainingDays = Math.max(
                0,
                Math.ceil((expiryDate.getTime() - startOfToday.getTime()) / dayMs),
            );

            const message = remainingDays === 0
                ? `"${document.name}" vence hoy.`
                : `"${document.name}" vence en ${remainingDays} dias.`;

            if (existingMessages.has(message)) continue;

            await this.prisma.notification.create({
                data: {
                    userId,
                    type: 'EXPIRY_WARNING',
                    message,
                    data: {
                        documentId: document.id,
                        daysRemaining: remainingDays,
                    },
                },
            });

            existingMessages.add(message);
        }
    }

    async findAll(userId: string, page: number = 1, limit: number = 20) {
        await this.ensureExpiryNotifications(userId);
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
        return { message: 'Todas las notificaciones marcadas como leidas' };
    }

    async read(id: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) throw new NotFoundException('Notificacion no encontrada');
        if (notification.userId !== userId) throw new ForbiddenException();

        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return { message: 'Notificacion marcada como leida' };
    }
}
