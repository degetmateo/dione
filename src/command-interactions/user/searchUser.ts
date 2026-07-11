import Anilist from "../../services/anilist";

export default async (id: string) => {
    const QUERY = `
        query  {
            User (id: ${id}) {
                id
                name
                about
                avatar {
                    large
                }
                bannerImage
                options {
                    profileColor
                }
                statistics {
                    anime {
                        statuses {
                            status
                            count
                            meanScore
                        }
                        count
                        meanScore
                        minutesWatched
                        episodesWatched
                        genres {
                            genre
                            count
                            meanScore
                        }
                    }
                    manga {
                        statuses {
                            status
                            count
                            meanScore
                        }
                        count
                        meanScore
                        chaptersRead
                        volumesRead
                        genres {
                            genre
                            count
                            meanScore
                        }
                    }
                }
                siteUrl
                createdAt
            }
        }
    `;

    const response = await Anilist.query(QUERY);
    return response.User;
};