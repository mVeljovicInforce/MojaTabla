const CATEGORIES = [
  'obavestenje',
  'pomoc',
  'poklanjam_prodajem',
  'izgubljeno_nadjeno',
  'problem_u_kraju',
  'dogadjaj',
];

// Allowed lifetimes in days; 'unlimited' stores no expiration. The client never sends a timestamp.
const LIFETIMES = [1, 3, 7, 14, 30, 'unlimited'];
const DEFAULT_LIFETIME_DAYS = 7;

const LIMITS = { title: 120, body: 1500, houseNumber: 20, street: 100, comment: 1000 };

// Counts characters, not UTF-16 units.
const length = (s) => Array.from(s).length;

// Trim and collapse consecutive whitespace into a single space.
function cleanStreetName(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

// Case-insensitive comparison key. No Latin/Cyrillic transliteration.
function normalizeStreetName(value) {
  return cleanStreetName(value).toLowerCase();
}

// Returns { error } or { value }.
function validateStreet(input) {
  const name = cleanStreetName(input && input.name);
  if (!name) return { error: 'Naziv ulice je obavezan.' };
  if (length(name) > LIMITS.street) {
    return { error: `Naziv ulice može imati najviše ${LIMITS.street} karaktera.` };
  }
  return { value: { name, normalizedName: normalizeStreetName(name) } };
}

// Returns { error } or { value }.
function validatePost(input) {
  const data = input || {};
  const category = data.category;
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const body = typeof data.body === 'string' ? data.body.trim() : '';
  const houseNumber = typeof data.houseNumber === 'string' ? data.houseNumber.trim() : '';

  if (data.isImportant != null && typeof data.isImportant !== 'boolean') {
    return { error: 'Neispravna vrednost za oznaku važno.' };
  }

  if (data.lifetime != null && !LIFETIMES.includes(data.lifetime)) {
    return { error: 'Izaberite trajanje objave iz ponuđene liste.' };
  }

  if (!CATEGORIES.includes(category)) return { error: 'Izaberite kategoriju.' };
  if (!title) return { error: 'Naslov je obavezan.' };
  if (length(title) > LIMITS.title) {
    return { error: `Naslov može imati najviše ${LIMITS.title} karaktera.` };
  }
  if (!body) return { error: 'Tekst obaveštenja je obavezan.' };
  if (length(body) > LIMITS.body) {
    return { error: `Tekst može imati najviše ${LIMITS.body} karaktera.` };
  }
  if (length(houseNumber) > LIMITS.houseNumber) {
    return { error: `Broj može imati najviše ${LIMITS.houseNumber} karaktera.` };
  }

  const lifetime = data.lifetime == null ? DEFAULT_LIFETIME_DAYS : data.lifetime;
  const lifetimeDays = lifetime === 'unlimited' ? null : lifetime;

  return {
    value: { category, title, body, houseNumber: houseNumber || null, isImportant: data.isImportant === true, lifetimeDays },
  };
}

// Returns { error } or { value }.
function validateComment(input) {
  const body = input && typeof input.body === 'string' ? input.body.trim() : '';
  if (!body) return { error: 'Komentar je obavezan.' };
  if (length(body) > LIMITS.comment) {
    return { error: `Komentar može imati najviše ${LIMITS.comment} karaktera.` };
  }
  return { value: { body } };
}

module.exports = {
  CATEGORIES,
  LIMITS,
  normalizeStreetName,
  validateStreet,
  validatePost,
  validateComment,
};
