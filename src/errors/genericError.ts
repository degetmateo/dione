export default class GenericError extends Error {
    public status: number;
    constructor (message?: string, status?: number) {
        super(message || 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.');
        this.status = status || 500;
    };
};