import config from "../../config";
import color from "../../utilities/color";
import client from "../../utilities/client";
import logger from "../../utilities/logger";
import type { Execute } from "../../interfaces/Event";
import { Events, Message, Collection, EmbedBuilder } from "discord.js";

export const name: Events = Events.MessageCreate;
export const execute: Execute = async (client: client, message: Message) => {
  if (message.author.bot) return;
  // if (!message.guild) return;

  const prefix = process.env.PREFIX as string;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = client.prefixed.get(commandName) || client.prefixed.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  const cooldownKey = "PREFIX_" + command.name;
  if (!client.cooldowns.has(cooldownKey)) {
    client.cooldowns.set(cooldownKey, new Collection());
  }

  config.logging.prefixedCommandRun &&
    logger.info(
      `${prefix}${commandName} was executed by ${message.author?.tag} (${message.author?.id}) in ${message.guild?.name || "DMs"} ${message.guild ? `(${message.guild.id})` : ""}`
    );

  const now = Date.now();
  const timestamps = client.cooldowns.get(cooldownKey);
  const cooldownAmount = (command.cooldown || 0) * 1000;

  if (timestamps?.has(message.member?.id as string)) {
    const expirationTime = (timestamps.get(message.member?.id as string) as number) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Slow down!")
              .setColor(color.error)
              .setDescription(
                `Please wait ${timeLeft.toFixed(
                  1
                )} more seconds before reusing the ${commandName} command.`
              )
              .setTimestamp(),
          ],
      });
      return;
    }
  }

  timestamps?.set(message.member?.id as string, now);
  setTimeout(() => timestamps?.delete(message.member?.id as string), cooldownAmount);

  try {
    await command.execute(client, message, args);
  } catch (error) {
    logger.error(`An error occurred while executing ${commandName}: ${error}`);
    await message.reply({
      content: `Execution of command: ${commandName} failed because of the following reason:\n\`\`\`${error}\`\`\``,
    });
  }
};
