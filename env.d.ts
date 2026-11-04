declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_DATABASE_KEY: string;
            MONGODB_DATABASE_NAME: string;
            TOKEN: string;
            PORT?: string;
            ADMIN_HOST?: string;
            ADMIN_SECRET?: string;
        }
    }
}

export {};
