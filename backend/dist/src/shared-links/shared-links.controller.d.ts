import { Response } from 'express';
import { StorageService } from '../storage/storage.service';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import { SharedLinksService } from './shared-links.service';
export declare class SharedLinksController {
    private readonly sharedLinksService;
    private readonly storageService;
    constructor(sharedLinksService: SharedLinksService, storageService: StorageService);
    create(userId: string, dto: CreateSharedLinkDto): Promise<{
        accessUrl: string;
        document: {
            id: string;
            createdAt: Date;
            userId: string;
            name: string;
            description: string | null;
            updatedAt: Date;
            fileKey: string;
            fileSizeBytes: bigint;
            mimeType: string;
            originalName: string;
            issuingAuthority: string | null;
            documentNumber: string | null;
            issueDate: Date | null;
            expiryDate: Date | null;
            isDeleted: boolean;
            deletedAt: Date | null;
            scanStatus: import(".prisma/client").$Enums.ScanStatus;
            categoryId: string | null;
        };
        id: string;
        createdAt: Date;
        userId: string;
        documentId: string;
        isOneTime: boolean;
        token: string;
        expiresAt: Date | null;
        accessCount: number;
        accessedAt: Date | null;
    }>;
    findAll(userId: string): Promise<({
        document: {
            id: string;
            name: string;
            mimeType: string;
            originalName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        documentId: string;
        isOneTime: boolean;
        token: string;
        expiresAt: Date | null;
        accessCount: number;
        accessedAt: Date | null;
    })[]>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    access(token: string): Promise<{
        downloadUrl: string;
        documentName: string;
        mimeType: string;
        originalName: string;
    }>;
}
export declare class PublicDownloadController {
    private readonly sharedLinksService;
    private readonly storageService;
    constructor(sharedLinksService: SharedLinksService, storageService: StorageService);
    publicDownload(id: string, token: string, res: Response): Promise<void>;
}
