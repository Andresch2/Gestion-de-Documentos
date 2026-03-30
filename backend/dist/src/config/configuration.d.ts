declare const _default: () => {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    database: {
        url: string | undefined;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        accessExpires: string;
        refreshExpires: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
