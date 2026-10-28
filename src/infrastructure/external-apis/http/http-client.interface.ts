export interface HttpRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeoutMs?: number;
}

export interface IHttpClient {
    request<T = any>(url: string, options?: HttpRequestOptions): Promise<T>;
    get<T = any>(url: string, headers?: Record<string, string>): Promise<T>;
    post<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T>;
}

