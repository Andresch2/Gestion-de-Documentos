import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDocumentDto {
    @ApiProperty({ example: 'Pasaporte Colombia' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    expiryDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    issueDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    issuingAuthority?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    documentNumber?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
