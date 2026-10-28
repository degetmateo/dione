import { AppError } from './app-error';

export class ValidationError extends AppError {
    public readonly field?: string;

    constructor(message: string, field?: string) {
        super({
            message: field ? `Validation failed for '${field}': ${message}` : message,
            userMessage: message,
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            isOperational: true,
        });
        this.field = field;
    }
}

