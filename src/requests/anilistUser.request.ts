import Anilist from "../services/anilist";
import anilistUserQuery from "./queries/anilistUser.query";

const execute = async (id: string) => {
    const response = await Anilist.query(anilistUserQuery(id));
    return response.User;
};

const anilistUserRequest = {
    execute
};

export default anilistUserRequest;