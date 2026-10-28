import { describe, it, expect } from 'vitest';
import {
    AppError,
    ExternalApiError,
    DatabaseError,
    ValidationError,
    BusinessRuleError,
} from '../../src/core/errors';

describe('AppError Hierarchy', () => {
    it('should create ExternalApiError with friendly user message and service tagging', () => {
        const error = new ExternalApiError('AniList', 'GraphQL 500 error');
        expect(error).toBeInstanceOf(AppError);
        expect(error.service).toBe('AniList');
        expect(error.userMessage).toContain('AniList');
        expect(error.statusCode).toBe(502);
        expect(error.code).toBe('EXTERNAL_API_ERROR_ANILIST');
    });

    it('should create DatabaseError with friendly user message', () => {
        const error = new DatabaseError('connection refused');
        expect(error.userMessage).toContain('base de datos');
        expect(error.statusCode).toBe(503);
        expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should create ValidationError with field information', () => {
        const error = new ValidationError('El precio no puede ser negativo', 'price');
        expect(error.field).toBe('price');
        expect(error.userMessage).toBe('El precio no puede ser negativo');
        expect(error.statusCode).toBe(400);
    });

    it('should create BusinessRuleError with operational flag true', () => {
        const error = new BusinessRuleError('No tienes suficientes renas');
        expect(error.isOperational).toBe(true);
        expect(error.statusCode).toBe(422);
    });
});

