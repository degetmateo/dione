import { describe, it, expect } from 'vitest';
import { ProcessProtection } from '../../src/core/resilience/process-protection';

describe('ProcessProtection', () => {
    it('should initialize process listeners without throwing', () => {
        expect(() => ProcessProtection.initialize()).not.toThrow();
        // calling again should be idempotent
        expect(() => ProcessProtection.initialize()).not.toThrow();
    });
});

