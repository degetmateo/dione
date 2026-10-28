import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { AnimeSearchHandler } from './media/anime-search.handler';

export class AnimeCommand extends BaseSlashCommand {
    public readonly name = 'anime';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Search for an anime.')
        .setDescriptionLocalization('es-ES', 'Buscar un anime.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addStringOption(option =>
            option
                .setName('name-or-id')
                .setNameLocalization('es-ES', 'nombre-o-id')
                .setDescription('Name or ID of the anime.')
                .setDescriptionLocalization('es-ES', 'Nombre o ID del anime.')
                .setRequired(true)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await AnimeSearchHandler.handle(interaction);
    }
}

