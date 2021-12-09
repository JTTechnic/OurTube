import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "let the bot join your voice channel",
	preconditions: ["GuildOnly", "UserInVoice"]
})
export class JoinCommand extends Command {
	public registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(new SlashCommandBuilder().setName(this.name).setDescription(this.description));
	}

	/**
	 * Join the voice channel of the interaction member
	 * @param interaction The interaction to get guild data from
	 * @returns The created queue of the interaction guild
	 */
	public async joinChannel(interaction: CommandInteraction) {
		const {member, guild} = interaction,
			{player} = this.container,
			{voice} = member as GuildMember;
		
		const queue = player.createQueue(guild, {
			leaveOnEmpty: false,
			leaveOnEnd: false,
			ytdlOptions: {
				quality: "highest",
				filter: "audioonly",
				highWaterMark: 1 << 25,
				dlChunkSize: 0
			},
			metadata: interaction
		});

		try {
			if (!queue.connection) await queue.connect(voice.channel);
		} catch {
			player.deleteQueue(guild);
			return void interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Can't join voice channel",
						description: "Unable to join your voice channel"
					})
				]
			});
		}

		return queue;
	}

	public async chatInputRun(interaction: CommandInteraction) {
		await interaction.deferReply();
		if(!await this.joinChannel(interaction)) return;

		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					title: "Join",
					description: `Joined \`${(interaction.member as GuildMember).voice.channel.name}\` 🔊`
				})
			]
		});
	}
}