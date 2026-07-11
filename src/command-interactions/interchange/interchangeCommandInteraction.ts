import BChatInputCommandInteraction from "../../extensions/interaction";

export default class InterchangeCommandInteraction {
    private interaction: BChatInputCommandInteraction;

    constructor (interaction: BChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        const subcommandGroup = this.interaction.options.getSubcommandGroup();
        const subcommand = this.interaction.options.getSubcommand();

        console.log('SubcommandGroup: '+subcommandGroup, 'Subcommand: '+subcommand);
    };
};