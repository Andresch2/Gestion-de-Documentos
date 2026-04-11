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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('[SEED] Seeding database...');
    const seedDir = path.join(process.cwd(), 'uploads', 'seed');
    fs.mkdirSync(seedDir, { recursive: true });
    const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF', 'utf-8');
    fs.writeFileSync(path.join(seedDir, 'placeholder.pdf'), minimalPdf);
    console.log('[FILE] Placeholder PDF created');
    const passwordHash = await bcrypt.hash('Demo1234!', 12);
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
    const categoryData = [
        { name: 'Identidad', color: '#4f8ef7', icon: 'Fingerprint' },
        { name: 'Finanzas', color: '#3ecf7a', icon: 'Receipt' },
        { name: 'Salud', color: '#f05252', icon: 'Activity' },
        { name: 'Legal', color: '#9b72f5', icon: 'Scale' },
        { name: 'Propiedad', color: '#f57c42', icon: 'Home' },
    ];
    const categories = [];
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
            expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            categoryId: categories[0].id,
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
            categoryId: categories[1].id,
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
            categoryId: categories[2].id,
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
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            categoryId: categories[3].id,
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
            categoryId: categories[4].id,
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
//# sourceMappingURL=seed.js.map