import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'usuario@ejemplo.com' })
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @ApiProperty({ example: 'MiPassword123' })
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
    @MaxLength(100)
    password: string;

    @ApiProperty({ example: 'Juan Pérez' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;
}
