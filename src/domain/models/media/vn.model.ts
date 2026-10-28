import { T_VN } from "./vn.types";

export class VnModel {
    constructor(private readonly data: T_VN) {}

    public getId(): string | null {
        return this.data.id || null;
    }

    public getSafeScreenshots(): T_VN['screenshots'] {
        if (!this.data.screenshots || this.data.screenshots.length <= 0) return [];
        return this.data.screenshots.filter(
            s => s.sexual === 0 && s.violence === 0
        );
    }
}

