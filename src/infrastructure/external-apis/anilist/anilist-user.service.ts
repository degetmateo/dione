import { AniListHttpClient } from './anilist-http.client';

export class AniListUserService {
    public constructor(private readonly client: AniListHttpClient) {}

    public async searchUser(idOrName: string | number): Promise<any> {
        const param = typeof idOrName === 'number' || /^\d+$/.test(String(idOrName))
            ? `id: ${idOrName}`
            : `search: "${String(idOrName).replace(/"/g, '\\"')}"`;

        const query = `
            query {
                User (${param}) {
                    id name about avatar { large } bannerImage
                    options { profileColor }
                    statistics {
                        anime {
                            statuses { status count meanScore }
                            count meanScore minutesWatched episodesWatched
                            genres { genre count meanScore }
                        }
                        manga {
                            statuses { status count meanScore }
                            count meanScore chaptersRead volumesRead
                            genres { genre count meanScore }
                        }
                    }
                    siteUrl createdAt
                }
            }
        `;
        const res = await this.client.executeQuery<{ User: any }>(query);
        return res.User;
    }

    public async getViewer(token: string): Promise<any> {
        const query = `
            query {
                Viewer {
                    id name siteUrl
                    avatar { large }
                    options { profileColor }
                }
            }
        `;
        const res = await this.client.executeQuery<{ Viewer: any }>(query, token);
        return res.Viewer;
    }

    public async searchEntries(aId: string | number, bId: string | number): Promise<any> {
        const entryFields = 'lists { entries { mediaId score(format: POINT_100) } }';
        const query = `
            query {
                u1_anime: MediaListCollection(userId: ${aId}, type: ANIME, status: COMPLETED) { ${entryFields} }
                u1_manga: MediaListCollection(userId: ${aId}, type: MANGA, status: COMPLETED) { ${entryFields} }
                u2_anime: MediaListCollection(userId: ${bId}, type: ANIME, status: COMPLETED) { ${entryFields} }
                u2_manga: MediaListCollection(userId: ${bId}, type: MANGA, status: COMPLETED) { ${entryFields} }
            }
        `;
        return this.client.executeQuery(query);
    }

    public async searchScores(mediaId: number | string, userIds: Array<string | number>): Promise<any[]> {
        if (!userIds.length) return [];
        const query = `
            query {
                users: Page (page: 1, perPage: 50) {
                    results: mediaList (mediaId: ${mediaId}, userId_in: [${userIds.join(',')}]) {
                        user { id name }
                        progress repeat score (format: POINT_100) status
                    }
                }
            }
        `;
        const res = await this.client.executeQuery<{ users: { results: any[] } }>(query);
        return res.users.results;
    }
}

