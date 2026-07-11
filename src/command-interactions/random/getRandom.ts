import Anilist from "../../services/anilist";

export default async (criteria: {
    user_id: string; 
    type: "ANIME" | "MANGA";
}) => {
    const query = `
        query {
            media: Page (page: 1, perPage: 100) {
                results: mediaList (userId: ${criteria.user_id}, status: PLANNING, type: ${criteria.type.toUpperCase()}) {
                    data: media {
                        id idMal
                        title {
                            romaji
                            english
                            native
                            userPreferred
                        }
                        type
                        format
                        status
                        description
                        startDate {
                            year
                            month
                            day
                        }
                        endDate {
                            year
                            month
                            day
                        }
                        season
                        episodes
                        duration
                        chapters
                        volumes
                        source
                        trailer {
                            id
                            site
                            thumbnail
                        }
                        updatedAt
                        coverImage {
                            extraLarge
                            large
                            medium
                            color
                        }
                        bannerImage
                        genres
                        synonyms
                        averageScore
                        meanScore
                        popularity
                        favourites
                        studios {
                            edges {
                                node {
                                    id
                                    name
                                }
                            }
                        }
                        siteUrl
                    }
                }
            }
        }
    `;

    const response = await Anilist.query(query);
    return response.media.results;
};