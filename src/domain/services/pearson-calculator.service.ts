export interface MediaScoreEntry {
    mediaId: number;
    score: number;
}

export class PearsonCalculatorService {
    public static calculate(userAEntries: MediaScoreEntry[], userBEntries: MediaScoreEntry[]): number {
        const mapB = new Map(userBEntries.map(e => [e.mediaId, e.score]));
        const commonPairs: Array<[number, number]> = [];

        for (const entryA of userAEntries) {
            const scoreB = mapB.get(entryA.mediaId);
            if (scoreB != null) {
                commonPairs.push([entryA.score, scoreB]);
            }
        }

        const n = commonPairs.length;
        if (n === 0) return 0;

        const sumA = commonPairs.reduce((acc, [a]) => acc + a, 0);
        const sumB = commonPairs.reduce((acc, [, b]) => acc + b, 0);
        const meanA = sumA / n;
        const meanB = sumB / n;

        let numerator = 0;
        let denominatorA = 0;
        let denominatorB = 0;

        for (const [a, b] of commonPairs) {
            const diffA = a - meanA;
            const diffB = b - meanB;
            numerator += diffA * diffB;
            denominatorA += diffA ** 2;
            denominatorB += diffB ** 2;
        }

        if (denominatorA === 0 || denominatorB === 0) return 0;

        const pearsonCoeff = numerator / Math.sqrt(denominatorA * denominatorB);
        return Math.round(pearsonCoeff * 10000) / 100; // Returns rounded percentage (-100 to 100)
    }
}

