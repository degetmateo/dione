import { BusinessRuleError } from '../../core/errors/business-rule-error';

export class GachaPulls {
    public static readonly DEFAULT_HOURLY_PULLS = 15;
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

    public canPull(): boolean {
        return this.count > 0;
    }

    public consume(): GachaPulls {
        if (!this.canPull()) {
            throw new BusinessRuleError('¡No tienes más pulls disponibles en esta hora!', 'OUT_OF_PULLS');
        }
        return new GachaPulls(this.count - 1);
    }

    public add(amount: number): GachaPulls {
        if (amount < 0) return this;
        return new GachaPulls(this.count + amount);
    }

    public resetIfUnderLimit(): GachaPulls {
        return this.count < GachaPulls.DEFAULT_HOURLY_PULLS
            ? new GachaPulls(GachaPulls.DEFAULT_HOURLY_PULLS)
            : this;
    }
}

