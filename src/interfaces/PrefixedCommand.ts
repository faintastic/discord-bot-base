import client from "../utilities/client";
import { Message } from "discord.js";

export interface Execute {
  (client: client, message: Message, args: string[]): Promise<void>;
}

export interface PrefixedCommand {
  name: string;
  description: string;
  aliases?: string[];
  cooldown?: number;
  execute: Execute;
}