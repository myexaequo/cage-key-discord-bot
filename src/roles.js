import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { config } from './config.js';
import { allProfileRoleNames, roleNamesForApplication, roleNamesForProfile, profileRoleDisplayName } from './profile-roles.js';
import { getRoleMapping, setRoleMapping } from './db.js';

export const ROLE_NAMES = Object.freeze({
  pending: 'En attente',
  member: 'Membre',
  fr: 'FR',
  nl: 'NL',
  en: 'EN'
});

const SYSTEM_ROLE_DISPLAY_NAMES = Object.freeze({
  pending: '⏳ En attente',
  member: '✅ Membre',
  fr: '🇫🇷 FR',
  nl: '🇳🇱 NL',
  en: '🇬🇧 EN'
});

async function resolveManagedRole(guild, mappingKey, canonicalName, createOptions = {}) {
  const saved = getRoleMapping(guild.id, mappingKey);
  const desiredName = createOptions.displayName ?? canonicalName;

  // Priorité absolue à l'ID sauvegardé.
  if (saved?.role_id) {
    const byId = guild.roles.cache.get(saved.role_id)
      ?? await guild.roles.fetch(saved.role_id).catch(() => null);
    if (byId) {
      if (byId.name !== desiredName && byId.editable) {
        await byId.setName(desiredName, 'Convention visuelle Cage & Key');
        console.log(`[setup] rôle renommé: ${canonicalName} -> ${desiredName} (${byId.id})`);
      }
      console.log(`[setup] rôle par ID: ${canonicalName} -> ${byId.name} (${byId.id})`);
      return byId;
    }
    console.warn(`[setup] rôle ID introuvable pour ${canonicalName}: ${saved.role_id}; recherche par nom.`);
  }

  // Migration initiale : accepte le nom canonique ou le nom déjà décoré.
  let role = guild.roles.cache.find((r) => r.name === canonicalName || r.name === desiredName);
  if (!role) {
    role = await guild.roles.create({
      name: desiredName,
      reason: createOptions.reason ?? 'Initialisation Cage & Key bot',
      mentionable: createOptions.mentionable ?? false
    });
    console.log(`[setup] rôle créé: ${desiredName} (${role.id})`);
  } else {
    if (role.name !== desiredName && role.editable) {
      await role.setName(desiredName, 'Convention visuelle Cage & Key');
      console.log(`[setup] rôle renommé: ${canonicalName} -> ${desiredName} (${role.id})`);
    } else {
      console.log(`[setup] rôle trouvé: ${role.name} (${role.id})`);
    }
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
      {
        reason: 'Initialisation Cage & Key bot',
        displayName: SYSTEM_ROLE_DISPLAY_NAMES[key] ?? name
      }
    );
  }

  // Les libellés servent uniquement de clé logique interne.
  // Une fois l'ID mémorisé, le rôle peut être renommé (emoji, traduction, etc.).
  for (const name of allProfileRoleNames()) {
    const role = await resolveManagedRole(
      guild,
      `profile:${name}`,
      name,
      {
        reason: 'Rôle de profil Cage & Key',
        mentionable: false,
        displayName: profileRoleDisplayName(name)
      }
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
  const accessRoles = [roles.member, roles.fr, roles.nl, roles.en].filter(Boolean);
  const toRemove = accessRoles.filter((role) => member.roles.cache.has(role.id));
  if (toRemove.length) {
    await member.roles.remove(toRemove, 'Accès communautaire bloqué avant validation');
  }
  if (!member.roles.cache.has(roles.pending.id)) {
    await member.roles.add(roles.pending, 'Nouvelle demande Cage & Key');
  }
}

export async function approveMember(member, roles, application) {
  const selectedLanguages = Array.isArray(application.data?.server_languages) && application.data.server_languages.length
    ? application.data.server_languages
    : [application.language];
  const languageRoles = selectedLanguages.map((lang) => roles[lang]).filter(Boolean);

  const profileRoleNames = roleNamesForApplication(application);
  const profileRoles = profileRoleNames
    .map((name) => roles.profileByName.get(name))
    .filter(Boolean);

  const uniqueRoles = [...new Map(
    [roles.member, ...languageRoles, ...profileRoles]
      .filter(Boolean)
      .map((role) => [role.id, role])
  ).values()];

  await member.roles.add(uniqueRoles, 'Demande Cage & Key acceptée');

  if (member.roles.cache.has(roles.pending.id)) {
    await member.roles.remove(roles.pending, 'Demande Cage & Key acceptée');
  }

  for (const lang of ['fr', 'nl', 'en']) {
    if (!selectedLanguages.includes(lang) && member.roles.cache.has(roles[lang].id)) {
      await member.roles.remove(roles[lang], 'Synchronisation des langues Cage & Key');
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

    // Les catégories linguistiques restent invisibles tant qu'un rôle de langue
    // n'a pas été attribué après validation du profil.
    await channel.permissionOverwrites.edit(
      guild.roles.everyone,
      { ViewChannel: false },
      { reason: 'Accès Cage & Key réservé aux profils validés' }
    );

    await channel.permissionOverwrites.edit(
      roles[lang],
      { ViewChannel: true },
      { reason: 'Accès Cage & Key selon les langues choisies' }
    );

    for (const otherLang of ['fr', 'nl', 'en']) {
      if (otherLang === lang) continue;
      await channel.permissionOverwrites.edit(
        roles[otherLang],
        { ViewChannel: null },
        { reason: 'Isolation des catégories linguistiques Cage & Key' }
      );
    }

    console.log(`[setup] catégorie ${lang.toUpperCase()}: accès limité au rôle ${roles[lang].name} après validation.`);
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

    const selectedLanguages = Array.isArray(profile.server_languages) && profile.server_languages.length
      ? profile.server_languages
      : [profile.language];
    const languageRoles = selectedLanguages.map((lang) => roles[lang]).filter(Boolean);
    const profileRoleNames = roleNamesForProfile(profile);
    const profileRoles = profileRoleNames
      .map((name) => roles.profileByName.get(name))
      .filter(Boolean);

    const toAdd = [...new Map(
      [roles.member, ...languageRoles, ...profileRoles]
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
