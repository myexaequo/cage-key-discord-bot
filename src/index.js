import http from 'node:http';
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { ensureRoles, checkConfiguration, syncExistingProfileRoles } from './roles.js';
import { listProfiles } from './db.js';
import { registerCommands } from './register-commands.js';
import {
  sendWelcomeDM,
  startOnboarding,
  handleOnboardingInteraction,
  handleProfileCommand,
  handleProfileContextMenu,
  handleValidationButton,
  handleModeratorModal,
  handleClarificationButton,
  handleClarificationReplyModal
} from './workflow.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel]
});

let roles;

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[bot] connecté comme ${readyClient.user.tag}`);

  // Enregistrer les slash commands indépendamment de la configuration des rôles.
  // Ainsi /commencer et /profil restent disponibles même si un rôle ou une permission
  // du serveur doit encore être corrigé.
  if (config.registerCommandsOnStart) {
    try {
      await registerCommands();
    } catch (error) {
      console.error('[commands] échec de l’enregistrement des commandes', error);
    }
  }

  try {
    const guild = await readyClient.guilds.fetch(config.guildId);
    const botMember = await guild.members.fetchMe();

    // Le changement de surnom est purement cosmétique et ne doit jamais bloquer
    // l'initialisation du bot si Discord refuse la permission.
    try {
      if (botMember.nickname !== 'C&K Bot') {
        await botMember.setNickname('C&K Bot', 'Nom du bot Cage & Key');
        console.log('[setup] surnom du bot défini sur C&K Bot');
      }
    } catch (nicknameError) {
      console.warn('[setup] impossible de changer le surnom du bot; poursuite du démarrage', nicknameError);
    }

    roles = await ensureRoles(guild);
    await checkConfiguration(guild, roles);
    await syncExistingProfileRoles(guild, roles, listProfiles(config.guildId));
  } catch (error) {
    console.error('[setup] erreur de configuration du serveur', error);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.guild.id !== config.guildId || member.user.bot) return;
  try { await sendWelcomeDM(member, roles); } catch (error) { console.error('[join]', error); }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'commencer') return startOnboarding(interaction, roles);
      if (interaction.commandName === 'profil') return handleProfileCommand(interaction);
    }

    if (interaction.isUserContextMenuCommand() && interaction.commandName === 'Profil Cage & Key') {
      return handleProfileContextMenu(interaction);
    }

    if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('onboard:')) {
      return handleOnboardingInteraction(interaction);
    }

    if (interaction.isButton() && interaction.customId.startsWith('validation:')) {
      return handleValidationButton(interaction, roles);
    }

    if (interaction.isModalSubmit() && (interaction.customId.startsWith('reject_modal:') || interaction.customId.startsWith('clarify_modal:'))) {
      return handleModeratorModal(interaction);
    }

    if (interaction.isButton() && interaction.customId.startsWith('clarify_reply:')) {
      return handleClarificationButton(interaction);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('clarify_reply_modal:')) {
      return handleClarificationReplyModal(interaction);
    }
  } catch (error) {
    console.error('[interaction]', error);
    const payload = { content: 'Une erreur est survenue. Réessaie ou contacte un modérateur.', ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(() => {});
      else await interaction.reply(payload).catch(() => {});
    }
  }
});

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(client.isReady() ? 200 : 503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: client.isReady(), bot: client.user?.tag ?? null }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('C&K Bot');
}).listen(config.port, '0.0.0.0', () => console.log(`[http] healthcheck sur :${config.port}`));

client.login(config.token);
