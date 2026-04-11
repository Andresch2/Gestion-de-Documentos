import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storageService;
    private readonly auditService;
    constructor(prisma: PrismaService, storageService: StorageService, auditService: AuditService);
    findAll(userId: string, query: QueryDocumentsDto): Promise<{
        data: {
            fileSizeBytes: string;
            tags: {
                name: string;
                id: string;
                userId: string;
            }[];
            category: {
                name: string;
                id: string;
                userId: string;
                createdAt: Date;
                color: string;
                icon: string;
                isDefault: boolean;
            } | null;
            name: string;
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            categoryId: string | null;
            fileKey: string;
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
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string): Promise<{
        fileSizeBytes: string;
        tags: {
            name: string;
            id: string;
            userId: string;
        }[];
        category: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            color: string;
            icon: string;
            isDefault: boolean;
        } | null;
        name: string;
        description: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        categoryId: string | null;
        fileKey: string;
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
    create(userId: string, dto: CreateDocumentDto, file: Express.Multer.File, ipAddress?: string, userAgent?: string): Promise<{
        fileSizeBytes: string;
        tags: {
            name: string;
            id: string;
            userId: string;
        }[];
        category: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            color: string;
            icon: string;
            isDefault: boolean;
        } | null;
        name: string;
        description: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        categoryId: string | null;
        fileKey: string;
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
    findExpiring(userId: string): Promise<{
        fileSizeBytes: string;
        tags: {
            name: string;
            id: string;
            userId: string;
        }[];
        category: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            color: string;
            icon: string;
            isDefault: boolean;
        } | null;
        name: string;
        description: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        categoryId: string | null;
        fileKey: string;
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
    }[]>;
    update(id: string, userId: string, dto: UpdateDocumentDto, ipAddress?: string, userAgent?: string): Promise<{
        fileSizeBytes: string;
        tags: {
            name: string;
            id: string;
            userId: string;
        }[];
        category: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            color: string;
            icon: string;
            isDefault: boolean;
        } | null;
        name: string;
        description: string | null;
        id: string;
        userId: string;
        createdAt: Date;
        categoryId: string | null;
        fileKey: string;
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
    softDelete(id: string, userId: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    restore(id: string, userId: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    permanentDelete(id: string, userId: string): Promise<{
        message: string;
    }>;
    getStats(userId: string): Promise<{
        totalDocs: number;
        expiringDocs: number;
        deletedDocs: number;
        totalCategories: number;
    }>;
}
