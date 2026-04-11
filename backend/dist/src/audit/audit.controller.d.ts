import { QueryAuditDto } from './dto/query-audit.dto';
import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(userId: string, query: QueryAuditDto): Promise<{
        data: ({
            document: {
                name: string;
                id: string;
            } | null;
        } & {
            action: import(".prisma/client").$Enums.AuditAction;
            documentId: string | null;
            id: string;
            userId: string;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
