import { Response } from 'express';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<{
        storageUsedBytes: string;
        storageQuotaBytes: string;
        _count: {
            documents: number;
        };
        categories: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            color: string;
            icon: string;
            isDefault: boolean;
        }[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerifiedAt: Date | null;
    }>;
    updateMe(userId: string, dto: UpdateUserDto): Promise<{
        storageUsedBytes: string;
        storageQuotaBytes: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerifiedAt: Date | null;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    exportData(userId: string, res: Response): Promise<{
        exportedAt: string;
        user: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
        };
        categories: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            color: string;
            icon: string;
            isDefault: boolean;
        }[];
        documents: {
            id: string;
            name: string;
            description: string | null;
            mimeType: string;
            originalName: string;
            issuingAuthority: string | null;
            documentNumber: string | null;
            issueDate: Date | null;
            expiryDate: Date | null;
            category: string | undefined;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
}
