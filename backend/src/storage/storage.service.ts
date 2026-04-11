import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

type StorageProvider = 'local' | 'supabase';

export interface StoredFile {
    buffer: Buffer;
    contentType?: string;
}

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly uploadDir = path.join(process.cwd(), 'uploads');
    private readonly provider: StorageProvider;
    private readonly bucket: string;
    private readonly supabase?: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('storage.supabaseUrl');
        const serviceRoleKey = this.configService.get<string>('storage.serviceRoleKey');
        const hasSupabaseConfig = Boolean(supabaseUrl && serviceRoleKey);
        const requestedProvider = this.configService.get<StorageProvider>(
            'storage.provider',
            hasSupabaseConfig ? 'supabase' : 'local',
        );

        this.provider =
            requestedProvider === 'supabase' && hasSupabaseConfig ? 'supabase' : 'local';
        this.bucket = this.configService.get<string>('storage.bucket', 'documents');

        if (requestedProvider === 'supabase' && this.provider === 'local') {
            this.logger.warn(
                'Supabase Storage no esta configurado completamente. Se usara almacenamiento local.',
            );
        }

        if (this.provider === 'supabase' && supabaseUrl && serviceRoleKey) {
            this.supabase = createClient(supabaseUrl, serviceRoleKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            });
            this.logger.log(`Usando Supabase Storage bucket "${this.bucket}"`);
            return;
        }

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            this.logger.log(`Created uploads directory: ${this.uploadDir}`);
        }
    }

    private getLocalFilePath(fileKey: string): string {
        return path.join(this.uploadDir, fileKey);
    }

    async upload(fileKey: string, fileBuffer: Buffer, contentType: string): Promise<void> {
        if (this.provider === 'local') {
            const filePath = this.getLocalFilePath(fileKey);
            await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
            await fsPromises.writeFile(filePath, fileBuffer);
            this.logger.log(`Stored file locally: ${fileKey}`);
            return;
        }

        const { error } = await this.supabase!.storage.from(this.bucket).upload(fileKey, fileBuffer, {
            contentType,
            upsert: false,
        });

        if (error) {
            this.logger.error(`Failed to upload ${fileKey} to Supabase: ${error.message}`);
            throw new InternalServerErrorException('No se pudo almacenar el archivo');
        }

        this.logger.log(`Stored file in Supabase: ${fileKey}`);
    }

    async download(fileKey: string): Promise<StoredFile> {
        if (this.provider === 'local') {
            const filePath = this.getLocalFilePath(fileKey);
            if (!fs.existsSync(filePath)) {
                throw new NotFoundException('Archivo no encontrado');
            }

            return { buffer: await fsPromises.readFile(filePath) };
        }

        const { data, error } = await this.supabase!.storage.from(this.bucket).download(fileKey);
        if (error || !data) {
            this.logger.error(`Failed to download ${fileKey} from Supabase: ${error?.message}`);
            throw new NotFoundException('Archivo no encontrado');
        }

        const arrayBuffer = await data.arrayBuffer();
        return {
            buffer: Buffer.from(arrayBuffer),
            contentType: data.type,
        };
    }

    async delete(fileKey: string): Promise<void> {
        if (this.provider === 'local') {
            const filePath = this.getLocalFilePath(fileKey);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`Deleted file: ${fileKey}`);
            }
            return;
        }

        const { error } = await this.supabase!.storage.from(this.bucket).remove([fileKey]);
        if (error) {
            this.logger.warn(`Could not delete ${fileKey} from Supabase: ${error.message}`);
            return;
        }

        this.logger.log(`Deleted file from Supabase: ${fileKey}`);
    }

    async exists(fileKey: string): Promise<boolean> {
        if (this.provider === 'local') {
            return fs.existsSync(this.getLocalFilePath(fileKey));
        }

        const normalizedKey = fileKey.replace(/\\/g, '/');
        const segments = normalizedKey.split('/');
        const search = segments.pop();
        const folder = segments.join('/');

        const { data, error } = await this.supabase!.storage.from(this.bucket).list(folder, {
            search,
        });

        if (error) {
            this.logger.warn(`Could not verify existence for ${fileKey}: ${error.message}`);
            return false;
        }

        return Boolean(data?.some((entry) => entry.name === search));
    }
}
