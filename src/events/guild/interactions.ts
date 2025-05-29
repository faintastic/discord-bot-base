import config from "../../config";
import color from "../../utilities/color";
import client from "../../utilities/client";
import logger from "../../utilities/logger";
import type { Execute } from "../../interfaces/Event";
import {
  Events,
  Collection,
  EmbedBuilder,
} from "discord.js";
import type {
  Interaction,
  CommandInteractionOptionResolver,
  CommandInteraction,
  ButtonInteraction,
  AnySelectMenuInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export const name: Events = Events.InteractionCreate;
export const execute: Execute = async (
  client: client,
  interaction: Interaction
) => {
  try {
    if (interaction.isCommand()) handleCommands(client, interaction);
    else if (interaction.isButton()) handleButtons(client, interaction);
    else if (interaction.isAnySelectMenu()) handleSelectMenus(client, interaction);
    else if (interaction.isModalSubmit()) handleModals(client, interaction);
  } catch (error: any) {
    logger.error(`An error occurred during interaction handling: ${error}\n${error.stack}`);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("An error occurred!")
            .setColor(color.error)
            .setDescription("An error occurred while processing your interaction. The error has been logged.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }
  }
};

/**
 * Handle the command interactions
 * @param client The client instance
 * @param interaction The interaction
 * @returns void
 */
async function handleCommands(client: client, interaction: Interaction): Promise<void> {
  if (!interaction.isCommand() && !interaction.isContextMenuCommand()) return;

  config.logging.slashCommandLoad &&
    logger.info(
      `/${interaction.commandName} was executed by ${interaction.user.tag} (${
        interaction.user.id
      }) in ${interaction.guild?.name || "DMs"} ${
        interaction.guild ? `(${interaction.guild.id})` : ""
      }`
    );

  const command = interaction.isCommand()
    ? client.slashCommands.get(interaction.commandName)
    : null;
  const context = interaction.isContextMenuCommand()
    ? client.contexts.get(interaction.commandName)
    : null;

  const target = command || context;
  if (!target) {
    await interaction.reply({
      content: "Command not found.",
      ephemeral: true,
    });
    return;
  }

  const cooldownKey = `${interaction.isCommand() ? "SLASH" : "CONTEXT"}_${
    target.data.name
  }`;
  if (!client.cooldowns.has(cooldownKey)) {
    client.cooldowns.set(cooldownKey, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(cooldownKey);
  const cooldownAmount = (target.cooldown || 0) * 1000;

  if (timestamps?.has(interaction.user.id)) {
    const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Slow down!")
            .setColor(color.error)
            .setDescription(
              `Please wait ${timeLeft.toFixed(1)} more seconds before reusing the </${interaction.commandName}:${interaction.commandId}> command.`
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  timestamps?.set(interaction.user.id, now);
  setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

  try {
    if (command) {
      await command.execute(
        client,
        interaction as CommandInteraction,
        interaction.options as CommandInteractionOptionResolver
      );
    } else if (context) {
      // @ts-ignore
      await context.execute(client, interaction, interaction.options as CommandInteractionOptionResolver);
    }
  } catch (error: any) {
    logger.error(
      `An error occurred while executing ${interaction.commandName}: ${error}\n${error.stack}`
    );
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("An error occurred!")
          .setColor(color.error)
          .setDescription(
            "An error occurred while executing this command. The error has been logged."
          )
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  }
}

/**
 * Handle the button interactions
 * @param client The client instance
 * @param interaction The interaction
 * @returns void
 */
async function handleButtons(client: client, interaction: ButtonInteraction): Promise<void> {
  config.logging.buttonUse &&
    logger.info(
      `Button ${interaction.customId} was executed by ${
        interaction.user.tag
      } (${interaction.user.id}) in ${interaction.guild?.name || "DMs"} ${
        interaction.guild ? `(${interaction.guild.id})` : ""
      }`
    );

  const button = client.buttons.get(interaction.customId.split(process.env.INTERACTION_SPLIT as string || "-")[0]);

  if (!button) {
    if (!interaction.replied) {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unknown button")
              .setDescription("This button is not recognized by the bot anymore.")
              .setColor(color.error)
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unknown button")
              .setDescription(
                "This button is not recognized by the bot anymore."
              )
              .setColor(color.error)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Unknown button")
            .setDescription("This button is not recognized by the bot anymore.")
            .setColor(color.error)
            .setTimestamp(),
        ],
      });
    }
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get("BUTTON_" + button?.name);
  const cooldownAmount = (button?.cooldown || 0) * 1000;

  if (timestamps?.has(interaction.user.id)) {
    const expirationTime =
      (timestamps.get(interaction.user.id) as number) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Slow down!")
            .setColor(color.error)
            .setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before clicking the ${interaction.customId} button.`)
            .setTimestamp(),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  timestamps?.set(interaction.user.id, now);
  setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

  try {
    await button?.execute(
      client,
      interaction,
      interaction.customId.split("-").length > 1
        ? interaction.customId.split("-").slice(1)
        : undefined
    );
  } catch (error: any) {
    logger.error(
      `An error occurred while executing button ${interaction.customId}: ${error}\n${error.stack}`
    );
    if (!interaction.replied) {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("An error occurred!")
              .setColor(color.error)
              .setDescription("An error occurred while executing this button. The error has been logged.")
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("An error occurred!")
              .setColor(color.error)
              .setDescription("An error occurred while executing this button. The error has been logged.")
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("An error occurred!")
            .setColor(color.error)
            .setDescription("An error occurred while executing this button. The error has been logged.")
            .setTimestamp(),
        ],
      });
    }
  }
}

/**
 * Handle the select menu interactions
 * @param client The client instance
 * @param interaction The interaction
 * @returns void
 */
async function handleSelectMenus(client: client, interaction: AnySelectMenuInteraction): Promise<void> {
  config.logging.selectMenuUse &&
    logger.info(
      `Select menu ${interaction.customId} was executed by ${
        interaction.user.tag
      } (${interaction.user.id}) in ${interaction.guild?.name || "DMs"} ${
        interaction.guild ? `(${interaction.guild.id})` : ""
      }`
    );

  const select = client.select.get(interaction.customId.split(process.env.INTERACTION_SPLIT as string || "-")[0]);

  if (!select) {
    if (!interaction.replied) {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unknown select menu")
              .setDescription("This select menu is not recognized by the bot anymore.")
              .setColor(color.error)
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unknown select menu")
              .setDescription(
                "This select menu is not recognized by the bot anymore."
              )
              .setColor(color.error)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Unknown select menu")
            .setDescription("This select menu is not recognized by the bot anymore.")
            .setColor(color.error)
            .setTimestamp(),
        ],
      });
    }
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get("SELECT_" + select?.name);
  const cooldownAmount = (select?.cooldown || 0) * 1000;

  if (timestamps?.has(interaction.user.id)) {
    const expirationTime =
      (timestamps.get(interaction.user.id) as number) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Slow down!")
            .setColor(color.error)
            .setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before clicking the ${interaction.customId} select menu.`)
            .setTimestamp(),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  timestamps?.set(interaction.user.id, now);
  setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

  try {
    await select?.execute(client, interaction, interaction.values.toString().split("-") || undefined);
  } catch (error: any) {
    logger.error(
      `An error occurred while executing select menu ${interaction.customId}: ${error}\n${error.stack}`
    );
    if (!interaction.replied) {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("An error occurred!")
              .setColor(color.error)
              .setDescription("An error occurred while executing this select menu. The error has been logged.")
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("An error occurred!")
              .setColor(color.error)
              .setDescription("An error occurred while executing this select menu. The error has been logged.")
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("An error occurred!")
            .setColor(color.error)
            .setDescription("An error occurred while executing this select menu. The error has been logged.")
            .setTimestamp(),
        ],
      });
    }
  }
}

/**
 * Handle the modal interactions
 * @param client The client instance
 * @param interaction The interaction
 * @returns void
 */
async function handleModals(client: client, interaction: ModalSubmitInteraction): Promise<void> {
  config.logging.modalUse &&
    logger.info(
      `Modal ${interaction.customId} was executed by ${
        interaction.user.tag
      } (${interaction.user.id}) in ${interaction.guild?.name || "DMs"} ${
        interaction.guild ? `(${interaction.guild.id})` : ""
      }`
    );

  const modal = client.modals.get(interaction.customId.split(process.env.INTERACTION_SPLIT as string || "-")[0]);

  if (!modal) {
    if (!interaction.replied) {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unknown modal")
              .setDescription("This modal is not recognized by the bot anymore.")
              .setColor(color.error)
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unknown modal")
              .setDescription(
                "This modal is not recognized by the bot anymore."
              )
              .setColor(color.error)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Unknown modal")
            .setDescription("This modal is not recognized by the bot anymore.")
            .setColor(color.error)
            .setTimestamp(),
        ],
      });
    }
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get("MODAL_" + modal?.name);
  const cooldownAmount = (modal?.cooldown || 0) * 1000;

  if (timestamps?.has(interaction.user.id)) {
    const expirationTime =
      (timestamps.get(interaction.user.id) as number) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Slow down!")
            .setColor(color.error)
            .setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before submitting the ${interaction.customId} modal.`)
            .setTimestamp(),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  timestamps?.set(interaction.user.id, now);
  setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

  try {
    await modal?.execute(client, interaction, interaction.fields);
  } catch (error: any) {
    logger.error(
      `An error occurred while executing modal ${interaction.customId}: ${error}\n${error.stack}`
    );
    if (!interaction.replied) {
      if (interaction.deferred) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("An error occurred!")
              .setColor(color.error)
              .setDescription("An error occurred while executing this modal. The error has been logged.")
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("An error occurred!")
              .setColor(color.error)
              .setDescription("An error occurred while executing this modal. The error has been logged.")
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("An error occurred!")
            .setColor(color.error)
            .setDescription("An error occurred while executing this modal. The error has been logged.")
            .setTimestamp(),
        ],
      });
    }
  }
}