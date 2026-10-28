import { describe, it, expect } from 'vitest';
import { Renas } from '../../src/domain/value-objects/renas.vo';
import { ColorCode } from '../../src/domain/value-objects/color-code.vo';
import { GachaPulls } from '../../src/domain/value-objects/gacha-pulls.vo';
import { GachaClaims } from '../../src/domain/value-objects/gacha-claims.vo';
import { ValidationError } from '../../src/core/errors/validation-error';
import { BusinessRuleError } from '../../src/core/errors/business-rule-error';

describe('Renas Value Object', () => {
    it('should create valid Renas and prevent negative values', () => {
        const renas = new Renas(50);
        expect(renas.value).toBe(50);
        expect(() => new Renas(-1)).toThrow(ValidationError);
        expect(() => new Renas(1.5)).toThrow(ValidationError);
    });

    it('should correctly add and subtract renas', () => {
        const r1 = new Renas(100);
        const r2 = r1.add(50);
        expect(r2.value).toBe(150);

        const r3 = r2.subtract(new Renas(30));
        expect(r3.value).toBe(120);

        expect(() => r3.subtract(200)).toThrow(ValidationError);
    });
});

describe('ColorCode Value Object', () => {
    it('should validate hex color strings and convert to RGB', () => {
        const color = new ColorCode('#ff8800');
        expect(color.value).toBe('#ff8800');
        expect(color.toRGB()).toEqual([255, 136, 0]);

        const shortColor = new ColorCode('abc');
        expect(shortColor.value).toBe('#abc');
        expect(shortColor.toRGB()).toEqual([170, 187, 204]);

        expect(() => new ColorCode('invalid-hex')).toThrow(ValidationError);
    });
});

describe('GachaPulls and GachaClaims', () => {
    it('should consume pulls and throw when out of pulls', () => {
        let pulls = new GachaPulls(1);
        expect(pulls.canPull()).toBe(true);
        pulls = pulls.consume();
        expect(pulls.value).toBe(0);
        expect(pulls.canPull()).toBe(false);
        expect(() => pulls.consume()).toThrow(BusinessRuleError);
    });

    it('should reset pulls and claims if under limit', () => {
        const pulls = new GachaPulls(5).resetIfUnderLimit();
        expect(pulls.value).toBe(15);

        const claims = new GachaClaims(1).resetIfUnderLimit();
        expect(claims.value).toBe(2);

        const highClaims = new GachaClaims(5).resetIfUnderLimit();
        expect(highClaims.value).toBe(5);
    });
});

