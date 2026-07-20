import anilist from "../anilist";

const anilistSearchMangaByName = async (name: string) => {
    const query = `
        query  {
            Page (perPage: 3) {
                media (search: "${name}", type: MANGA) {
                    ...media
                }
            }    
        }
        
        fragment media on Media {
            id
            idMal
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
    `;

    const data = await anilist.request(query);
    return data.Page;
};

export default anilistSearchMangaByName;