import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId: string, page?: number, limit?: number): Promise<{
        data: {
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            createdAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            message: string;
            isRead: boolean;
        }[];
        unreadCount: number;
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    readAll(userId: string): Promise<{
        message: string;
    }>;
    read(id: string, userId: string): Promise<{
        message: string;
    }>;
}
