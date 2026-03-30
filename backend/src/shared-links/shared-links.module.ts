import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { StorageModule } from '../storage/storage.module';
import { PublicDownloadController, SharedLinksController } from './shared-links.controller';
import { SharedLinksService } from './shared-links.service';

@Module({
    imports: [StorageModule, AuditModule],
    controllers: [SharedLinksController, PublicDownloadController],
    providers: [SharedLinksService],
    exports: [SharedLinksService],
})
export class SharedLinksModule { }
