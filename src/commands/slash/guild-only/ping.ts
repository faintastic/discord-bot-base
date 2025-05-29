import color from "../../../utilities/color";
import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/SlashCommand";
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with the bots latency")
  .setContexts(0, 1, 2) // 0 = GUILD || 1 = BOT_DM || 2 = PRIVATE_CHANNEL (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
  .setIntegrationTypes(0); // 0 = GUILD_INSTALL || 1 = USER_INSTALL (https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: CommandInteraction) => {
  await interaction.deferReply({})
  const start = Date.now();

  await interaction.editReply({ content: "Pinging..." });
  await interaction.editReply({
    content: "",
    embeds: [
      new EmbedBuilder()
        .setTitle("Pong! 🏓")
        .setDescription(`Latency: \`${Date.now() - start}ms\`\nAPI Latency: \`${client.ws.ping}ms\``)
        .setColor(color.random)
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
    ]
  })
}