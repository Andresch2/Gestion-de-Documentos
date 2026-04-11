import { Request, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { StorageService } from '../storage/storage.service';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    private readonly storageService;
    private readonly auditService;
    constructor(documentsService: DocumentsService, storageService: StorageService, auditService: AuditService);
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
    getStats(userId: string): Promise<{
        totalDocs: number;
        expiringDocs: number;
        deletedDocs: number;
        totalCategories: number;
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
    create(userId: string, dto: CreateDocumentDto, file: Express.Multer.File, req: Request): Promise<{
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
    download(id: string, userId: string, req: Request, res: Response): Promise<void>;
    update(id: string, userId: string, dto: UpdateDocumentDto, req: Request): Promise<{
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
    softDelete(id: string, userId: string, req: Request): Promise<{
        message: string;
    }>;
    restore(id: string, userId: string, req: Request): Promise<{
        message: string;
    }>;
    permanentDelete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
