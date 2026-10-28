export interface GenreStats {
    genre: string;
    count: number;
    meanScore: number;
    bayesianScore?: number;
}

export class AniuserModel {
    constructor(public data: any) {}

    public getName(): string { return this.data.name; }
    public getSiteURL(): string { return this.data.siteUrl; }
    public getAvatarURL(): string { return this.data.avatar.large || this.data.avatar.medium; }
    public getBannerURL(): string { return this.data.bannerImage; }
    public getCreatedAt(): Date { return new Date(this.data.createdAt * 1000); }
    public getProfileColor() { return this.data.options.profileColor; }
    public getAnimeCount(): number { return this.data.statistics.anime.count; }
    public getAnimeEpisodesWatched(): number { return this.data.statistics.anime.episodesWatched; }
    public getAnimeHoursWatched(): number { return this.data.statistics.anime.minutesWatched / 60; }
    public getAnimeMeanScore(): number { return this.data.statistics.anime.meanScore; }
    public getMangaCount(): number { return this.data.statistics.manga.count; }
    public getMangaVolumesRead(): number { return this.data.statistics.manga.volumesRead; }
    public getMangaChaptersRead(): number { return this.data.statistics.manga.chaptersRead; }
    public getMangaMeanScore(): number { return this.data.statistics.manga.meanScore; }
    public getMeanScore(): number { return (this.getAnimeMeanScore() + this.getMangaMeanScore()) / 2; }

    public getGenres(): GenreStats[] {
        const genres: GenreStats[] = JSON.parse(JSON.stringify(this.data.statistics.anime.genres));
        for (const mg of this.data.statistics.manga.genres) {
            const found = genres.find(g => g.genre === mg.genre);
            if (!found) {
                genres.push({ ...mg });
            } else {
                found.count += mg.count;
                found.meanScore = (found.meanScore + mg.meanScore) / 2;
            }
        }
        return genres;
    }

    public getGenresSortedByCount(): GenreStats[] {
        return this.getGenres().sort((a, b) => b.count - a.count);
    }

    public getGenresSortedByMeanScore(): GenreStats[] {
        return this.getGenres().sort((a, b) => b.meanScore - a.meanScore);
    }

    public getGenresSortedByBayesianScore(): GenreStats[] {
        const genres = this.getGenres();
        const mean = this.getMeanScore();
        const C = 5;
        return genres.map(g => ({
            ...g,
            bayesianScore: (C * mean + g.meanScore * g.count) / (C + g.count)
        })).sort((a, b) => (b.bayesianScore ?? 0) - (a.bayesianScore ?? 0));
    }

    public getMostConsumedGenre(): GenreStats | null { return this.getGenresSortedByCount()[0] || null; }
    public getLeastConsumedGenre(): GenreStats | null {
        const g = this.getGenresSortedByCount();
        return g[g.length - 1] || null;
    }
    public getBestRatedGenre(): GenreStats | null { return this.getGenresSortedByMeanScore()[0] || null; }
    public getWorstRatedGenre(): GenreStats | null {
        const g = this.getGenresSortedByMeanScore();
        return g[g.length - 1] || null;
    }
    public getBestRatedGenreByBayesianScore(): GenreStats | null { return this.getGenresSortedByBayesianScore()[0] || null; }
    public getWorstRatedGenreByBayesianScore(): GenreStats | null {
        const g = this.getGenresSortedByBayesianScore();
        return g[g.length - 1] || null;
    }
}

