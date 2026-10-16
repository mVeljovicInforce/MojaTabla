const db = require('./db');

const POST_COLUMNS = 'id, category, title, body, house_number AS houseNumber, is_important AS isImportant, expires_at AS expiresAt, created_at AS createdAt';

// SQLite stores flags as 0/1; the API exposes booleans.
const toPost = (row) =>
  row && {
    ...row,
    isImportant: row.isImportant === 1,
    ...('isExpired' in row && { isExpired: row.isExpired === 1 }),
  };

// Timestamps are UTC 'YYYY-MM-DD HH:MM:SS' (same format as created_at), so they compare as strings.
// Expiration is enforced at read time; expired rows are never deleted.
const ACTIVE_POST = "(expires_at IS NULL OR expires_at > datetime('now'))";

function listCities() {
  return db.prepare('SELECT id, name FROM city ORDER BY name').all();
}

function getCity(id) {
  return db.prepare('SELECT id, name FROM city WHERE id = ?').get(id);
}

function listStreets(cityId) {
  return db
    .prepare('SELECT id, city_id AS cityId, name FROM street WHERE city_id = ? ORDER BY name COLLATE NOCASE')
    .all(cityId);
}

function getStreet(id) {
  return db
    .prepare(
      `SELECT street.id, street.name, street.city_id AS cityId, city.name AS cityName
       FROM street JOIN city ON city.id = street.city_id
       WHERE street.id = ?`
    )
    .get(id);
}

function findStreetByNormalizedName(cityId, normalizedName) {
  return db
    .prepare('SELECT id, city_id AS cityId, name FROM street WHERE city_id = ? AND normalized_name = ?')
    .get(cityId, normalizedName);
}

function createStreet(cityId, name, normalizedName) {
  const result = db
    .prepare('INSERT INTO street (city_id, name, normalized_name) VALUES (?, ?, ?)')
    .run(cityId, name, normalizedName);
  return { id: Number(result.lastInsertRowid), cityId, name };
}

function listPosts(streetId) {
  return db
    .prepare(
      `SELECT ${POST_COLUMNS},
              (SELECT COUNT(*) FROM comment WHERE comment.post_id = post.id) AS commentCount
       FROM post WHERE street_id = ? AND ${ACTIVE_POST} ORDER BY is_important DESC, created_at DESC, id DESC`
    )
    .all(streetId)
    .map(toPost);
}

function createPost(streetId, { category, title, body, houseNumber, isImportant, lifetimeDays }) {
  // datetime('now', NULL) is NULL, so a null modifier stores no expiration.
  const modifier = lifetimeDays ? `+${lifetimeDays} days` : null;
  const result = db
    .prepare(
      `INSERT INTO post (street_id, category, title, body, house_number, is_important, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))`
    )
    .run(streetId, category, title, body, houseNumber, isImportant ? 1 : 0, modifier);
  return toPost(db.prepare(`SELECT ${POST_COLUMNS} FROM post WHERE id = ?`).get(result.lastInsertRowid));
}

function getPost(id) {
  const row = db
    .prepare(
      `SELECT post.id, post.category, post.title, post.body, post.house_number AS houseNumber, post.is_important AS isImportant,
              post.expires_at AS expiresAt,
              (post.expires_at IS NOT NULL AND post.expires_at <= datetime('now')) AS isExpired,
              post.created_at AS createdAt, street.id AS streetId, street.name AS streetName,
              city.name AS cityName
       FROM post
       JOIN street ON street.id = post.street_id
       JOIN city ON city.id = street.city_id
       WHERE post.id = ?`
    )
    .get(id);
  return toPost(row);
}

const COMMENT_COLUMNS = 'id, body, created_at AS createdAt';

// Oldest first, so the conversation reads top to bottom.
function listComments(postId) {
  return db
    .prepare(`SELECT ${COMMENT_COLUMNS} FROM comment WHERE post_id = ? ORDER BY created_at ASC, id ASC`)
    .all(postId);
}

function createComment(postId, { body }) {
  const result = db.prepare('INSERT INTO comment (post_id, body) VALUES (?, ?)').run(postId, body);
  return db.prepare(`SELECT ${COMMENT_COLUMNS} FROM comment WHERE id = ?`).get(result.lastInsertRowid);
}

module.exports = {
  listCities,
  getCity,
  listStreets,
  getStreet,
  findStreetByNormalizedName,
  createStreet,
  listPosts,
  createPost,
  getPost,
  listComments,
  createComment,
};
