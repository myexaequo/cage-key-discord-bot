import { config } from './config.js';

export async function sendLog(client, content) {
  if (!config.logChannelId) return;
  const channel = client.channels.cache.get(config.logChannelId) ?? await client.channels.fetch(config.logChannelId).catch(() => null);
  if (channel?.isTextBased()) await channel.send({ content }).catch(() => {});
}
