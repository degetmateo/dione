import { IButtonHandler } from './button.interface';

export class ButtonRegistry {
    private readonly buttons = new Map<string, IButtonHandler>();

    public register(handler: IButtonHandler): void {
        this.buttons.set(handler.id, handler);
    }

    public registerAll(handlers: IButtonHandler[]): void {
        for (const handler of handlers) {
            this.register(handler);
        }
    }

    public get(id: string): IButtonHandler | undefined {
        return this.buttons.get(id);
    }

    public has(id: string): boolean {
        return this.buttons.has(id);
    }

    public getAll(): IButtonHandler[] {
        return Array.from(this.buttons.values());
    }

    public size(): number {
        return this.buttons.size;
    }
}

