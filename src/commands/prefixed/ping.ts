import { Message, EmbedBuilder } from "discord.js";
import client from "../../utilities/client";
import type { Execute } from "../../interfaces/PrefixedCommand";
import color from "../../utilities/color";

export const name: string = "ping";
export const description: string = "Replies with the bots latency";
export const aliases: string[] = ["p"];
export const cooldown: number = 5;
export const execute: Execute = async (client: client, message: Message, args: string[]) => {
  const start = Date.now();

  const msg = await message.reply({ content: "Pinging..." });
  await msg.edit({
    content: "",
    embeds: [
      new EmbedBuilder()
        .setTitle("Pong! 🏓")
        .setDescription(`Latency: \`${Date.now() - start}ms\`\nAPI Latency: \`${client.ws.ping}ms\``)
        .setColor(color.random)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp()
    ]
  })
}