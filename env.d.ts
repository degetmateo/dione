declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_DATABASE_KEY: string;
            MONGODB_DATABASE_NAME: string;

            TOKEN: string;
        }
    }
}

export {};