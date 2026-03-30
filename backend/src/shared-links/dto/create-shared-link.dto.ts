import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSharedLinkDto {
    @ApiProperty()
    @IsString()
    documentId: string;

    @ApiPropertyOptional({ example: '24h', description: '1h, 24h, 7d, 30d, or null for no expiry' })
    @IsOptional()
    @IsString()
    expiresIn?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isOneTime?: boolean;
}
