import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const logger = new Logger('Bootstrap');
    const expressApp = app.getHttpAdapter().getInstance();

    // Security
    app.use(helmet());
    app.use(cookieParser());

    // CORS
    app.enableCors({
        origin: configService.get<string>('frontendUrl', 'http://localhost:5173'),
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Ensure Prisma BigInt fields can be returned safely in JSON responses.
    expressApp.set('json replacer', (_key: string, value: unknown) =>
        typeof value === 'bigint' ? value.toString() : value,
    );

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Static assets for uploaded files
    app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

    // Swagger
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Gestor de Documentos API')
        .setDescription('API para gestión de documentos personales importantes')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get<number>('port', 3000);
    await app.listen(port);
    logger.log(`🚀 Application running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
