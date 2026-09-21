import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(config.dataDir, { recursive: true });
const db = new DatabaseSync(config.dbPath);
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS applications (
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'language',
  language TEXT,
  data_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  validation_message_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (guild_id, user_id)
) STRICT;

CREATE TABLE IF NOT EXISTS profiles (
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  language TEXT NOT NULL,
  age_band TEXT NOT NULL,
  orientation TEXT NOT NULL,
  gender TEXT NOT NULL,
  chastity_role TEXT NOT NULL,
  devices_json TEXT NOT NULL,
  keys_json TEXT NOT NULL,
  kinks_json TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  approved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (guild_id, user_id)
) STRICT;

CREATE TABLE IF NOT EXISTS clarifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  answered_at TEXT
) STRICT;

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT,
  actor_id TEXT,
  event TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
) STRICT;
`);

const now = () => new Date().toISOString();
const parseJson = (value, fallback = {}) => {
  try { return JSON.parse(value ?? '') ?? fallback; } catch { return fallback; }
};

export function getApplication(guildId, userId) {
  const row = db.prepare('SELECT * FROM applications WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (!row) return null;
  return { ...row, data: parseJson(row.data_json, {}) };
}

export function upsertApplication(guildId, userId, patch = {}) {
  const existing = getApplication(guildId, userId);
  const data = patch.data ?? existing?.data ?? {};
  const record = {
    stage: patch.stage ?? existing?.stage ?? 'language',
    language: patch.language ?? existing?.language ?? null,
    status: patch.status ?? existing?.status ?? 'draft',
    validationMessageId: patch.validationMessageId ?? existing?.validation_message_id ?? null,
    dataJson: JSON.stringify(data),
    createdAt: existing?.created_at ?? now(),
    updatedAt: now()
  };
  db.prepare(`
    INSERT INTO applications (guild_id,user_id,stage,language,data_json,status,validation_message_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(guild_id,user_id) DO UPDATE SET
      stage=excluded.stage, language=excluded.language, data_json=excluded.data_json,
      status=excluded.status, validation_message_id=excluded.validation_message_id, updated_at=excluded.updated_at
  `).run(guildId,userId,record.stage,record.language,record.dataJson,record.status,record.validationMessageId,record.createdAt,record.updatedAt);
  return getApplication(guildId, userId);
}

export function deleteApplication(guildId, userId) {
  db.prepare('DELETE FROM applications WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
}

export function saveProfileFromApplication(application, approvedBy) {
  const d = application.data;
  const ts = now();
  db.prepare(`
    INSERT INTO profiles (guild_id,user_id,language,age_band,orientation,gender,chastity_role,devices_json,keys_json,kinks_json,approved_by,approved_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(guild_id,user_id) DO UPDATE SET
      language=excluded.language, age_band=excluded.age_band, orientation=excluded.orientation,
      gender=excluded.gender, chastity_role=excluded.chastity_role, devices_json=excluded.devices_json,
      keys_json=excluded.keys_json, kinks_json=excluded.kinks_json, approved_by=excluded.approved_by,
      approved_at=excluded.approved_at, updated_at=excluded.updated_at
  `).run(
    application.guild_id, application.user_id, application.language, d.age, d.orientation, d.gender, d.role,
    JSON.stringify(d.devices), JSON.stringify(d.keys), JSON.stringify(d.kinks), approvedBy, ts, ts
  );
  return getProfile(application.guild_id, application.user_id);
}

export function getProfile(guildId, userId) {
  const row = db.prepare('SELECT * FROM profiles WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (!row) return null;
  return {
    ...row,
    devices: parseJson(row.devices_json, []),
    keys: parseJson(row.keys_json, []),
    kinks: parseJson(row.kinks_json, [])
  };
}

export function createClarification(guildId, userId, requestedBy, question) {
  const result = db.prepare(`INSERT INTO clarifications (guild_id,user_id,requested_by,question,created_at) VALUES (?,?,?,?,?)`)
    .run(guildId, userId, requestedBy, question, now());
  return getClarification(Number(result.lastInsertRowid));
}

export function getClarification(id) {
  return db.prepare('SELECT * FROM clarifications WHERE id = ?').get(id) ?? null;
}

export function answerClarification(id, answer) {
  db.prepare(`UPDATE clarifications SET answer = ?, status = 'answered', answered_at = ? WHERE id = ?`).run(answer, now(), id);
  return getClarification(id);
}

export function audit(guildId, event, { userId = null, actorId = null, details = {} } = {}) {
  db.prepare('INSERT INTO audit_log (guild_id,user_id,actor_id,event,details_json,created_at) VALUES (?,?,?,?,?,?)')
    .run(guildId,userId,actorId,event,JSON.stringify(details),now());
}

export function listRecentAudit(limit = 50) {
  return db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?').all(limit);
}

export { db };
