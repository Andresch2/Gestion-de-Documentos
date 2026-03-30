import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ExpiryProcessor } from './processors/expiry.processor';

@Module({
    imports: [StorageModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, ExpiryProcessor],
    exports: [NotificationsService],
})
export class NotificationsModule { }
