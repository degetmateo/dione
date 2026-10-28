export abstract class AppError extends Error {
    public readonly isOperational: boolean;
    public readonly code: string;
    public readonly userMessage: string;
    public readonly statusCode: number;

    constructor(options: {
        message: string;
        userMessage?: string;
        code?: string;
        statusCode?: number;
        isOperational?: boolean;
    }) {
        super(options.message);
        this.name = this.constructor.name;
        this.userMessage = options.userMessage ?? options.message;
        this.code = options.code ?? 'INTERNAL_ERROR';
        this.statusCode = options.statusCode ?? 500;
        this.isOperational = options.isOperational ?? true;

        Error.captureStackTrace(this, this.constructor);
    }
}

