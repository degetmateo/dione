import anilist from "../anilist";

const anilistSearchScores = async (mediaId: number | string, anilistIds: string[]) => {
    const query = `
        query {
            users: Page (page: 1, perPage: 50) {
                results: mediaList (mediaId: ${mediaId}, userId_in: [${anilistIds.join(',')}]) {
                    user {
                        id
                        name
                    }
                    progress
                    repeat
                    score (format: POINT_100)
                    status
                }
            }
        }
    `;

    const response = await anilist.request(query);
    return response.users.results;
};

export default anilistSearchScores;