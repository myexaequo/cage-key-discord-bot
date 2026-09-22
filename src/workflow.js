import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { config } from './config.js';
import { getApplication, upsertApplication, deleteApplication, saveProfileFromApplication, getProfile, audit, createClarification, getClarification, answerClarification } from './db.js';
import { isValidChoice, isValidMultiChoice, nextStage } from './questions.js';
import { t } from './i18n.js';
import { welcomePayload, languageScreen, stagePayload, summaryPayload, validationPayload, profileEmbed, acceptedPayload } from './ui.js';
import { assignPending, approveMember, isStaff } from './roles.js';
import { sendLog } from './logging.js';

function ephemeralReply(interaction, payload) {
  if (interaction.replied || interaction.deferred) return interaction.followUp({ ...payload, ephemeral: true });
  return interaction.reply({ ...payload, ephemeral: true });
}

async function showCurrent(interaction, application) {
  const payload = application.stage === 'summary'
    ? summaryPayload(interaction.user, application)
    : stagePayload(application.stage, application.language ?? 'fr');
  if (interaction.isButton() || interaction.isStringSelectMenu()) return interaction.update(payload);
  return ephemeralReply(interaction, payload);
}

export async function startOnboarding(interaction, roles) {
  if (!interaction.guild || interaction.guild.id !== config.guildId) return;
  const member = interaction.member;
  const existingProfile = getProfile(config.guildId, interaction.user.id);
  if (existingProfile) return ephemeralReply(interaction, { content: 'Ton profil est déjà validé. Utilise /profil pour le consulter.' });
  await assignPending(member, roles).catch(() => {});
  let app = getApplication(config.guildId, interaction.user.id);
  if (app?.status === 'submitted') {
    return ephemeralReply(interaction, { content: t(app.language ?? 'fr').onboardingPending });
  }
  if (!app) app = upsertApplication(config.guildId, interaction.user.id, { stage: 'language', status: 'draft', data: {} });
  if (app.stage === 'language') return ephemeralReply(interaction, welcomePayload());
  return showCurrent(interaction, app);
}

export async function sendWelcomeDM(member, roles) {
  await assignPending(member, roles);
  upsertApplication(member.guild.id, member.id, { stage: 'language', status: 'draft', data: {} });
  try {
    await member.send(welcomePayload());
    audit(member.guild.id, 'onboarding_started', { userId: member.id });
  } catch {
    audit(member.guild.id, 'welcome_dm_failed', { userId: member.id });
  }
}

async function underageFlow(interaction) {
  const lang = getApplication(config.guildId, interaction.user.id)?.language ?? 'fr';
  const message = t(lang).under18;
  deleteApplication(config.guildId, interaction.user.id);
  audit(config.guildId, 'under18_kicked', { userId: interaction.user.id, details: { reason: 'Âge déclaré inférieur à 18 ans' } });
  await interaction.update({ content: message, embeds: [], components: [] }).catch(() => {});
  const guild = interaction.client.guilds.cache.get(config.guildId) ?? await interaction.client.guilds.fetch(config.guildId).catch(() => null);
  const member = guild ? await guild.members.fetch(interaction.user.id).catch(() => null) : null;
  if (member) {
    if (!interaction.channel?.isDMBased?.()) await member.send(message).catch(() => {});
    if (member.kickable) await member.kick('Âge déclaré inférieur à 18 ans');
  }
  await sendLog(interaction.client, `🚫 <@${interaction.user.id}> retiré du serveur — âge déclaré inférieur à 18 ans.`);
}

async function advance(interaction, field, value, multi = false) {
  const app = getApplication(config.guildId, interaction.user.id);
  if (!app || app.status !== 'draft') return ephemeralReply(interaction, { content: 'Aucune inscription active.' });
  if (multi ? !isValidMultiChoice(field, value) : !isValidChoice(field, value)) return ephemeralReply(interaction, { content: 'Choix invalide.' });
  if (field === 'age' && value === 'under18') return underageFlow(interaction);

  const data = { ...app.data, [field]: value };
  const next = nextStage(field);
  const updated = upsertApplication(config.guildId, interaction.user.id, { stage: next, data });
  return showCurrent(interaction, updated);
}

export async function handleOnboardingInteraction(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith('onboard:lang:')) {
    const lang = interaction.customId.split(':')[2];
    if (!isValidChoice('language', lang)) return;
    const app = getApplication(config.guildId, interaction.user.id) ?? upsertApplication(config.guildId, interaction.user.id, { stage: 'language', data: {} });
    const updated = upsertApplication(config.guildId, interaction.user.id, { language: lang, stage: 'age', data: app.data });
    return interaction.update(stagePayload('age', lang));
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('onboard:')) {
    const field = interaction.customId.split(':')[1];
    const multi = ['devices', 'keys', 'kinks'].includes(field);
    return advance(interaction, field, multi ? interaction.values : interaction.values[0], multi);
  }

  if (interaction.isButton() && interaction.customId === 'onboard:restart') {
    upsertApplication(config.guildId, interaction.user.id, { stage: 'language', language: null, status: 'draft', data: {} });
    return interaction.update({ ...languageScreen(), attachments: [] });
  }

  if (interaction.isButton() && interaction.customId === 'onboard:submit') {
    const app = getApplication(config.guildId, interaction.user.id);
    if (!app || app.stage !== 'summary' || app.status !== 'draft') return ephemeralReply(interaction, { content: 'Demande invalide ou déjà envoyée.' });
    const channel = interaction.client.channels.cache.get(config.validationChannelId) ?? await interaction.client.channels.fetch(config.validationChannelId);
    if (!channel?.isTextBased()) return ephemeralReply(interaction, { content: 'Le canal #validation est mal configuré.' });
    const message = await channel.send(validationPayload(interaction.user, app));
    upsertApplication(config.guildId, interaction.user.id, { status: 'submitted', validationMessageId: message.id });
    audit(config.guildId, 'application_submitted', { userId: interaction.user.id });
    return interaction.update({ content: t(app.language).pending, embeds: [], components: [] });
  }
}

export async function handleProfileCommand(interaction) {
  const canViewProfiles = isStaff(interaction.member) || interaction.member.roles.cache.some((r) => r.name === 'Membre');
  if (!canViewProfiles) return ephemeralReply(interaction, { content: 'Les profils sont accessibles après validation de ton accès.' });
  const target = interaction.options.getUser('membre') ?? interaction.user;
  const profile = getProfile(config.guildId, target.id);
  if (!profile) return ephemeralReply(interaction, { content: t('fr').profileNotFound });
  return interaction.reply({ embeds: [profileEmbed(target, profile, profile.language)] });
}

function ensureStaff(interaction) {
  if (isStaff(interaction.member)) return true;
  ephemeralReply(interaction, { content: 'Action réservée aux modérateurs.' });
  return false;
}

async function fetchApplicationMember(interaction, userId) {
  const app = getApplication(config.guildId, userId);
  const member = await interaction.guild.members.fetch(userId).catch(() => null);
  return { app, member };
}

export async function handleValidationButton(interaction, roles) {
  if (!ensureStaff(interaction)) return;
  const [, action, userId] = interaction.customId.split(':');

  // Les modales doivent être ouvertes immédiatement, sans attendre un fetch Discord.
  // La validité de la demande est revérifiée au moment de l'envoi de la modale.
  if (action === 'reject') {
    const modal = new ModalBuilder().setCustomId(`reject_modal:${userId}`).setTitle('Refuser la demande');
    const input = new TextInputBuilder().setCustomId('reason').setLabel('Raison du refus').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (action === 'clarify') {
    const modal = new ModalBuilder().setCustomId(`clarify_modal:${userId}`).setTitle('Demander une précision');
    const input = new TextInputBuilder().setCustomId('question').setLabel('Question à envoyer au membre').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (action === 'accept') {
    // Discord attend une réponse en ~3 secondes. On acquitte le clic tout de suite
    // avant les appels réseau et les changements de rôles.
    await interaction.deferUpdate();

    const { app, member } = await fetchApplicationMember(interaction, userId);
    if (!app || app.status !== 'submitted') {
      return interaction.followUp({ content: 'Cette demande n’est plus active.', ephemeral: true });
    }
    if (!member) {
      return interaction.followUp({ content: 'Le membre n’est plus sur le serveur.', ephemeral: true });
    }

    try {
      await approveMember(member, roles, app.language);
    } catch (error) {
      console.error('[validation:accept] attribution des rôles impossible', error);
      return interaction.followUp({
        content: 'Impossible d’attribuer les rôles. Vérifie que le rôle **Cage & Key** est placé au-dessus de **En attente**, **Membre**, **FR**, **NL** et **EN** dans Paramètres du serveur → Rôles.',
        ephemeral: true
      });
    }

    saveProfileFromApplication(app, interaction.user.id);
    audit(config.guildId, 'application_approved', { userId, actorId: interaction.user.id });
    await interaction.editReply({ content: `✅ Accepté par <@${interaction.user.id}>`, embeds: interaction.message.embeds, components: [] });
    await member.send(acceptedPayload(app.language)).catch(() => {});
    deleteApplication(config.guildId, userId);
    await sendLog(interaction.client, `✅ <@${userId}> accepté par <@${interaction.user.id}>.`);
    return;
  }
}

export async function handleModeratorModal(interaction) {
  if (!ensureStaff(interaction)) return;
  if (interaction.customId.startsWith('reject_modal:')) {
    const userId = interaction.customId.split(':')[1];
    const reason = interaction.fields.getTextInputValue('reason').trim();
    const { app, member } = await fetchApplicationMember(interaction, userId);
    if (!app || app.status !== 'submitted') return ephemeralReply(interaction, { content: 'Cette demande n’est plus active.' });
    audit(config.guildId, 'application_rejected', { userId, actorId: interaction.user.id, details: { reason } });
    if (member) {
      const lang = app.language ?? 'fr';
      await member.send(`${t(lang).rejected}\n\n${reason}`).catch(() => {});
      if (member.kickable) await member.kick(`Demande refusée: ${reason.slice(0, 400)}`).catch(() => {});
    }
    if (app.validation_message_id) {
      const channel = await interaction.client.channels.fetch(config.validationChannelId).catch(() => null);
      const message = channel?.isTextBased() ? await channel.messages.fetch(app.validation_message_id).catch(() => null) : null;
      if (message) await message.edit({ content: `❌ Refusé par <@${interaction.user.id}> — ${reason}`, components: [] });
    }
    deleteApplication(config.guildId, userId);
    await sendLog(interaction.client, `❌ <@${userId}> refusé par <@${interaction.user.id}> — ${reason}`);
    return interaction.reply({ content: 'Demande refusée et membre retiré du serveur.', ephemeral: true });
  }

  if (interaction.customId.startsWith('clarify_modal:')) {
    const userId = interaction.customId.split(':')[1];
    const question = interaction.fields.getTextInputValue('question').trim();
    const { app, member } = await fetchApplicationMember(interaction, userId);
    if (!app || app.status !== 'submitted' || !member) return ephemeralReply(interaction, { content: 'Cette demande n’est plus disponible.' });
    const clarification = createClarification(config.guildId, userId, interaction.user.id, question);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`clarify_reply:${clarification.id}`).setLabel(t(app.language).reply).setStyle(ButtonStyle.Primary)
    );
    const embed = new EmbedBuilder().setTitle(t(app.language).clarificationTitle).setDescription(question);
    await member.send({ embeds: [embed], components: [row] });
    audit(config.guildId, 'clarification_requested', { userId, actorId: interaction.user.id, details: { clarificationId: clarification.id } });
    return interaction.reply({ content: 'Question envoyée au membre.', ephemeral: true });
  }
}

export async function handleClarificationButton(interaction) {
  const id = Number(interaction.customId.split(':')[1]);
  const clarification = getClarification(id);
  if (!clarification || clarification.user_id !== interaction.user.id || clarification.status !== 'pending') {
    return ephemeralReply(interaction, { content: 'Cette demande de précision n’est plus active.' });
  }
  const modal = new ModalBuilder().setCustomId(`clarify_reply_modal:${id}`).setTitle('Réponse');
  const input = new TextInputBuilder().setCustomId('answer').setLabel('Ta réponse').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1500);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return interaction.showModal(modal);
}

export async function handleClarificationReplyModal(interaction) {
  const id = Number(interaction.customId.split(':')[1]);
  const clarification = getClarification(id);
  if (!clarification || clarification.user_id !== interaction.user.id || clarification.status !== 'pending') {
    return ephemeralReply(interaction, { content: 'Cette demande de précision n’est plus active.' });
  }
  const answer = interaction.fields.getTextInputValue('answer').trim();
  answerClarification(id, answer);
  const channel = await interaction.client.channels.fetch(config.validationChannelId).catch(() => null);
  if (channel?.isTextBased()) {
    await channel.send({
      embeds: [new EmbedBuilder()
        .setTitle('💬 Précision reçue')
        .setDescription(`<@${interaction.user.id}> a répondu à une demande de précision.`)
        .addFields({ name: 'Question', value: clarification.question }, { name: 'Réponse', value: answer })]
    });
  }
  audit(config.guildId, 'clarification_answered', { userId: interaction.user.id, actorId: interaction.user.id, details: { clarificationId: id } });
  return interaction.reply({ content: 'Merci, ta réponse a été transmise aux modérateurs.', ephemeral: true });
}
