import anilist from "../anilist";

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

const anilistViewer = async (token: string) => {
    const results = await anilist.authorizedRequest(query, token);
    return results.Viewer;
};

export default anilistViewer;