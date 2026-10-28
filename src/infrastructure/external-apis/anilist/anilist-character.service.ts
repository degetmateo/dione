import { AniListHttpClient } from './anilist-http.client';

export class AniListCharacterService {
    public constructor(private readonly client: AniListHttpClient) {}

    private readonly characterFields = `
        id
        name { full userPreferred }
        siteUrl
        age
        bloodType
        description
        favourites
        gender
        image { large medium }
        media {
            nodes {
                id
                favourites
                siteUrl
                title { userPreferred }
            }
        }
    `;

    public async getById(id: number | string): Promise<any> {
        const query = `
            query {
                Character (id: ${id}) {
                    ${this.characterFields}
                }
            }
        `;
        const data = await this.client.executeQuery<{ Character: any }>(query);
        return data.Character;
    }

    public async getByName(name: string): Promise<any> {
        const query = `
            query {
                Character (search: "${name.replace(/"/g, '\\"')}") {
                    ${this.characterFields}
                }
            }
        `;
        const data = await this.client.executeQuery<{ Character: any }>(query);
        return data.Character;
    }
}

