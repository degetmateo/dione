import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import toHex from 'colornames';
import mongo from "../../../../database/mongo";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";

const exchangeHistoryCommandExecute = async (interaction: GuildChatInputCommandInteraction) => {
    const user = interaction.options.getUser('member', false) || interaction.user;
    
    const res = await interaction.deferReply();

    const members = mongo.collection('members');
    const member = await members.findOne({ discord_id: user.id });

    if (!member) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`<@${user.id}> no está registrado. Debe usar \`/setup\` para crear su perfil.`)]
        });
    };

    const exchanges = member.exchanges;
    const history: Array<any> = exchanges.history;

    if (!history || history.length <= 0) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`<@${user.id}> aún no ha completado ningún intercambio.`)]
        });
    };

    const row = new ActionRowBuilder<ButtonBuilder>();
    row.addComponents([
        new ButtonBuilder()
            .setCustomId(`exchange-history-back-button`)
            .setLabel('Anterior')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`exchange-history-next-button`)
            .setLabel('Siguiente')
            .setStyle(ButtonStyle.Secondary),    
    ]);

    const values = history.map((h) => {
        const members = h.members;
        const a = members.a;
        const b = members.b;

        const value = 
            `<@${b.discord_id}> - ${h.created_at.toLocaleDateString()}\n` +
            `▸ [${a.media.name}](https://anilist.co/${a.media.type}/${a.media.id})\n` +
            `◂ [${b.media.name}](https://anilist.co/${b.media.type}/${b.media.id})`

        return value;
    });

    let embeds: EmbedBuilder[] = [];
    const ITEMS_PER_PAGE = 5; 

    for (let i = 0; i < values.length; i += ITEMS_PER_PAGE) {
        const currentChunk = values.slice(i, i + ITEMS_PER_PAGE);

        const pageDescription = currentChunk.join('\n\n');

        const currentPage = Math.floor(i / ITEMS_PER_PAGE) + 1;
        const totalPages = Math.ceil(values.length / ITEMS_PER_PAGE);

        const pageEmbed = new EmbedBuilder()
            .setTitle('Historial de Intercambios')
            .setDescription(pageDescription)
            .setColor('Blurple')
            .setFooter({ text: `Página ${currentPage} de ${totalPages}` });

        embeds.push(pageEmbed);
    }

    let index = 0;

    await interaction.editReply({
        embeds: [embeds[index]],
        components: [row]
    });

    const collector = res.createMessageComponentCollector({ time: 120_000 });

    collector.on('collect', async (button: ButtonInteraction) => {
        try {
            if (button.customId === 'exchange-history-next-button') {
                index = index + 1;
                if (index > embeds.length - 1) index = 0;
            };
    
            if (button.customId === 'exchange-history-back-button') {
                index = index - 1;
                if (index < 0) index = embeds.length - 1;
            };

            await button.update({
                embeds: [embeds[index]],
                components: [row]
            });
        } catch (error) {
            console.error(error);
        };
    });
};

export default exchangeHistoryCommandExecute;