import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { config } from './config.js';
import { allProfileRoleNames, roleNamesForApplication, roleNamesForProfile } from './profile-roles.js';
import { getRoleMapping, setRoleMapping } from './db.js';

export const ROLE_NAMES = Object.freeze({
  pending: 'En attente',
  member: 'Membre',
  fr: 'FR',
  nl: 'NL',
  en: 'EN'
});

async function resolveManagedRole(guild, mappingKey, canonicalName, createOptions = {}) {
  const saved = getRoleMapping(guild.id, mappingKey);

  // Priorité absolue à l'ID sauvegardé : le rôle peut donc être renommé librement.
  if (saved?.role_id) {
    const byId = guild.roles.cache.get(saved.role_id)
      ?? await guild.roles.fetch(saved.role_id).catch(() => null);
    if (byId) {
      console.log(`[setup] rôle par ID: ${canonicalName} -> ${byId.name} (${byId.id})`);
      return byId;
    }
    console.warn(`[setup] rôle ID introuvable pour ${canonicalName}: ${saved.role_id}; recherche par nom.`);
  }

  // Première migration : retrouve le rôle existant à partir de son nom canonique.
  let role = guild.roles.cache.find((r) => r.name === canonicalName);
  if (!role) {
    role = await guild.roles.create({
      name: canonicalName,
      reason: createOptions.reason ?? 'Initialisation Cage & Key bot',
      mentionable: createOptions.mentionable ?? false
    });
    console.log(`[setup] rôle créé: ${canonicalName} (${role.id})`);
  } else {
    console.log(`[setup] rôle trouvé par nom: ${canonicalName} (${role.id})`);
  }

  setRoleMapping(guild.id, mappingKey, role.id, canonicalName);
  console.log(`[setup] ID mémorisé: ${mappingKey} -> ${role.id}`);
  return role;
}

export async function ensureRoles(guild) {
  await guild.roles.fetch();
  const roles = { profileByName: new Map() };

  for (const [key, name] of Object.entries(ROLE_NAMES)) {
    roles[key] = await resolveManagedRole(
      guild,
      `system:${key}`,
      name,
      { reason: 'Initialisation Cage & Key bot' }
    );
  }

  // Les libellés servent uniquement de clé logique interne.
  // Une fois l'ID mémorisé, le rôle peut être renommé (emoji, traduction, etc.).
  for (const name of allProfileRoleNames()) {
    const role = await resolveManagedRole(
      guild,
      `profile:${name}`,
      name,
      { reason: 'Rôle de profil Cage & Key', mentionable: false }
    );
    roles.profileByName.set(name, role);
  }

  console.log(`[setup] ${roles.profileByName.size} rôles de profil disponibles avec IDs persistants.`);
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


export async function syncExistingProfileRoles(guild, roles, profiles) {
  let synced = 0;
  let skipped = 0;

  for (const profile of profiles) {
    const member = await guild.members.fetch(profile.user_id).catch(() => null);
    if (!member) {
      skipped += 1;
      continue;
    }

    const languageRole = roles[profile.language];
    const profileRoleNames = roleNamesForProfile(profile);
    const profileRoles = profileRoleNames
      .map((name) => roles.profileByName.get(name))
      .filter(Boolean);

    const toAdd = [...new Map(
      [roles.member, languageRole, ...profileRoles]
        .filter(Boolean)
        .map((role) => [role.id, role])
    ).values()]
      .filter((role) => !member.roles.cache.has(role.id));

    if (toAdd.length) {
      await member.roles.add(toAdd, 'Synchronisation des profils Cage & Key existants');
    }

    if (member.roles.cache.has(roles.pending.id)) {
      await member.roles.remove(roles.pending, 'Profil Cage & Key déjà validé').catch(() => {});
    }

    synced += 1;
    console.log(`[roles] profil existant synchronisé: ${member.user.tag} -> ${profileRoleNames.join(', ')}`);
  }

  console.log(`[roles] synchronisation terminée: ${synced} profil(s), ${skipped} absent(s) du serveur.`);
  return { synced, skipped };
}
