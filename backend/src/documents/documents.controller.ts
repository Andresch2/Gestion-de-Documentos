import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StorageService } from '../storage/storage.service';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

const ALLOWED_MIMETYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly storageService: StorageService,
        private readonly auditService: AuditService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Listar documentos' })
    async findAll(
        @CurrentUser('id') userId: string,
        @Query() query: QueryDocumentsDto,
    ) {
        return this.documentsService.findAll(userId, query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Estadísticas de documentos' })
    async getStats(@CurrentUser('id') userId: string) {
        return this.documentsService.getStats(userId);
    }

    @Get('expiring')
    @ApiOperation({ summary: 'Documentos por vencer (próximos 60 días)' })
    async findExpiring(@CurrentUser('id') userId: string) {
        return this.documentsService.findExpiring(userId);
    }

    @Post()
    @ApiOperation({ summary: 'Subir documento' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req: any, _file, cb) => {
                    const userId = req.user?.id || 'unknown';
                    const dir = path.join(process.cwd(), 'uploads', userId);
                    fs.mkdirSync(dir, { recursive: true });
                    cb(null, dir);
                },
                filename: (_req, file, cb) => {
                    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
                    cb(null, uniqueName);
                },
            }),
            limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
            fileFilter: (_req, file, cb) => {
                if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Tipo de archivo no permitido'), false);
                }
            },
        }),
    )
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateDocumentDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
    ) {
        if (!file) {
            throw new BadRequestException('El archivo es requerido');
        }
        // Parse tags if sent as JSON string
        if (typeof dto.tags === 'string') {
            try {
                dto.tags = JSON.parse(dto.tags as any);
            } catch {
                dto.tags = [];
            }
        }
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.documentsService.create(userId, dto, file, ip, userAgent);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener documento por ID' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.documentsService.findOne(id, userId);
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Descargar documento' })
    async download(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const doc = await this.documentsService.findOne(id, userId);
        const filePath = this.storageService.getFilePath(doc.fileKey);

        await this.auditService.log({
            userId,
            action: 'DOWNLOAD',
            documentId: id,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
        });

        res.download(filePath, doc.originalName);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar documento' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateDocumentDto,
        @Req() req: Request,
    ) {
        if (typeof dto.tags === 'string') {
            try {
                dto.tags = JSON.parse(dto.tags as any);
            } catch {
                dto.tags = [];
            }
        }
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.documentsService.update(id, userId, dto, ip, userAgent);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar documento (soft delete)' })
    async softDelete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Req() req: Request,
    ) {
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.documentsService.softDelete(id, userId, ip, userAgent);
    }

    @Post(':id/restore')
    @ApiOperation({ summary: 'Restaurar documento' })
    async restore(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Req() req: Request,
    ) {
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.documentsService.restore(id, userId, ip, userAgent);
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Eliminar documento permanentemente' })
    async permanentDelete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.documentsService.permanentDelete(id, userId);
    }
}
