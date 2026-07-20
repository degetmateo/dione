import anilist from "../anilist";

const anilistSearchMangaById = async (id: string | number) => {
    const query = `
        query  {
            Media (id: ${id}, type: MANGA) {
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
                tags {
                    name
                    isMediaSpoiler
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
    `;

    const data = await anilist.request(query);
    return data.Media;
};

export default anilistSearchMangaById;