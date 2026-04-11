import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
export declare class SharedLinksService {
    private readonly prisma;
    private readonly configService;
    private readonly auditService;
    constructor(prisma: PrismaService, configService: ConfigService, auditService: AuditService);
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
    accessByToken(token: string): Promise<{
        downloadUrl: string;
        documentName: string;
        mimeType: string;
        originalName: string;
    }>;
    publicDownload(documentId: string, token: string): Promise<{
        name: string;
        description: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        categoryId: string | null;
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
        updatedAt: Date;
    }>;
}
