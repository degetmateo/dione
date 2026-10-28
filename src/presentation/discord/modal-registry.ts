import { IModalHandler } from './modal.interface';

export class ModalRegistry {
    private readonly modals = new Map<string, IModalHandler>();

    public register(handler: IModalHandler): void {
        this.modals.set(handler.id, handler);
    }

    public registerAll(handlers: IModalHandler[]): void {
        for (const handler of handlers) {
            this.register(handler);
        }
    }

    public get(id: string): IModalHandler | undefined {
        return this.modals.get(id);
    }

    public has(id: string): boolean {
        return this.modals.has(id);
    }

    public getAll(): IModalHandler[] {
        return Array.from(this.modals.values());
    }

    public size(): number {
        return this.modals.size;
    }
}

