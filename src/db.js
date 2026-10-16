const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'moja-tabla.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));

// CREATE TABLE IF NOT EXISTS does not alter existing tables: add newer post columns to older databases.
const postColumns = db.prepare('PRAGMA table_info(post)').all().map((c) => c.name);
if (!postColumns.includes('is_important')) {
  db.exec('ALTER TABLE post ADD COLUMN is_important INTEGER NOT NULL DEFAULT 0 CHECK (is_important IN (0, 1))');
}
// Existing posts get NULL = no expiration.
if (!postColumns.includes('expires_at')) {
  db.exec('ALTER TABLE post ADD COLUMN expires_at TEXT');
}

module.exports = db;
