import path from 'node:path';

function env(name, { required = false, fallback = '' } = {}) {
  const value = process.env[name] ?? fallback;
  if (required && !value) throw new Error(`Variable d'environnement manquante: ${name}`);
  return value;
}

export const config = {
  token: env('DISCORD_TOKEN', { required: true }),
  clientId: env('CLIENT_ID', { required: true }),
  guildId: env('GUILD_ID', { required: true }),
  validationChannelId: env('VALIDATION_CHANNEL_ID', { required: true }),
  logChannelId: env('LOG_CHANNEL_ID'),
  categories: {
    fr: env('FR_CATEGORY_ID', { required: true }),
    nl: env('NL_CATEGORY_ID', { required: true }),
    en: env('EN_CATEGORY_ID', { required: true })
  },
  staff: {
    moderatorRoleId: env('MODERATOR_ROLE_ID'),
    adminRoleId: env('ADMIN_ROLE_ID'),
    ownerRoleId: env('OWNER_ROLE_ID')
  },
  dataDir: env('DATA_DIR', { fallback: './data' }),
  dbPath: path.join(env('DATA_DIR', { fallback: './data' }), 'cage-key.sqlite'),
  port: Number(env('PORT', { fallback: '3000' })),
  registerCommandsOnStart: env('REGISTER_COMMANDS_ON_START', { fallback: 'true' }).toLowerCase() === 'true'
};
