import client from "../utilities/client";
import { CommandInteractionOptionResolver, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";

export interface Execute {
  (
    client: client, 
    interaction: MessageContextMenuCommandInteraction & UserContextMenuCommandInteraction, // No default value here
    args: CommandInteractionOptionResolver
  ): Promise<void>;
}

export interface Context {
  data: ContextMenuCommandBuilder;
  cooldown?: number;
  execute: Execute; 
}