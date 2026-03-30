import {
    Body,
    Controller,
    Get,
    Patch,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
}
