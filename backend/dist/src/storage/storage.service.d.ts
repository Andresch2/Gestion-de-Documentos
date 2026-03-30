export declare class StorageService {
    private readonly logger;
    private readonly uploadDir;
    constructor();
    getFilePath(fileKey: string): string;
    delete(fileKey: string): Promise<void>;
    exists(fileKey: string): boolean;
}
