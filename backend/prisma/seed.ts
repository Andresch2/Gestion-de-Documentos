import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function storeSeedFile(fileKey: string, fileBuffer: Buffer) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

    if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const { error } = await supabase.storage.from(bucket).upload(fileKey, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true,
        });

        if (error) {
            throw error;
        }

        console.log(`[FILE] Placeholder PDF uploaded to Supabase: ${bucket}/${fileKey}`);
        return;
    }

    const seedDir = path.join(process.cwd(), 'uploads', 'seed');
    fs.mkdirSync(seedDir, { recursive: true });
    fs.writeFileSync(path.join(seedDir, 'placeholder.pdf'), fileBuffer);
    console.log('[FILE] Placeholder PDF created locally');
}

async function main() {
    console.log('[SEED] Seeding database...');

    // Create minimal valid PDF file
    const minimalPdf = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF',
        'utf-8',
    );
    await storeSeedFile('seed/placeholder.pdf', minimalPdf);

    // Hash password
    const passwordHash = await bcrypt.hash('Demo1234!', 12);

    // Create demo user
    const user = await prisma.user.upsert({
        where: { email: 'demo@gestordoc.app' },
        update: {},
        create: {
            email: 'demo@gestordoc.app',
            passwordHash,
            name: 'Usuario Demo',
            emailVerifiedAt: new Date(),
        },
    });
    console.log(`[USER] Demo user created: ${user.email}`);

    // Create default categories
    const categoryData = [
        { name: 'Identidad', color: '#4f8ef7', icon: 'Fingerprint' },
        { name: 'Finanzas', color: '#3ecf7a', icon: 'Receipt' },
        { name: 'Salud', color: '#f05252', icon: 'Activity' },
        { name: 'Legal', color: '#9b72f5', icon: 'Scale' },
        { name: 'Propiedad', color: '#f57c42', icon: 'Home' },
    ];

    const categories: any[] = [];
    for (const cat of categoryData) {
        const category = await prisma.category.upsert({
            where: {
                id: `seed-${cat.name.toLowerCase()}`,
            },
            update: {},
            create: {
                id: `seed-${cat.name.toLowerCase()}`,
                userId: user.id,
                name: cat.name,
                color: cat.color,
                icon: cat.icon,
                isDefault: true,
            },
        });
        categories.push(category);
    }
    console.log(`[CAT] ${categories.length} default categories created`);

    // Create demo documents
    const documents = [
        {
            name: 'Pasaporte Colombia',
            description: 'Pasaporte de la República de Colombia',
            fileKey: 'seed/placeholder.pdf',
            fileSizeBytes: BigInt(minimalPdf.length),
            mimeType: 'application/pdf',
            originalName: 'pasaporte-colombia.pdf',
            issuingAuthority: 'Cancillería de Colombia',
            documentNumber: 'AP123456789',
            issueDate: new Date('2022-03-15'),
            expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            categoryId: categories[0].id, // Identidad
        },
        {
            name: 'Declaración de Renta 2024',
            description: 'Declaración de renta año gravable 2024',
            fileKey: 'seed/placeholder.pdf',
            fileSizeBytes: BigInt(minimalPdf.length),
            mimeType: 'application/pdf',
            originalName: 'declaracion-renta-2024.pdf',
            issuingAuthority: 'DIAN',
            documentNumber: 'DR-2024-001',
            issueDate: new Date('2024-08-15'),
            expiryDate: null,
            categoryId: categories[1].id, // Finanzas
        },
        {
            name: 'Historia Clínica',
            description: 'Historia clínica completa',
            fileKey: 'seed/placeholder.pdf',
            fileSizeBytes: BigInt(minimalPdf.length),
            mimeType: 'application/pdf',
            originalName: 'historia-clinica.pdf',
            issuingAuthority: 'Hospital San José',
            documentNumber: 'HC-2024-456',
            issueDate: new Date('2024-01-10'),
            expiryDate: null,
            categoryId: categories[2].id, // Salud
        },
        {
            name: 'Contrato Arrendamiento',
            description: 'Contrato de arrendamiento apartamento',
            fileKey: 'seed/placeholder.pdf',
            fileSizeBytes: BigInt(minimalPdf.length),
            mimeType: 'application/pdf',
            originalName: 'contrato-arrendamiento.pdf',
            issuingAuthority: 'Inmobiliaria ABC',
            documentNumber: 'CA-2024-789',
            issueDate: new Date('2024-06-01'),
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
            categoryId: categories[3].id, // Legal
        },
        {
            name: 'Escritura Apartamento',
            description: 'Escritura pública del apartamento',
            fileKey: 'seed/placeholder.pdf',
            fileSizeBytes: BigInt(minimalPdf.length),
            mimeType: 'application/pdf',
            originalName: 'escritura-apartamento.pdf',
            issuingAuthority: 'Notaría 15 de Bogotá',
            documentNumber: 'EP-2020-123',
            issueDate: new Date('2020-11-20'),
            expiryDate: null,
            categoryId: categories[4].id, // Propiedad
        },
    ];

    for (const doc of documents) {
        await prisma.document.upsert({
            where: {
                id: `seed-${doc.name.toLowerCase().replace(/\s/g, '-')}`,
            },
            update: {},
            create: {
                id: `seed-${doc.name.toLowerCase().replace(/\s/g, '-')}`,
                userId: user.id,
                ...doc,
                scanStatus: 'CLEAN',
            },
        });
    }
    console.log(`[DOC] ${documents.length} demo documents created`);

    // Update storage used
    const totalSize = documents.reduce((acc, d) => acc + Number(d.fileSizeBytes), 0);
    await prisma.user.update({
        where: { id: user.id },
        data: { storageUsedBytes: BigInt(totalSize) },
    });

    console.log('[DONE] Seeding completed!');
    console.log('');
    console.log(' [Login] Demo credentials:');
    console.log('   Email: demo@gestordoc.app');
    console.log('   Password: Demo1234!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
