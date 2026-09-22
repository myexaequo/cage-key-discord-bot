import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { config } from './config.js';
import { allProfileRoleNames, roleNamesForApplication } from './profile-roles.js';

export const ROLE_NAMES = Object.freeze({
  pending: 'En attente',
  member: 'Membre',
  fr: 'FR',
  nl: 'NL',
  en: 'EN'
});

export async function ensureRoles(guild) {
  await guild.roles.fetch();
  const roles = { profileByName: new Map() };

  for (const [key, name] of Object.entries(ROLE_NAMES)) {
    let role = guild.roles.cache.find((r) => r.name === name);
    if (!role) {
      role = await guild.roles.create({ name, reason: 'Initialisation Cage & Key bot' });
      console.log(`[setup] rôle créé: ${name} (${role.id})`);
    } else {
      console.log(`[setup] rôle trouvé: ${name} (${role.id})`);
    }
    roles[key] = role;
  }

  // Crée tous les rôles de profil manquants. Les noms identiques entre
  // plusieurs langues sont dédupliqués automatiquement.
  for (const name of allProfileRoleNames()) {
    let role = guild.roles.cache.find((r) => r.name === name);
    if (!role) {
      role = await guild.roles.create({
        name,
        mentionable: false,
        reason: 'Rôle de profil Cage & Key'
      });
      console.log(`[setup] rôle profil créé: ${name} (${role.id})`);
    } else {
      console.log(`[setup] rôle profil trouvé: ${name} (${role.id})`);
    }
    roles.profileByName.set(name, role);
  }

  console.log(`[setup] ${roles.profileByName.size} rôles de profil disponibles.`);
  return roles;
}

export function isStaff(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const ids = [config.staff.moderatorRoleId, config.staff.adminRoleId, config.staff.ownerRoleId].filter(Boolean);
  if (ids.some((id) => member.roles.cache.has(id))) return true;
  return member.roles.cache.some((r) => r.name === 'Modérateur' || r.name === 'Administrateur' || r.name === 'Propriétaire');
}

export async function assignPending(member, roles) {
  if (!member.roles.cache.has(roles.pending.id)) await member.roles.add(roles.pending, 'Nouvelle demande Cage & Key');
}

export async function approveMember(member, roles, application) {
  const language = application.language;
  const languageRole = roles[language];

  const profileRoleNames = roleNamesForApplication(application);
  const profileRoles = profileRoleNames
    .map((name) => roles.profileByName.get(name))
    .filter(Boolean);

  const uniqueRoles = [...new Map(
    [roles.member, languageRole, ...profileRoles]
      .filter(Boolean)
      .map((role) => [role.id, role])
  ).values()];

  await member.roles.add(uniqueRoles, 'Demande Cage & Key acceptée');

  if (member.roles.cache.has(roles.pending.id)) {
    await member.roles.remove(roles.pending, 'Demande Cage & Key acceptée');
  }

  for (const lang of ['fr', 'nl', 'en']) {
    if (lang !== language && member.roles.cache.has(roles[lang].id)) {
      await member.roles.remove(roles[lang], 'Synchronisation de la langue Cage & Key');
    }
  }

  console.log(`[roles] ${member.user.tag}: ${profileRoleNames.join(', ')}`);
  return profileRoleNames;
}

export async function checkConfiguration(guild, roles) {
  const me = guild.members.me;
  const required = [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory];
  const missing = required.filter((p) => !me.permissions.has(p));
  if (missing.length) console.warn(`[setup] permissions bot manquantes: ${missing.map(String).join(', ')}`);

  const managedRoles = [
    roles.pending, roles.member, roles.fr, roles.nl, roles.en,
    ...roles.profileByName.values()
  ].filter(Boolean);
  const highestManaged = managedRoles.sort((a,b) => b.position-a.position)[0];
  if (highestManaged && me.roles.highest.position <= highestManaged.position) {
    console.warn(`[setup] le rôle du bot doit être placé au-dessus des rôles qu’il gère. Rôle le plus haut concerné: ${highestManaged.name}`);
  }

  for (const [lang, categoryId] of Object.entries(config.categories)) {
    const channel = guild.channels.cache.get(categoryId) ?? await guild.channels.fetch(categoryId).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildCategory) {
      console.warn(`[setup] catégorie ${lang.toUpperCase()} introuvable ou invalide: ${categoryId}`);
      continue;
    }
    const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
    const langOverwrite = channel.permissionOverwrites.cache.get(roles[lang].id);
    const everyoneDenied = everyoneOverwrite?.deny.has(PermissionFlagsBits.ViewChannel) ?? false;
    const languageAllowed = langOverwrite?.allow.has(PermissionFlagsBits.ViewChannel) ?? false;
    if (!everyoneDenied || !languageAllowed) {
      console.warn(`[setup] catégorie ${lang.toUpperCase()}: vérifie les permissions (refuser Voir le salon à @everyone et l’autoriser au rôle ${lang.toUpperCase()}).`);
    }
  }
}
