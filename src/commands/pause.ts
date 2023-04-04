import {ApplyOptions} from "@sapphire/decorators";
import {EmbedBuilder, Colors} from "discord.js";
import {Command} from "../lib/Command";

@ApplyOptions<Command.Options>({
	description: "pause the current song",
	preconditions: ["GuildOnly", "BotInVoice", "InSameVoice"]
})
export class PauseCommand extends Command {
	public registerApplicationCommands(registry: Command.Registry): void {
		registry.registerChatInputCommand(builder => builder.setName(this.name).setDescription(this.description));
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction): Promise<any> {
		await interaction.deferReply({ephemeral: true});

		const queue = this.container.player.queues.get(interaction.guild!);

		queue!.node.setPaused(true);

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(Colors.Green)
					.setTitle(await this.resolveCommandKey(interaction, "success.title"))
					.setDescription(await this.resolveCommandKey(interaction, "success.description"))
			]
		});
	}
}
