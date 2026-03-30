import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            this.logger.log(`Created uploads directory: ${this.uploadDir}`);
        }
    }

    getFilePath(fileKey: string): string {
        return path.join(this.uploadDir, fileKey);
    }

    async delete(fileKey: string): Promise<void> {
        const filePath = this.getFilePath(fileKey);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            this.logger.log(`Deleted file: ${fileKey}`);
        }
    }

    exists(fileKey: string): boolean {
        return fs.existsSync(this.getFilePath(fileKey));
    }
}
