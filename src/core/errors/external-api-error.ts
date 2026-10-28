import { AppError } from './app-error';

export type ExternalService = 'AniList' | 'MyAnimeList' | 'VNDB' | 'Discord' | 'Unknown';

export class ExternalApiError extends AppError {
    public readonly service: ExternalService;

    constructor(service: ExternalService, message: string, statusCode?: number) {
        const userMsg = `El servicio externo **${service}** no se encuentra disponible o ha devuelto un error. Por favor, inténtalo más tarde.`;
        super({
            message: `[${service}] ${message}`,
            userMessage: userMsg,
            code: `EXTERNAL_API_ERROR_${service.toUpperCase()}`,
            statusCode: statusCode ?? 502,
            isOperational: true,
        });
        this.service = service;
    }
}

