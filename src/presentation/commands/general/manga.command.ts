import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { MangaSearchHandler } from './media/manga-search.handler';

export class MangaCommand extends BaseSlashCommand {
    public readonly name = 'manga';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('manga')
        .setDescription('Search for a manga.')
        .setDescriptionLocalization('es-ES', 'Buscar un manga.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addStringOption(option =>
            option
                .setName('name-or-id')
                .setNameLocalization('es-ES', 'nombre-o-id')
                .setDescription('Name or ID of the manga.')
                .setDescriptionLocalization('es-ES', 'Nombre o ID del manga.')
                .setRequired(true)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await MangaSearchHandler.handle(interaction);
    }
}

