import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/SlashCommand";
import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("I will say anything that you input :)")
  .addStringOption((option => option
    .setName("message")
    .setDescription("What am I going to say?")
    .setRequired(true)
  ))
  .setContexts(0, 1, 2) // 0 = GUILD || 1 = BOT_DM || 2 = PRIVATE_CHANNEL (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
  .setIntegrationTypes(1); // 0 = GUILD_INSTALL || 1 = USER_INSTALL (https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: CommandInteraction, args) => {
  const message = args.get("message")?.value?.toString();

  await interaction.reply({ content: `${message}` })
}