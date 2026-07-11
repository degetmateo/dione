import Anilist from "../../services/anilist";

export default async (aId: string, bId: string) => {
    const query = `
        query {
            u1_anime: MediaListCollection(userId: ${aId}, type: ANIME, status: COMPLETED) {
                lists {
                    entries {
                        mediaId
                        score(format: POINT_100)
                    }
                }
            }

            u1_manga: MediaListCollection(userId: ${aId}, type: MANGA, status: COMPLETED) {
                lists {
                    entries {
                        mediaId
                        score(format: POINT_100)
                    }
                }
            }

            u2_anime: MediaListCollection(userId: ${bId}, type: ANIME, status: COMPLETED) {
                lists {
                    entries {
                        mediaId
                        score(format: POINT_100)
                    }
                }
            }

            u2_manga: MediaListCollection(userId: ${bId}, type: MANGA, status: COMPLETED) {
                lists {
                    entries {
                        mediaId
                        score(format: POINT_100)
                    }
                }
            }
        }
    `;

    const response = await Anilist.query(query);
    return response;
};