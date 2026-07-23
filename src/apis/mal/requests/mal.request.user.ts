import GenericError from "../../../errors/genericError";
import mal from "../mal";

const malRequestUser = async (data: {
    id: number;
    token: string;
}) => {
    try {
        // const useruri = `https://api.myanimelist.net/v2/users/@me`;
        // const maluserData: any = await mal.request(useruri, options);
        
        // const userUri = `https://api.jikan.moe/v4/users/userbyid/${data.id}`;
        // const maluser: any = await mal.request(userUri, options);

        // const statisticsUri = `https://api.jikan.moe/v4/users/${maluserData.name}/full`;
        // const statistics = await mal.request(statisticsUri, options);

        const uri = `https://api.myanimelist.net/v2/users/@me?fields=anime_statistics`;
        
        const options = {
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + data.token
            }
        };

        return await mal.request(uri, options);
    } catch (error) {
        console.error(error);
        if (error instanceof GenericError) throw error;
        else throw new GenericError();
    };
};

export default malRequestUser;