import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
        _count: {
            documents: number;
        };
    } & {
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        color: string;
        icon: string;
        isDefault: boolean;
    })[]>;
    create(userId: string, data: {
        name: string;
        color?: string;
        icon?: string;
    }): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    update(id: string, userId: string, data: {
        name?: string;
        color?: string;
        icon?: string;
    }): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        color: string;
        icon: string;
        isDefault: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
