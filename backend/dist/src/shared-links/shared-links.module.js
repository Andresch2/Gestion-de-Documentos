"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedLinksModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../audit/audit.module");
const storage_module_1 = require("../storage/storage.module");
const shared_links_controller_1 = require("./shared-links.controller");
const shared_links_service_1 = require("./shared-links.service");
let SharedLinksModule = class SharedLinksModule {
};
exports.SharedLinksModule = SharedLinksModule;
exports.SharedLinksModule = SharedLinksModule = __decorate([
    (0, common_1.Module)({
        imports: [storage_module_1.StorageModule, audit_module_1.AuditModule],
        controllers: [shared_links_controller_1.SharedLinksController, shared_links_controller_1.PublicDownloadController],
        providers: [shared_links_service_1.SharedLinksService],
        exports: [shared_links_service_1.SharedLinksService],
    })
], SharedLinksModule);
//# sourceMappingURL=shared-links.module.js.map