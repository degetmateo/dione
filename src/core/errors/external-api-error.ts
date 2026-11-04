import { AppError } from './app-error';

export type ExternalService = 'AniList' | 'MyAnimeList' | 'VNDB';

export class ExternalApiError extends AppError {
    public readonly service: ExternalService;

    public constructor(
        service: ExternalService,
        technicalMessage: string,
        statusCode: number = 502,
        userMessage?: string
    ) {
        const defaultUserMsg = `El servicio externo **${service}** no se encuentra disponible o ha devuelto un error. Por favor, inténtalo más tarde.`;
        super({
            message: `[${service}] ${technicalMessage}`,
            code: `EXTERNAL_API_ERROR_${service.toUpperCase()}`,
            userMessage: userMessage ?? defaultUserMsg,
            statusCode,
            isOperational: true,
        });
        this.service = service;
    }
}
