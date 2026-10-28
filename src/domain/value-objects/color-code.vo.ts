import { ValidationError } from '../../core/errors/validation-error';

export type RGBTuple = [number, number, number];

export class ColorCode {
    private static readonly HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    private readonly hex: string;

    constructor(hex: string) {
        const trimmed = hex.trim();
        if (!ColorCode.HEX_REGEX.test(trimmed)) {
            throw new ValidationError('El código de color debe ser un hexadecimal válido (ej: #FF8800).', 'color');
        }
        this.hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    }

    public get value(): string {
        return this.hex;
    }

    public toRGB(): RGBTuple {
        let cleanHex = this.hex.replace(/^#/, '');
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(c => c + c).join('');
        }
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return [r, g, b];
    }

    public static random(): ColorCode {
        const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        return new ColorCode(`#${r}${g}${b}`);
    }
}

