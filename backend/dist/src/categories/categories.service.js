"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.category.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        documents: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async create(userId, data) {
        const name = data.name?.trim();
        if (!name)
            throw new common_1.BadRequestException('El nombre de la categoria es obligatorio');
        const exists = await this.prisma.category.findFirst({
            where: {
                userId,
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
        });
        if (exists) {
            throw new common_1.ConflictException('Ya existe una categoria con ese nombre');
        }
        return this.prisma.category.create({
            data: {
                userId,
                name,
                color: data.color || '#4f8ef7',
                icon: data.icon || 'Folder',
            },
        });
    }
    async update(id, userId, data) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Categoria no encontrada');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException();
        const name = data.name?.trim();
        if (data.name !== undefined && !name) {
            throw new common_1.BadRequestException('El nombre de la categoria es obligatorio');
        }
        if (name && name.toLowerCase() !== category.name.toLowerCase()) {
            const exists = await this.prisma.category.findFirst({
                where: {
                    userId,
                    name: {
                        equals: name,
                        mode: 'insensitive',
                    },
                    NOT: { id },
                },
            });
            if (exists) {
                throw new common_1.ConflictException('Ya existe una categoria con ese nombre');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: {
                ...data,
                name: name ?? data.name,
            },
        });
    }
    async delete(id, userId) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Categoria no encontrada');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.document.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
        });
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Categoria eliminada' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map