import { ChatInputCommandInteraction } from 'discord.js';
import { UserRowComponent, UserProfileEmbed } from '../../../ui';
import mongo from '../../../../database/mongo';
import { BusinessRuleError } from '../../../../core/errors';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';

export class UserViewHandler {
    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const optionUser = await (interaction.options.getUser('member') || interaction.user).fetch(true);
        const userId = optionUser.id;
        const user = await mongo.users.findOne({ _id: userId as any });

        if (!user) {
            if (userId === interaction.user.id) {
                throw new BusinessRuleError('No estás registrado. Usá `/setup` para registrarte.');
            } else {
                throw new BusinessRuleError(`<@${userId}> no está registrado. Debe usar \`/setup\` para registrarse.`);
            }
        }

        const embeds: any = { profile: null, anilist: null, mal: null, vndb: null };
        embeds['profile'] = new UserProfileEmbed({ member: user, user: optionUser });

        const id = InteractionStateService.getInstance().set({ member: user, user: optionUser, embeds }, 120_000);

        const buttons = new UserRowComponent({
            id,
            anilist: user.anilist,
            mal: user.mal,
            vndb: user.vndb,
            profile: false,
        });

        await interaction.editReply({
            embeds: [embeds['profile']],
            components: buttons.isValid() ? [buttons] : [],
        });
    }
}

