import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
    async getMe(@CurrentUser('id') userId: string) {
        return this.usersService.findMe(userId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Actualizar perfil' })
    async updateMe(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(userId, dto);
    }

    @Patch('me/password')
    @ApiOperation({ summary: 'Cambiar contraseña' })
    async changePassword(
        @CurrentUser('id') userId: string,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.usersService.changePassword(userId, dto);
    }

    @Get('me/export')
    @ApiOperation({ summary: 'Exportar datos del usuario' })
    async exportData(
        @CurrentUser('id') userId: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const data = await this.usersService.exportData(userId);
        const dateStr = new Date().toISOString().split('T')[0];
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="gestordoc-export-${dateStr}.json"`,
        );
        return data;
    }

    @Delete('me')
    @ApiOperation({ summary: 'Eliminar cuenta' })
    async remove(@CurrentUser('id') userId: string) {
        return this.usersService.remove(userId);
    }

    @Post('me/avatar')
    @ApiOperation({ summary: 'Subir avatar de perfil' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @CurrentUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('El archivo es requerido');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('El archivo debe ser una imagen');
        }
        return this.usersService.uploadAvatar(userId, file);
    }

    @Get(':id/avatar')
    @ApiOperation({ summary: 'Obtener avatar de usuario' })
    async getAvatar(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const user = await this.usersService.findMe(id);
        if (!user.avatarUrl) throw new NotFoundException('Avatar no encontrado');
        
        try {
            const storedFile = await this.usersService.getAvatar(user.avatarUrl);
            res.type(storedFile.contentType || 'image/jpeg');
            res.send(storedFile.buffer);
        } catch(e) {
            throw new NotFoundException('Avatar no encontrado');
        }
    }
}
