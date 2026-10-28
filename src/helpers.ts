import { RGBTuple } from "discord.js";
import { PearsonCalculatorService } from "./domain/services/pearson-calculator.service";

export default class Helpers {
    public static readonly STRING_WITHOUT_HTML: RegExp = /(<([^>]+)>|&\w+;)/gi;

    public static isNumber(args: string): boolean {
        return !(isNaN(+args) || isNaN(parseFloat(args)));
    }

    public static clearHTML(text: string): string {
        if (!text || text.length <= 0) return '';
        return text.replace(this.STRING_WITHOUT_HTML, '');
    }

    public static deleteRepeatedElements<T>(arr: T[]): T[] {
        const set = new Set(arr.map(e => JSON.stringify(e)));
        return Array.from(set).map(e => JSON.parse(e));
    }

    public static ponderedMean(count: number, mean: number, total: number): number {
        return ((count / (count + total)) * mean) + ((total / (count + total)) * 41);
    }

    public static capitalizeText(text: string): string {
        return text.split(' ').map(word => this.capitalizeWord(word)).join(' ');
    }

    public static capitalizeWord(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    public static pearson(
        a: Array<{ mediaId: number; score: number }>, 
        b: Array<{ mediaId: number; score: number }>
    ): number {
        return PearsonCalculatorService.calculate(a, b);
    }

    public static getRandomElement<T>(arr: T[]): T | undefined {
        if (arr.length === 0) return undefined;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    public static getRandomRGBTuple(): RGBTuple {
        const R = Math.floor(Math.random() * 256);
        const G = Math.floor(Math.random() * 256);
        const B = Math.floor(Math.random() * 256);
        return [R, G, B];
    }

    public static hasPassedMoreThanAMonth(a: Date, b: Date): boolean {
        const start = new Date(a);
        const end = new Date(b);
        if (end <= start) return false;
        const limit = new Date(start);
        limit.setMonth(limit.getMonth() + 1);
        return end > limit;
    }

    public static hexToRgb(hex: string): RGBTuple {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const R = parseInt(hex.substring(0, 2), 16);
        const G = parseInt(hex.substring(2, 4), 16);
        const B = parseInt(hex.substring(4, 6), 16);
        if (isNaN(R) || isNaN(G) || isNaN(B)) return [0, 0, 0] as RGBTuple;
        return [R, G, B] as RGBTuple; 
    }
}
