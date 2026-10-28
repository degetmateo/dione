import { BaseHttpClient } from '../http/base-http-client';
import { HttpRequestOptions } from '../http/http-client.interface';

export class VndbHttpClient extends BaseHttpClient {
    public constructor() {
        super('VNDB', 12000);
    }

    public async execute<T = any>(url: string, options: HttpRequestOptions = {}): Promise<T> {
        return this.request<T>(url, options);
    }
}

