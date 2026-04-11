import { Response } from 'express';
import { StorageService } from '../storage/storage.service';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import { SharedLinksService } from './shared-links.service';
export declare class SharedLinksController {
    private readonly sharedLinksService;
    private readonly storageService;
    constructor(sharedLinksService: SharedLinksService, storageService: StorageService);
    create(userId: string, dto: CreateSharedLinkDto): Promise<{
        id: string;
        documentId: string;
        userId: string;
        token: string;
        expiresAt: Date | null;
        isOneTime: boolean;
        accessCount: number;
        accessedAt: Date | null;
        createdAt: Date;
        document: {
            id: string;
            name: string;
            mimeType: string;
            originalName: string;
        };
        accessUrl: string;
    }>;
    findAll(userId: string): Promise<({
        document: {
            name: string;
            id: string;
            mimeType: string;
            originalName: string;
        };
    } & {
        documentId: string;
        id: string;
        userId: string;
        createdAt: Date;
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
