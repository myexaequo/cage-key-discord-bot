import { SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('commencer')
    .setDescription('Commencer ou reprendre l’inscription Cage & Key'),
  new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Afficher un profil Cage & Key')
    .addUserOption((opt) => opt.setName('membre').setDescription('Membre à afficher').setRequired(false))
].map((command) => command.toJSON());
