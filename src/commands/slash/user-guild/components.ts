import color from "../../../utilities/color";
import client from "../../../utilities/client";
import type { Execute } from "../../../interfaces/SlashCommand";
import type { MessageActionRowComponentBuilder } from "discord.js";
import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  RoleSelectMenuBuilder,
  UserSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  CommandInteraction,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("components")
  .setDescription("Displays all of the testing buttons & select menus.")
  .setContexts(0, 1, 2) // 0 = GUILD || 1 = BOT_DM || 2 = PRIVATE_CHANNEL (https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types)
  .setIntegrationTypes(0, 1); // 0 = GUILD_INSTALL || 1 = USER_INSTALL (https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
export const cooldown: number = 5;
export const execute: Execute = async (client: client, interaction: CommandInteraction) => {
  await interaction.deferReply({});

  const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("modal_button")
      .setLabel("Modal Button (modal_button.ts)")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("button-1")
      .setLabel("Button 1 (button.ts)")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("button-2")
      .setLabel("Button 2 (button.ts)")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("unknown_button")
      .setLabel("Unknown Button")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("string_select")
      .setPlaceholder("Select a string")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Option 1")
          .setValue("option_1")
          .setDescription("This is option 1"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Option 2")
          .setValue("option_2")
          .setDescription("This is option 2"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Option 3")
          .setValue("option_3")
          .setDescription("This is option 3")
      )
  );

  const row3 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId("role_select")
      .setPlaceholder("Select a role")
      .setMinValues(1)
      .setMaxValues(1)
  );

  const row4 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setPlaceholder("Select a user")
      .setMinValues(1)
      .setMaxValues(1)
  );

  const row5 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId("channel_select")
      .setPlaceholder("Select a channel")
      .setMinValues(1)
      .setMaxValues(1)
  );

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle("Components")
        .setColor(color.success)
        .setDescription("Here are all of the testing buttons and select menus")
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp(),
    ],
    components: [row, row2, row3, row4, row5],
  });
};