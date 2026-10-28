import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { GachaBuyPullsSubcommand } from './gacha/gacha-buy-pulls.subcommand';
import { GachaBuyClaimsSubcommand } from './gacha/gacha-buy-claims.subcommand';
import { GachaInventorySubcommand } from './gacha/gacha-inventory.subcommand';
import { GachaTradeSubcommand } from './gacha/gacha-trade.subcommand';
import { GachaSellSubcommand } from './gacha/gacha-sell.subcommand';

export class GachaCommand extends BaseSlashCommand {
    public readonly name = 'gacha';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('Comandos relacionados con el gacha.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addSubcommand(sub => sub.setName('buy-pulls').setDescription('1 pull = 10 renas.').addNumberOption(o => o.setName('pulls').setDescription('Número de pulls').setRequired(true).setMinValue(1)))
        .addSubcommand(sub => sub.setName('buy-claims').setDescription('1 claim = 100 renas.').addNumberOption(o => o.setName('claims').setDescription('Número de claims').setRequired(true).setMinValue(1)))
        .addSubcommand(sub => sub.setName('inventory').setDescription('Lista de personajes en este servidor.').addUserOption(o => o.setName('user').setDescription('Usuario a consultar').setRequired(false)))
        .addSubcommand(sub => sub.setName('trade').setDescription('Intercambia un personaje con otro usuario.').addUserOption(o => o.setName('user').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('ca_name-or-id').setDescription('Personaje a dar').setRequired(true)).addStringOption(o => o.setName('cb_name-or-id').setDescription('Personaje a pedir').setRequired(true)))
        .addSubcommand(sub => sub.setName('sell').setDescription('Vender un personaje por renas.').addStringOption(o => o.setName('name-or-id').setDescription('Personaje a vender').setRequired(true)).addUserOption(o => o.setName('user').setDescription('Comprador').setRequired(true)).addNumberOption(o => o.setName('price').setDescription('Precio en renas').setRequired(true).setMinValue(0)));

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const subMap: Record<string, (interaction: ChatInputCommandInteraction) => Promise<void>> = {
            'buy-pulls': GachaBuyPullsSubcommand.handle,
            'buy-claims': GachaBuyClaimsSubcommand.handle,
            'inventory': GachaInventorySubcommand.handle,
            'trade': GachaTradeSubcommand.handle,
            'sell': GachaSellSubcommand.handle,
        };
        const handler = subMap[subcommand];
        if (handler) {
            await handler(interaction);
        }
    }
}

