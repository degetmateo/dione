import { AppError } from './app-error';

export class BusinessRuleError extends AppError {
    constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
        super({
            message,
            userMessage: message,
            code,
            statusCode: 422,
            isOperational: true,
        });
    }
}

