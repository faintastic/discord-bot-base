import client from "../utilities/client";
import type { AnySelectMenuInteraction } from "discord.js";

export interface Execute {
  (client: client, interaction: AnySelectMenuInteraction, args?: string[]): Promise<void>
}

export interface Select {
  name: string;
  cooldown?: number;
  execute: Execute;
}