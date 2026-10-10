import { ChannelType, EmbedBuilder } from 'discord.js';
import { config } from './config.js';
import { getBotSetting, setBotSetting, setRulesAccepted, revokeRulesAcceptance, audit } from './db.js';

const RULES_MESSAGE_KEY = 'rules_message_id';
const RULES_CHANNEL_KEY = 'rules_channel_id';
const ACCEPT_EMOJI = '👍';

function normalizeName(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function resolveRulesChannel(guild) {
  if (config.rulesChannelId) {
    const configured = guild.channels.cache.get(config.rulesChannelId)
      ?? await guild.channels.fetch(config.rulesChannelId).catch(() => null);
    if (configured?.isTextBased()) return configured;
    console.warn(`[rules] RULES_CHANNEL_ID invalide ou inaccessible: ${config.rulesChannelId}`);
  }

  await guild.channels.fetch();
  const preferredNames = new Set(['reglement', 'rules', 'regels']);
  const found = guild.channels.cache.find((channel) =>
    channel.type === ChannelType.GuildText &&
    preferredNames.has(normalizeName(channel.name))
  );
  return found ?? null;
}

export function rulesMessagePayload() {
  const embed = new EmbedBuilder()
    .setTitle('📜 Rules Checked')
    .setDescription([
      '**🇫🇷 Français**',
      'Après avoir lu le règlement du serveur, clique sur 👍 ci-dessous pour confirmer que tu l’acceptes.',
      '',
      '**🇳🇱 Nederlands**',
      'Nadat je de serverregels hebt gelezen, klik je hieronder op 👍 om te bevestigen dat je ze aanvaardt.',
      '',
      '**🇬🇧 English**',
      'After reading the server rules, click 👍 below to confirm that you accept them.',
      '',
      '_Si tu retires ta réaction, ton statut Rules Checked sera retiré._',
      '_Als je je reactie verwijdert, wordt je Rules Checked-status verwijderd._',
      '_If you remove your reaction, your Rules Checked status will be removed._'
    ].join('\n'));
  return { embeds: [embed] };
}

export async function ensureRulesMessage(guild, roles) {
  const channel = await resolveRulesChannel(guild);
  if (!channel) {
    console.warn('[rules] aucun salon #règlement / #rules / #regels trouvé. Configure RULES_CHANNEL_ID.');
    return null;
  }

  let message = null;
  const storedMessageId = getBotSetting(guild.id, RULES_MESSAGE_KEY);
  const storedChannelId = getBotSetting(guild.id, RULES_CHANNEL_KEY);

  if (storedMessageId && (!storedChannelId || storedChannelId === channel.id)) {
    message = await channel.messages.fetch(storedMessageId).catch(() => null);
  }

  let reaction = null;
  if (!message) {
    message = await channel.send(rulesMessagePayload());
    reaction = await message.react(ACCEPT_EMOJI);
    setBotSetting(guild.id, RULES_MESSAGE_KEY, message.id);
    setBotSetting(guild.id, RULES_CHANNEL_KEY, channel.id);
    console.log(`[rules] message d’acceptation publié dans #${channel.name} (${message.id})`);
  } else {
    reaction = message.reactions.resolve(ACCEPT_EMOJI);
    if (!reaction) reaction = await message.react(ACCEPT_EMOJI).catch(() => null);
    console.log(`[rules] message d’acceptation retrouvé dans #${channel.name} (${message.id})`);
  }

  // Synchronise les personnes ayant déjà réagi, utile après redémarrage ou migration.
  if (reaction) {
    const users = await reaction.users.fetch().catch(() => null);
    if (users) {
      for (const user of users.values()) {
        if (user.bot) continue;
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) continue;
        if (!member.roles.cache.has(roles.rulesChecked.id)) {
          await member.roles.add(roles.rulesChecked, 'Règlement accepté via 👍').catch(() => {});
        }
        setRulesAccepted(guild.id, user.id);
      }
    }
  }

  return message;
}

async function isRulesReaction(reaction) {
  if (reaction.partial) {
    await reaction.fetch().catch(() => null);
  }
  if (reaction.emoji.name !== ACCEPT_EMOJI) return false;
  const guild = reaction.message.guild;
  if (!guild || guild.id !== config.guildId) return false;
  const expectedMessageId = getBotSetting(guild.id, RULES_MESSAGE_KEY);
  return Boolean(expectedMessageId && reaction.message.id === expectedMessageId);
}

export async function handleRulesReactionAdd(reaction, user, roles) {
  if (user.bot || !(await isRulesReaction(reaction))) return;
  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  if (!member.roles.cache.has(roles.rulesChecked.id)) {
    await member.roles.add(roles.rulesChecked, 'Règlement accepté via 👍');
  }
  setRulesAccepted(guild.id, user.id);
  audit(guild.id, 'rules_accepted', { userId: user.id });
}

export async function handleRulesReactionRemove(reaction, user, roles) {
  if (user.bot || !(await isRulesReaction(reaction))) return;
  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  if (member.roles.cache.has(roles.rulesChecked.id)) {
    await member.roles.remove(roles.rulesChecked, 'Réaction 👍 retirée du règlement').catch(() => {});
  }
  revokeRulesAcceptance(guild.id, user.id);
  audit(guild.id, 'rules_acceptance_revoked', { userId: user.id });
}
