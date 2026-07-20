import anilist from "../anilist";

const anilistSearchEntries = async (aId: string, bId: string) => {
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

    const response = await anilist.request(query);
    return response;
};

export default anilistSearchEntries;