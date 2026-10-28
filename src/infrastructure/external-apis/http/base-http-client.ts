import { IHttpClient, HttpRequestOptions } from './http-client.interface';
import { ExternalApiError, ExternalService } from '../../../core/errors';

export abstract class BaseHttpClient implements IHttpClient {
    public constructor(
        protected readonly serviceName: ExternalService,
        protected readonly defaultTimeoutMs: number = 10000
    ) {}

    protected getDefaultHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    public async get<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'GET', headers });
    }

    public async post<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'POST', body, headers });
    }

    public async request<T = any>(url: string, options: HttpRequestOptions = {}): Promise<T> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.defaultTimeoutMs);

        try {
            const headers = { ...this.getDefaultHeaders(), ...(options.headers ?? {}) };
            const reqInit: RequestInit = {
                method: options.method ?? 'GET',
                headers,
                signal: controller.signal,
            };

            if (options.body !== undefined) {
                reqInit.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
            }

            const response = await fetch(url, reqInit);
            return await this.handleResponse<T>(response);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new ExternalApiError(this.serviceName, `Timeout after ${options.timeoutMs ?? this.defaultTimeoutMs}ms`, 504);
            }
            if (error instanceof ExternalApiError) {
                throw error;
            }
            throw new ExternalApiError(this.serviceName, error.message || 'Connection error');
        } finally {
            clearTimeout(timeout);
        }
    }

    protected async handleResponse<T>(response: Response): Promise<T> {
        let data: any;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            const message = data?.message || data?.msg || data?.errors?.[0]?.message || response.statusText;
            throw new ExternalApiError(this.serviceName, message, response.status);
        }
        return data as T;
    }
}
