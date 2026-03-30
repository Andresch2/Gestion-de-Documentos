import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Educación' })
    @IsString()
    @MaxLength(50)
    name: string;

    @ApiPropertyOptional({ example: '#ff6b35' })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional({ example: '📚' })
    @IsOptional()
    @IsString()
    icon?: string;
}

export class UpdateCategoryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    icon?: string;
}

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar categorías del usuario' })
    async findAll(@CurrentUser('id') userId: string) {
        return this.categoriesService.findAll(userId);
    }

    @Post()
    @ApiOperation({ summary: 'Crear categoría' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(userId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar categoría' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, userId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar categoría' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.categoriesService.delete(id, userId);
    }
}
