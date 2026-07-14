export default (id: string) => {
    return `
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
};