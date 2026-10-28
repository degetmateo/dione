import { AppError } from './app-error';

export class DatabaseError extends AppError {
    constructor(detail: string) {
        super({
            message: `Database failure: ${detail}`,
            userMessage: 'Ocurrió un problema temporal al acceder a la base de datos. Por favor, reintenta en unos instantes.',
            code: 'DATABASE_ERROR',
            statusCode: 503,
            isOperational: true,
        });
    }
}

