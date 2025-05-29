import color from "../../../utilities/color";
import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/SlashCommand";
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("rps")
  .setDescription("I play rock paper scissors with you")
  .addStringOption((option => option
    .setName("choice")
    .setDescription("Choose rock, paper, or scissors")
    .setChoices([
      { value: "rock", name: "Rock" },
      { value: "paper", name: "Paper" },
      { value: "scissors", name: "Scissors" }
    ])
    .setRequired(true)
  ))
  .setContexts(0, 1, 2) // 0 = GUILD || 1 = BOT_DM || 2 = PRIVATE_CHANNEL (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
  .setIntegrationTypes(0, 1); // 0 = GUILD_INSTALL || 1 = USER_INSTALL (https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: CommandInteraction, args) => {
  await interaction.deferReply();
  const choice = args.get("choice")?.value?.toString();
  const choices = ["rock", "paper", "scissors"];
  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  let thumbnail: string | null = null;
  const userAvatar = interaction.user.avatarURL();
  const botAvatar = client.user?.avatarURL();
  
  switch (getResult(choice as string, botChoice)) {
    case "You win!":
      thumbnail = userAvatar ?? null;
      break;
    
    case "You lose!":
      thumbnail = botAvatar ?? null;
      break;
  
    default:
      thumbnail = userAvatar ?? null; 
      break;
  }
  

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${interaction.user.username} vs ${client.user?.username}`)
        .setDescription(`You chose **${choice}**, I chose **${botChoice}**.\n\n${getResult(choice as string, botChoice)}`)
        .setColor(color.random)
        .setThumbnail(thumbnail)
        .setTimestamp()
    ]
  })
}

/**
 * Get the result of the game
 * @param userChoice The user's choice
 * @param botChoice The bot's choice
 * @returns The result of the game
 */
function getResult(userChoice: string, botChoice: string): string {
  if (userChoice === botChoice) return "It's a tie!";
  if (
    (userChoice === "rock" && botChoice === "scissors") ||
    (userChoice === "paper" && botChoice === "rock") ||
    (userChoice === "scissors" && botChoice === "paper")
  ) {
    return "You win!";
  }
  return "You lose!";
}
