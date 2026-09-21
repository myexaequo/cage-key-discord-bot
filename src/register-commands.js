import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands.js';

export async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.token);
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
  console.log(`[commands] ${commands.length} commandes enregistrées sur le serveur ${config.guildId}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  registerCommands().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
