import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

export const ShowcaseCommand = {
  data: new SlashCommandBuilder()
    .setName('showcase')
    .setDescription('Share your project with the community')
    .addStringOption((option) =>
      option
        .setName('project-name')
        .setDescription('Name of your project')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Brief description of what it does')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('url').setDescription('Link to the project').setRequired(false),
    )
    .addStringOption((option) =>
      option.setName('tech-stack').setDescription('E.g. React, Node.js, Prisma').setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('project-name', true);
    const desc = interaction.options.getString('description', true);
    const url = interaction.options.getString('url');
    const tech = interaction.options.getString('tech-stack');

    const embed = new EmbedBuilder()
      .setTitle(`🚀 Project Showcase: ${name}`)
      .setDescription(desc)
      .setColor(0x23a55a)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (url) embed.setURL(url);
    if (tech) embed.addFields({ name: '🛠 Tech Stack', value: tech });

    await interaction.reply({ embeds: [embed] });
  },
};
