export interface User {
    id: string;
    email: string;
    name: string;
    storageUsedBytes: string;
    storageQuotaBytes: string;
    createdAt?: string;
}

export interface Category {
    id: string;
    userId: string;
    name: string;
    color: string;
    icon: string;
    isDefault: boolean;
    createdAt: string;
    _count?: {
        documents: number;
    };
}

export interface Tag {
    id: string;
    name: string;
}

export interface Document {
    id: string;
    userId: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    fileKey: string;
    fileSizeBytes: string;
    mimeType: string;
    originalName: string;
    issuingAuthority: string | null;
    documentNumber: string | null;
    issueDate: string | null;
    expiryDate: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    scanStatus: 'PENDING' | 'CLEAN' | 'INFECTED' | 'FAILED';
    createdAt: string;
    updatedAt: string;
    category: Category | null;
    tags: Tag[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DocumentStats {
    totalDocs: number;
    expiringDocs: number;
    deletedDocs: number;
    totalCategories: number;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'EXPIRY_WARNING' | 'UPLOAD_SUCCESS' | 'LINK_ACCESSED' | 'SECURITY_LOGIN';
    message: string;
    data: Record<string, any> | null;
    isRead: boolean;
    createdAt: string;
}

export interface SharedLink {
    id: string;
    documentId: string;
    userId: string;
    token: string;
    expiresAt: string | null;
    isOneTime: boolean;
    accessCount: number;
    accessedAt: string | null;
    createdAt: string;
    document: {
        id: string;
        name: string;
        mimeType: string;
        originalName: string;
    };
    accessUrl?: string;
}

export interface DocumentQueryParams {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    tags?: string;
    startDate?: string;
    endDate?: string;
    isDeleted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
