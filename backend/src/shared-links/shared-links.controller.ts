import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StorageService } from '../storage/storage.service';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import { SharedLinksService } from './shared-links.service';

@ApiTags('Shared Links')
@Controller('shared-links')
export class SharedLinksController {
    constructor(
        private readonly sharedLinksService: SharedLinksService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear link compartido' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateSharedLinkDto,
    ) {
        return this.sharedLinksService.create(userId, dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar links compartidos' })
    async findAll(@CurrentUser('id') userId: string) {
        return this.sharedLinksService.findAll(userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revocar link compartido' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.sharedLinksService.delete(id, userId);
    }

    @Get('access/:token')
    @ApiOperation({ summary: 'Acceder a documento compartido publico' })
    async access(@Param('token') token: string) {
        return this.sharedLinksService.accessByToken(token);
    }

    @Get('open/:token')
    @ApiOperation({ summary: 'Abrir link compartido publico' })
    async open(@Param('token') token: string, @Res() res: Response) {
        const payload = await this.sharedLinksService.accessByToken(token);
        return res.redirect(payload.downloadUrl);
    }
}

@Controller('documents')
export class PublicDownloadController {
    constructor(
        private readonly sharedLinksService: SharedLinksService,
        private readonly storageService: StorageService,
    ) { }

    @Get(':id/public-download/:token')
    @ApiOperation({ summary: 'Descarga publica de documento compartido' })
    async publicDownload(
        @Param('id') id: string,
        @Param('token') token: string,
        @Res() res: Response,
    ) {
        const doc = await this.sharedLinksService.publicDownload(id, token);
        const storedFile = await this.storageService.download(doc.fileKey);
        res.attachment(doc.originalName);
        res.type(doc.mimeType || storedFile.contentType || 'application/octet-stream');
        res.setHeader('Content-Length', storedFile.buffer.byteLength.toString());
        res.send(storedFile.buffer);
    }
}
