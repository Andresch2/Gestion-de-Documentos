import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            storageUsedBytes: string;
            storageQuotaBytes: string;
        };
    }>;
    refresh(user: any, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(userId: string, res: Response): Promise<{
        message: string;
    }>;
}
