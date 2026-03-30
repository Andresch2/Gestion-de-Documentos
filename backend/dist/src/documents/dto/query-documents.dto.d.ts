export declare class QueryDocumentsDto {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    tags?: string;
    isDeleted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
