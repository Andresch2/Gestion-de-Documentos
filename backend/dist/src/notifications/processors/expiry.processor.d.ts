import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
export declare class ExpiryProcessor {
    private readonly prisma;
    private readonly storageService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService);
    checkExpiry(): Promise<void>;
    cleanupTrash(): Promise<void>;
}
