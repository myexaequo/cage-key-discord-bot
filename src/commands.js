import { ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('commencer')
    .setDescription('Commencer ou reprendre l’inscription Cage & Key'),
  new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Afficher un profil Cage & Key')
    .addUserOption((opt) => opt.setName('membre').setDescription('Membre à afficher').setRequired(false)),
  new ContextMenuCommandBuilder()
    .setName('Profil Cage & Key')
    .setType(ApplicationCommandType.User)
].map((command) => command.toJSON());
