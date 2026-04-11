export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    database: {
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL,
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    storage: {
        provider: process.env.STORAGE_PROVIDER || 'local',
        supabaseUrl: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        bucket: process.env.SUPABASE_STORAGE_BUCKET || 'documents',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
        refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    smtp: {
        host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'GestorDoc <noreply@gestordoc.app>',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
});
