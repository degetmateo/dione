import { InteractionStateService } from './interaction-state.service';

export class InteractionCacheService {
    private readonly stateService: InteractionStateService;

    constructor() {
        this.stateService = InteractionStateService.getInstance();
    }

    public set<T>(data: T, expireIn: number = 60_000): string {
        return this.stateService.set(data, expireIn);
    }

    public update<T>(key: string, data: T, expireIn?: number): void {
        this.stateService.update(key, data, expireIn);
    }

    public get<T = any>(key: string): T | undefined {
        return this.stateService.get<T>(key);
    }

    public delete(key: string): void {
        this.stateService.delete(key);
    }

    public consume<T = any>(key: string): T | undefined {
        return this.stateService.consume<T>(key);
    }

    public clear(): void {
        this.stateService.clear();
    }
}
