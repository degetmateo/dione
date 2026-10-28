import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import Helpers from '../../../helpers';
import { CharacterGetByIdHandler } from './character/character-get-by-id.handler';
import { CharacterGetByNameHandler } from './character/character-get-by-name.handler';

export class CharacterCommand extends BaseSlashCommand {
    public readonly name = 'character';
    public override readonly cooldown = 5;

    public readonly data = new SlashCommandBuilder()
        .setName('character')
        .setDescription('Buscar un personaje y toda su información.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName('name-or-id')
                .setDescription('Nombre o identificador del personaje.')
                .setRequired(true)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const args = interaction.options.getString('name-or-id', true);
        if (Helpers.isNumber(args)) {
            await CharacterGetByIdHandler.handle(interaction);
        } else {
            await CharacterGetByNameHandler.handle(interaction);
        }
    }
}

