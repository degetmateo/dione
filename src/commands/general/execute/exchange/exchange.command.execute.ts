import ExchangeHelpEmbed from "../../../../builders/embeds/exchangeHelp.embed";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import exchangeCancelCommandExecute from "./exchange.cancel.command.execute";
import exchangeCompleteCommandExecute from "./exchange.complete.command.execute";
import exchangeCreateCommandExecute from "./exchange.create.command.execute";
import exchangeHistoryCommandExecute from "./exchange.history.command.execute";

const exchangeExecute = async (interaction: GuildChatInputCommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'help') {
        return await interaction.reply({
            embeds: [new ExchangeHelpEmbed()]
        });
    };

    if (subcommand === 'create') {
        return await exchangeCreateCommandExecute(interaction);
    };

    if (subcommand === 'complete') {
        return await exchangeCompleteCommandExecute(interaction);
    };

    if (subcommand === 'cancel') {
        return await exchangeCancelCommandExecute(interaction);
    };

    if (subcommand === 'history') {
        return await exchangeHistoryCommandExecute(interaction);
    };
};

export default exchangeExecute;