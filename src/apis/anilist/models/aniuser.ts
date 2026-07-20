export default class Aniuser {
    public data: any;
    
    constructor (data: any) {
        this.data = data;
    };

    getName (): string {
        return this.data.name;
    };

    getSiteURL (): string {
        return this.data.siteUrl;
    }

    getAvatarURL (): string {
        return this.data.avatar.large || this.data.avatar.medium;
    };

    getBannerURL (): string {
        return this.data.bannerImage;
    };

    getCreatedAt (): Date {
        return new Date(this.data.createdAt * 1000)
    };

    getProfileColor () {
        return this.data.options.profileColor;
    };

    getAnimeCount (): number {
        return this.data.statistics.anime.count;
    };

    getAnimeEpisodesWatched (): number {
        return (this.data.statistics.anime.episodesWatched);
    };

    getAnimeHoursWatched (): number {
        return (this.data.statistics.anime.minutesWatched / 60);
    };

    getAnimeMeanScore (): number {
        return this.data.statistics.anime.meanScore;
    };

    getMangaCount (): number {
        return this.data.statistics.manga.count;
    };

    getMangaVolumesRead (): number {
        return this.data.statistics.manga.volumesRead;
    };

    getMangaChaptersRead (): number {
        return this.data.statistics.manga.chaptersRead;
    };

    getMangaMeanScore (): number {
        return this.data.statistics.manga.meanScore;
    };

    getGenres (): Array<{
        genre: string;
        count: number;
        meanScore: number;
    }> {
        const animeGenres = this.data.statistics.anime.genres;
        const mangaGenres = this.data.statistics.manga.genres;

        const genres: Array<{
            genre: string;
            count: number;
            meanScore: number;
        }> = JSON.parse(JSON.stringify(animeGenres));

        for (const mangaGenre of mangaGenres) {
            const genre = genres.find(g => g.genre === mangaGenre.genre);
            
            if (!genre) {
                 genres.push(mangaGenre);
                 continue;
            };

            genre.count += mangaGenre.count;
            genre.meanScore = (genre.meanScore + mangaGenre.meanScore) / 2;
        };

        return JSON.parse(JSON.stringify(genres));
    };

    getGenresSortedByCount (): Array<{
        genre: string;
        count: number;
        meanScore: number;
    }> {
        const genres = this.getGenres();
        return genres.sort((a, b) => b.count - a.count);
    };

    getGenresSortedByMeanScore (): Array<{
        genre: string;
        count: number;
        meanScore: number;
    }> {
        const genres = this.getGenres();
        return genres.sort((a, b) => b.meanScore - a.meanScore);
    };

    getMeanScore (): number {
        return (this.getAnimeMeanScore() + this.getMangaMeanScore()) / 2;
    };

    getGenresSortedByBayesianScore (): Array<{
        genre: string;
        count: number;
        meanScore: number;
        bayesianScore: number;
    }> {
        const genres = this.getGenres();
        const mean = this.getMeanScore();
        const C = 5;

        const bayesianGenres = (genres.map(genre => {
            const score = (C * mean + genre.meanScore * genre.count) / (C + genre.count);
            
            return {
                ...genre,
                bayesianScore: score
            };
        }));

        return bayesianGenres.sort((a, b) => b.bayesianScore - a.bayesianScore);
    };

    getMostConsumedGenre (): {
        genre: string;
        count: number;
        meanScore: number;
    } {
        return this.getGenresSortedByCount()[0] || null;
    };

    getLeastConsumedGenre (): {
        genre: string;
        count: number;
        meanScore: number;
    } {
        const genres = this.getGenresSortedByCount();
        return genres[genres.length - 1] || null;
    };

    getBestRatedGenre (): {
        genre: string;
        count: number;
        meanScore: number;
    } {
        return this.getGenresSortedByMeanScore()[0] || null;
    };

    getWorstRatedGenre (): {
        genre: string;
        count: number;
        meanScore: number;
    } {
        const genres = this.getGenresSortedByMeanScore();
        return genres[genres.length - 1] || null;
    };

    getBestRatedGenreByBayesianScore (): {
        genre: string;
        count: number;
        meanScore: number;
        bayesianScore: number;
    } {
        return this.getGenresSortedByBayesianScore()[0] || null;
    };

    getWorstRatedGenreByBayesianScore (): {
        genre: string;
        count: number;
        meanScore: number;
        bayesianScore: number;
    } {
        const genres = this.getGenresSortedByBayesianScore();
        return genres[genres.length - 1] || null;
    };
};