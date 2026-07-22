import membersRepositoryUpdateMalTokens from "./members.repository.update.malTokens";

const membersRepository = {
    update: {
        mal: {
            tokens: membersRepositoryUpdateMalTokens
        }
    }
};

export default membersRepository;