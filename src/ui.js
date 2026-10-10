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
import { t, label } from './i18n.js';
import { profileOptionDisplayName } from './profile-roles.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const welcomeGifPath = path.resolve(dirname, '../assets/cage-key-welcome.gif');
export const unlockGifPath = path.resolve(dirname, '../assets/cage-key-unlock.gif');

function option(code, lang, isDefault = false) {
  const item = new StringSelectMenuOptionBuilder().setLabel(label(code, lang)).setValue(code);
  if (isDefault) item.setDefault(true);
  return item;
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

export function updateProfileDashboard(user, application) {
  const lang = application.language ?? 'fr';
  const d = application.data ?? {};
  const profile = {
    language: lang,
    server_languages: d.server_languages ?? [lang],
    age: d.age,
    orientation: d.orientation,
    gender: d.gender,
    role: d.role,
    devices: d.devices ?? [],
    keys: d.keys ?? [],
    kinks: d.kinks ?? []
  };

  const embed = profileEmbed(user, profile, lang)
    .setTitle('✏️ Modifier mon profil')
    .setDescription('Choisis uniquement la rubrique que tu veux modifier. Les autres informations resteront inchangées.');

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('update:section:languages').setLabel('Langues').setEmoji('🌐').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('update:section:age').setLabel('Âge').setEmoji('🎂').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('update:section:orientation').setLabel('Orientation').setEmoji('🩷').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('update:section:gender').setLabel('Genre').setEmoji('👤').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('update:section:role').setLabel('Rôle').setEmoji('🗝️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('update:section:devices').setLabel('Dispositifs').setEmoji('🔐').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('update:section:keys').setLabel('Clés').setEmoji('🔑').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('update:section:kinks').setLabel('Kinks').setEmoji('🎭').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('update:save').setLabel('Enregistrer').setEmoji('✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('update:cancel').setLabel('Annuler').setEmoji('↩️').setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}

function updateSelect({ field, question, codes, lang, current, multi = false }) {
  const selected = new Set(Array.isArray(current) ? current : [current].filter(Boolean));
  const select = new StringSelectMenuBuilder()
    .setCustomId(`update:set:${field}`)
    .setPlaceholder(question)
    .addOptions(codes.map((code) => option(code, lang, selected.has(code))));

  if (multi) {
    select.setMinValues(1).setMaxValues(codes.length);
  }

  const embed = new EmbedBuilder()
    .setTitle('✏️ Modifier mon profil')
    .setDescription(question);

  const back = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('update:back').setLabel('Retour').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(select), back]
  };
}

export function updateProfileSectionPayload(section, application) {
  const lang = application.language ?? 'fr';
  const d = application.data ?? {};
  const strings = t(lang);

  if (section === 'languages') {
    const formLanguage = new StringSelectMenuBuilder()
      .setCustomId('update:set:language')
      .setPlaceholder('Langue du formulaire')
      .addOptions(OPTIONS.language.map((code) => option(code, lang, code === lang)));

    const serverLanguages = new StringSelectMenuBuilder()
      .setCustomId('update:set:server_languages')
      .setPlaceholder(strings.serverLanguagesQ)
      .setMinValues(1)
      .setMaxValues(OPTIONS.server_languages.length)
      .addOptions(OPTIONS.server_languages.map((code) => option(code, lang, (d.server_languages ?? [lang]).includes(code))));

    const back = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('update:back').setLabel('Retour').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
    );

    return {
      embeds: [new EmbedBuilder().setTitle('🌐 Langues').setDescription('Modifie la langue du formulaire et/ou les langues du serveur.')],
      components: [
        new ActionRowBuilder().addComponents(formLanguage),
        new ActionRowBuilder().addComponents(serverLanguages),
        back
      ]
    };
  }

  switch (section) {
    case 'age':
      return updateSelect({ field: 'age', question: strings.ageQ, codes: OPTIONS.age.filter((code) => code !== 'under18'), lang, current: d.age });
    case 'orientation':
      return updateSelect({ field: 'orientation', question: strings.orientationQ, codes: OPTIONS.orientation, lang, current: d.orientation });
    case 'gender':
      return updateSelect({ field: 'gender', question: strings.genderQ, codes: OPTIONS.gender, lang, current: d.gender });
    case 'role':
      return updateSelect({ field: 'role', question: strings.roleQ, codes: OPTIONS.role, lang, current: d.role });
    case 'devices':
      return updateSelect({ field: 'devices', question: strings.devicesQ, codes: OPTIONS.devices, lang, current: d.devices, multi: true });
    case 'keys':
      return updateSelect({ field: 'keys', question: strings.keysQ, codes: OPTIONS.keys, lang, current: d.keys, multi: true });
    case 'kinks':
      return updateSelect({ field: 'kinks', question: strings.kinksQ, codes: OPTIONS.kinks, lang, current: d.kinks, multi: true });
    default:
      return { embeds: [new EmbedBuilder().setTitle('✏️ Modifier mon profil').setDescription('Rubrique inconnue.')], components: [] };
  }
}

const LANGUAGE_FLAGS = Object.freeze({ fr: '🇫🇷', nl: '🇳🇱', en: '🇬🇧' });

function languageDisplay(code, lang) {
  const flag = LANGUAGE_FLAGS[code] ?? '';
  const text = label(code, lang);
  return flag ? `${flag} ${text}` : text;
}

function profileDisplay(lang, group, code) {
  return profileOptionDisplayName(lang, group, code) ?? label(code, lang);
}

function profileDisplays(lang, group, codes = []) {
  return codes.map((code) => profileDisplay(lang, group, code)).join(', ');
}

export function profileEmbed(user, profile, lang = profile.language ?? 'fr') {
  const embed = new EmbedBuilder().setTitle(`Profil — ${user.displayName ?? user.username}`);
  if (typeof user.displayAvatarURL === 'function') embed.setThumbnail(user.displayAvatarURL());
  return embed.addFields(
      { name: 'Langue du formulaire', value: languageDisplay(profile.language, lang), inline: true },
      { name: 'Langues du serveur', value: (profile.server_languages ?? [profile.language]).map((code) => languageDisplay(code, lang)).join(', ') || '—', inline: true },
      { name: 'Âge', value: profileDisplay(lang, 'age', profile.age_band ?? profile.age), inline: true },
      { name: 'Orientation', value: profileDisplay(lang, 'orientation', profile.orientation), inline: true },
      { name: 'Genre', value: profileDisplay(lang, 'gender', profile.gender), inline: true },
      { name: 'Rôle', value: profileDisplay(lang, 'role', profile.chastity_role ?? profile.role), inline: true },
      { name: 'Dispositifs', value: profileDisplays(lang, 'devices', profile.devices ?? []) || '—' },
      { name: 'Clés', value: profileDisplays(lang, 'keys', profile.keys ?? []) || '—' },
      { name: 'Kinks', value: profileDisplays(lang, 'kinks', profile.kinks ?? []) || '—' }
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

export function validationPayload(user, application, rulesAccepted = false) {
  const d = application.data;
  const profile = {
    language: application.language, server_languages: d.server_languages ?? [application.language], age: d.age, orientation: d.orientation, gender: d.gender,
    role: d.role, devices: d.devices, keys: d.keys, kinks: d.kinks
  };
  const embed = profileEmbed(user, profile, 'fr')
    .setTitle(application.mode === 'update' ? `Modification de profil — ${user.username}` : `Nouvelle demande — ${user.username}`)
    .setDescription(`Utilisateur : <@${user.id}>\nID : \`${user.id}\``)
    .addFields({ name: '📜 Rules Checked', value: rulesAccepted ? '✅ Oui' : '❌ Non', inline: true });
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
