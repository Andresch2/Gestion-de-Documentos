import {
    ConflictException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const DEFAULT_CATEGORIES = [
    { name: 'Identidad', color: '#4f8ef7', icon: 'Fingerprint' },
    { name: 'Finanzas', color: '#3ecf7a', icon: 'Receipt' },
    { name: 'Salud', color: '#f05252', icon: 'Activity' },
    { name: 'Legal', color: '#9b72f5', icon: 'Scale' },
    { name: 'Propiedad', color: '#f57c42', icon: 'Home' },
];

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly auditService: AuditService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('El email ya está registrado');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);
        const isDev = this.configService.get<string>('nodeEnv') === 'development';

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                emailVerifiedAt: isDev ? new Date() : null,
                categories: {
                    create: DEFAULT_CATEGORIES.map((cat) => ({
                        ...cat,
                        isDefault: true,
                    })),
                },
            },
        });

        await this.auditService.log({
            userId: user.id,
            action: 'REGISTER',
        });

        return { message: 'Usuario creado exitosamente' };
    }

    async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.name);

        // Hash and save refresh token
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash },
        });

        // Create security notification
        await this.prisma.notification.create({
            data: {
                userId: user.id,
                type: 'SECURITY_LOGIN',
                message: `Inicio de sesión desde ${ipAddress || 'desconocido'}`,
                data: { ipAddress, userAgent },
            },
        });

        // Audit log
        await this.auditService.log({
            userId: user.id,
            action: 'LOGIN',
            ipAddress,
            userAgent,
        });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                storageUsedBytes: user.storageUsedBytes.toString(),
                storageQuotaBytes: user.storageQuotaBytes.toString(),
            },
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Acceso denegado');
        }

        const refreshTokenValid = await bcrypt.compare(
            refreshToken,
            user.refreshTokenHash,
        );
        if (!refreshTokenValid) {
            throw new UnauthorizedException('Acceso denegado');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.name);

        // Rotate refresh token
        const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash: newRefreshTokenHash },
        });

        return tokens;
    }

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });

        await this.auditService.log({
            userId,
            action: 'LOGOUT',
        });
    }

    private async generateTokens(userId: string, email: string, name: string) {
        const payload = { sub: userId, email, name };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('jwt.secret'),
                expiresIn: this.configService.get<string>('jwt.accessExpires', '15m'),
            }),
            this.jwtService.signAsync(
                { sub: userId },
                {
                    secret: this.configService.get<string>('jwt.refreshSecret'),
                    expiresIn: this.configService.get<string>('jwt.refreshExpires', '7d'),
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }
}
