import GenericError from "../../../errors/genericError";
import mal from "../mal";

const malRequestUser = async (data: {
    id: number;
    token: string;
}) => {
    try {
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