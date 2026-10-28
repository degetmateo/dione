import { ValidationError } from '../../core/errors/validation-error';

export class Renas {
    private readonly amount: number;

    constructor(amount: number) {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new ValidationError('La cantidad de renas debe ser un entero no negativo.', 'renas');
        }
        this.amount = amount;
    }

    public get value(): number {
        return this.amount;
    }

    public add(renas: Renas | number): Renas {
        const toAdd = typeof renas === 'number' ? renas : renas.value;
        return new Renas(this.amount + toAdd);
    }

    public subtract(renas: Renas | number): Renas {
        const toSub = typeof renas === 'number' ? renas : renas.value;
        if (this.amount < toSub) {
            throw new ValidationError('Saldo insuficiente de renas.', 'renas');
        }
        return new Renas(this.amount - toSub);
    }

    public hasEnough(required: Renas | number): boolean {
        const req = typeof required === 'number' ? required : required.value;
        return this.amount >= req;
    }

    public equals(other: Renas): boolean {
        return this.amount === other.amount;
    }
}

