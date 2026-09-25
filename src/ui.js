import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { OPTIONS } from './questions.js';
import { t, label, labels } from './i18n.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const welcomeGifPath = path.resolve(dirname, '../assets/cage-key-welcome.gif');
export const unlockGifPath = path.resolve(dirname, '../assets/cage-key-unlock.gif');

function option(code, lang) {
  return new StringSelectMenuOptionBuilder().setLabel(label(code, lang)).setValue(code);
}

export function languageScreen() {
  const embed = new EmbedBuilder()
    .setTitle('Cage & Key')
    .setDescription('Langue du formulaire • Taal van het formulier • Form language');
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('onboard:lang:fr').setLabel('FR').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('onboard:lang:nl').setLabel('NL').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('onboard:lang:en').setLabel('EN').setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

export function welcomePayload() {
  const base = languageScreen();
  if (!fs.existsSync(welcomeGifPath)) return base;
  const attachment = new AttachmentBuilder(welcomeGifPath, { name: 'cage-key-welcome.gif' });
  base.embeds[0].setImage('attachment://cage-key-welcome.gif');
  return { ...base, files: [attachment] };
}

function selectScreen({ id, question, codes, lang, multi = false }) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`onboard:${id}`)
    .setPlaceholder(question)
    .addOptions(codes.map((code) => option(code, lang)));
  if (multi) {
    select.setMinValues(1).setMaxValues(codes.length);
  }
  const embed = new EmbedBuilder().setTitle('Cage & Key').setDescription(`${question}${multi ? `\n_${t(lang).multiple}_` : ''}`);
  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(select)] };
}

export function stagePayload(stage, lang) {
  const strings = t(lang);
  switch (stage) {
    case 'server_languages': return selectScreen({ id: 'server_languages', question: strings.serverLanguagesQ, codes: OPTIONS.server_languages, lang, multi: true });
    case 'age': return selectScreen({ id: 'age', question: strings.ageQ, codes: OPTIONS.age, lang });
    case 'orientation': return selectScreen({ id: 'orientation', question: strings.orientationQ, codes: OPTIONS.orientation, lang });
    case 'gender': return selectScreen({ id: 'gender', question: strings.genderQ, codes: OPTIONS.gender, lang });
    case 'role': return selectScreen({ id: 'role', question: strings.roleQ, codes: OPTIONS.role, lang });
    case 'devices': return selectScreen({ id: 'devices', question: strings.devicesQ, codes: OPTIONS.devices, lang, multi: true });
    case 'keys': return selectScreen({ id: 'keys', question: strings.keysQ, codes: OPTIONS.keys, lang, multi: true });
    case 'kinks': return selectScreen({ id: 'kinks', question: strings.kinksQ, codes: OPTIONS.kinks, lang, multi: true });
    default: return languageScreen();
  }
}

export function profileEmbed(user, profile, lang = profile.language ?? 'fr') {
  const embed = new EmbedBuilder().setTitle(`Profil — ${user.displayName ?? user.username}`);
  if (typeof user.displayAvatarURL === 'function') embed.setThumbnail(user.displayAvatarURL());
  return embed.addFields(
      { name: 'Langue du formulaire', value: label(profile.language, lang), inline: true },
      { name: 'Langues du serveur', value: labels(profile.server_languages ?? [profile.language], lang) || '—', inline: true },
      { name: 'Âge', value: label(profile.age_band ?? profile.age, lang), inline: true },
      { name: 'Orientation', value: label(profile.orientation, lang), inline: true },
      { name: 'Genre', value: label(profile.gender, lang), inline: true },
      { name: 'Rôle', value: label(profile.chastity_role ?? profile.role, lang), inline: true },
      { name: 'Dispositifs', value: labels(profile.devices ?? [], lang) || '—' },
      { name: 'Clés', value: labels(profile.keys ?? [], lang) || '—' },
      { name: 'Kinks', value: labels(profile.kinks ?? [], lang) || '—' }
    );
}

export function summaryPayload(user, application) {
  const lang = application.language;
  const d = application.data;
  const s = t(lang);
  const profile = {
    language: lang, server_languages: d.server_languages ?? [lang], age: d.age, orientation: d.orientation, gender: d.gender,
    role: d.role, devices: d.devices, keys: d.keys, kinks: d.kinks
  };
  const embed = profileEmbed(user, profile, lang).setTitle(s.summaryTitle).setDescription(s.summaryNotice);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('onboard:submit').setLabel(s.submit).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('onboard:restart').setLabel(s.restart).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

export function validationPayload(user, application) {
  const d = application.data;
  const profile = {
    language: application.language, server_languages: d.server_languages ?? [application.language], age: d.age, orientation: d.orientation, gender: d.gender,
    role: d.role, devices: d.devices, keys: d.keys, kinks: d.kinks
  };
  const embed = profileEmbed(user, profile, 'fr')
    .setTitle(`Nouvelle demande — ${user.username}`)
    .setDescription(`Utilisateur : <@${user.id}>\nID : \`${user.id}\``);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`validation:accept:${user.id}`).setLabel('Accepter').setEmoji('✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`validation:reject:${user.id}`).setLabel('Refuser').setEmoji('❌').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`validation:clarify:${user.id}`).setLabel('Demander une précision').setEmoji('💬').setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

export function acceptedPayload(lang) {
  const s = t(lang);
  const embed = new EmbedBuilder().setTitle(`🔓 ${s.accepted}`).setDescription(s.acceptedBody);
  if (!fs.existsSync(unlockGifPath)) return { embeds: [embed] };
  const attachment = new AttachmentBuilder(unlockGifPath, { name: 'cage-key-unlock.gif' });
  embed.setImage('attachment://cage-key-unlock.gif');
  return { embeds: [embed], files: [attachment] };
}
