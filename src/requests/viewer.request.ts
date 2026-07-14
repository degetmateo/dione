import Anilist from "../services/anilist";

const query = `
    query {
        Viewer {
            id
            name
            siteUrl
            avatar {
                large
            }
            options {
                profileColor                    
            }   
        }
    }
`;

const execute = async (token: string) => {
    const results = await Anilist.authorizedQuery(query, token);
    return results.Viewer;
};

const viewerRequest = {
    query,
    execute
};

export default viewerRequest;