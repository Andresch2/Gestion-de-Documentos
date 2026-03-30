"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                categories: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: {
                        documents: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const { passwordHash, refreshTokenHash, ...result } = user;
        return {
            ...result,
            storageUsedBytes: result.storageUsedBytes.toString(),
            storageQuotaBytes: result.storageQuotaBytes.toString(),
        };
    }
    async update(userId, dto) {
        if (dto.email) {
            const existing = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id: userId } },
            });
            if (existing) {
                throw new common_1.ConflictException('El email ya está en uso');
            }
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
        });
        const { passwordHash, refreshTokenHash, ...result } = user;
        return {
            ...result,
            storageUsedBytes: result.storageUsedBytes.toString(),
            storageQuotaBytes: result.storageQuotaBytes.toString(),
        };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('La contraseña actual es incorrecta');
        }
        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        return { message: 'Contraseña actualizada exitosamente' };
    }
    async exportData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                documents: {
                    where: { isDeleted: false },
                    include: {
                        category: true,
                        tags: { include: { tag: true } },
                    },
                },
                categories: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const { passwordHash, refreshTokenHash, ...userData } = user;
        return {
            exportedAt: new Date().toISOString(),
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                createdAt: userData.createdAt,
            },
            categories: userData.categories,
            documents: userData.documents.map((doc) => ({
                id: doc.id,
                name: doc.name,
                description: doc.description,
                mimeType: doc.mimeType,
                originalName: doc.originalName,
                issuingAuthority: doc.issuingAuthority,
                documentNumber: doc.documentNumber,
                issueDate: doc.issueDate,
                expiryDate: doc.expiryDate,
                category: doc.category?.name,
                tags: doc.tags.map((t) => t.tag.name),
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map