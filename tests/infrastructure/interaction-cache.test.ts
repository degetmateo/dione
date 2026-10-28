import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InteractionStateService } from '../../src/infrastructure/cache/interaction-state.service';

describe('InteractionStateService', () => {
    let service: InteractionStateService;

    beforeEach(() => {
        vi.useFakeTimers();
        service = new InteractionStateService(100);
    });

    afterEach(() => {
        service.clear();
        vi.useRealTimers();
    });

    it('should store data without mutating original object and generate unique key', () => {
        const data = { foo: 'bar' };
        const key = service.set(data);

        expect(key).toBeDefined();
        expect(service.get(key)).toEqual({ foo: 'bar' });
        expect((data as any).key).toBeUndefined(); // Does not mutate original object!
    });

    it('should expire session after timeout', () => {
        const key = service.set({ test: 123 }, 5000);
        expect(service.get(key)).toBeDefined();

        vi.advanceTimersByTime(5001);
        expect(service.get(key)).toBeUndefined();
    });

    it('should update cached data and timer', () => {
        const key = service.set({ counter: 1 }, 10000);
        service.update(key, { counter: 2 }, 15000);

        expect(service.get(key)?.counter).toBe(2);
    });

    it('should delete entry properly', () => {
        const key = service.set({ hello: 'world' });
        expect(service.delete(key)).toBe(true);
        expect(service.get(key)).toBeUndefined();
    });

    it('should consume entry atomically', () => {
        const key = service.set({ secret: 'xyz' });
        const consumed = service.consume(key);

        expect(consumed).toEqual({ secret: 'xyz' });
        expect(service.get(key)).toBeUndefined();
    });

    it('should evict oldest when capacity exceeded', () => {
        const smallService = new InteractionStateService(2);
        const k1 = smallService.set({ id: 1 });
        const k2 = smallService.set({ id: 2 });
        const k3 = smallService.set({ id: 3 });

        expect(smallService.has(k1)).toBe(false);
        expect(smallService.has(k2)).toBe(true);
        expect(smallService.has(k3)).toBe(true);
    });
});
