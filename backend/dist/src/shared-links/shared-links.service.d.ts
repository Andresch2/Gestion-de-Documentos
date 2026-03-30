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
    accessByToken(token: string): Promise<{
        downloadUrl: string;
        documentName: string;
        mimeType: string;
        originalName: string;
    }>;
    publicDownload(documentId: string, token: string): Promise<{
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
    }>;
}
