import { BusinessRuleError } from '../../core/errors/business-rule-error';

export class GachaClaims {
    public static readonly DEFAULT_HOURLY_CLAIMS = 2;
    private readonly count: number;

    constructor(count: number) {
        if (!Number.isInteger(count) || count < 0) {
            this.count = 0;
        } else {
            this.count = count;
        }
    }

    public get value(): number {
        return this.count;
    }

    public canClaim(): boolean {
        return this.count > 0;
    }

    public consume(): GachaClaims {
        if (!this.canClaim()) {
            throw new BusinessRuleError('¡No tienes más claims disponibles en esta hora!', 'OUT_OF_CLAIMS');
        }
        return new GachaClaims(this.count - 1);
    }

    public add(amount: number): GachaClaims {
        if (amount < 0) return this;
        return new GachaClaims(this.count + amount);
    }

    public resetIfUnderLimit(): GachaClaims {
        return this.count < GachaClaims.DEFAULT_HOURLY_CLAIMS
            ? new GachaClaims(GachaClaims.DEFAULT_HOURLY_CLAIMS)
            : this;
    }
}

