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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDownloadController = exports.SharedLinksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const storage_service_1 = require("../storage/storage.service");
const create_shared_link_dto_1 = require("./dto/create-shared-link.dto");
const shared_links_service_1 = require("./shared-links.service");
let SharedLinksController = class SharedLinksController {
    constructor(sharedLinksService, storageService) {
        this.sharedLinksService = sharedLinksService;
        this.storageService = storageService;
    }
    async create(userId, dto) {
        return this.sharedLinksService.create(userId, dto);
    }
    async findAll(userId) {
        return this.sharedLinksService.findAll(userId);
    }
    async delete(id, userId) {
        return this.sharedLinksService.delete(id, userId);
    }
    async access(token) {
        return this.sharedLinksService.accessByToken(token);
    }
};
exports.SharedLinksController = SharedLinksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear link compartido' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_shared_link_dto_1.CreateSharedLinkDto]),
    __metadata("design:returntype", Promise)
], SharedLinksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar links compartidos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SharedLinksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revocar link compartido' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SharedLinksController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('access/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Acceder a documento compartido (público)' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SharedLinksController.prototype, "access", null);
exports.SharedLinksController = SharedLinksController = __decorate([
    (0, swagger_1.ApiTags)('Shared Links'),
    (0, common_1.Controller)('shared-links'),
    __metadata("design:paramtypes", [shared_links_service_1.SharedLinksService,
        storage_service_1.StorageService])
], SharedLinksController);
let PublicDownloadController = class PublicDownloadController {
    constructor(sharedLinksService, storageService) {
        this.sharedLinksService = sharedLinksService;
        this.storageService = storageService;
    }
    async publicDownload(id, token, res) {
        const doc = await this.sharedLinksService.publicDownload(id, token);
        const filePath = this.storageService.getFilePath(doc.fileKey);
        res.download(filePath, doc.originalName);
    }
};
exports.PublicDownloadController = PublicDownloadController;
__decorate([
    (0, common_1.Get)(':id/public-download/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Descarga pública de documento compartido' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PublicDownloadController.prototype, "publicDownload", null);
exports.PublicDownloadController = PublicDownloadController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [shared_links_service_1.SharedLinksService,
        storage_service_1.StorageService])
], PublicDownloadController);
//# sourceMappingURL=shared-links.controller.js.map