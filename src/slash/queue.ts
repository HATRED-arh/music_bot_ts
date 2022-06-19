import {
  Client,
  CommandInteraction,
  Interaction,
  MessageEmbed
} from "discord.js";

import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("displays song queue")
    .addNumberOption((option) =>
      option
        .setName("page")
        .setDescription("page number of the queue")
        .setMinValue(1)
    ),
  run: async ({
    client,
    interaction,
  }: {
    client: Client;
    interaction: CommandInteraction;
  }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || queue.playing) {
      return await interaction.editReply("Queue is empty");
    }
    const totalPages = Math.ceil(queue.tracks.length / 10) || 1;
    const page = (interaction.options.getNumber("page") || 1) - 1;
    if (page > totalPages) {
      return await interaction.editReply(
        `Wrong page. There are only ${totalPages} pages.`
      );
    }
    const queueString = queue.tracks
      .slice(page * 10, page * 10 + 10)
      .map((song, i) => {
        return `**${page * 10 + i + 1}.** \`${song.duration}\` ${song.title}`;
      })
      .join("\n");
    const currentSong = queue.current;
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `**Currently Playing**\n` +
              (currentSong
                ? `\`${currentSong.duration}\` ${currentSong.title}`
                : "None") +
              `\n\n**Queue**\n${queueString}`
          )
          .setFooter({
            text: `Page ${page + 1} of ${totalPages}`,
          })
          .setThumbnail(currentSong.thumbnail),
      ],
    });
  },
};