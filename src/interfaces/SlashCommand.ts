import client from "../utilities/client";
import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";

export interface Execute {
  (client: client, interaction: CommandInteraction, args: CommandInteractionOptionResolver): Promise<void>;
}

export interface AutoComplete {
  (client: client, interaction: CommandInteraction, args: CommandInteractionOptionResolver): Promise<void>;
}

export interface SlashCommand {
  data: SlashCommandBuilder;
  cooldown?: number;
  execute: Execute;
  autoComplete?: AutoComplete;
}