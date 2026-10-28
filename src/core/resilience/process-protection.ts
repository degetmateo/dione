export class ProcessProtection {
    private static isInitialized = false;

    public static initialize(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;

        process.on('unhandledRejection', (reason: unknown) => {
            console.error('💥 [CRASH PREVENTION] Unhandled Promise Rejection:', reason);
        });

        process.on('uncaughtException', (error: Error) => {
            console.error('💥 [CRASH PREVENTION] Uncaught Exception:', error.stack || error);
        });

        process.on('warning', (warning: Error) => {
            console.warn('⚠️ [PROCESS WARNING]:', warning.message);
        });
    }
}

