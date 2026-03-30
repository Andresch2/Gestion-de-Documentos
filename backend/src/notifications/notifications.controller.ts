import {
    Controller,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Listar notificaciones' })
    async findAll(
        @CurrentUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.notificationsService.findAll(userId, page || 1, limit || 20);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Marcar todas como leídas' })
    async readAll(@CurrentUser('id') userId: string) {
        return this.notificationsService.readAll(userId);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Marcar notificación como leída' })
    async read(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.notificationsService.read(id, userId);
    }
}
