// Idempotent development seed: safe to run more than once.
const db = require('../src/db');
const { normalizeStreetName } = require('../src/validation');

const CITY = 'Niš';
const STREETS = {
  'Obrenovićeva': [
    ['obavestenje', 'Radovi u broju 24 sutra', 'Iz broja 24 se unapred izvinjavamo komšijama. Sutra od 08:00 do 17:00 biće radova i buke.', '24'],
    ['izgubljeno_nadjeno', 'Nađen ključ', 'Nađen ključ sa plavom pločicom kod ulaza. Javite se ako je vaš.', '17'],
  ],
  'Knjaževačka': [
    ['pomoc', 'Pozajmica bušilice', 'Da li neko može da pozajmi bušilicu do vikenda? Vraćam isti dan kad završim.', '8a'],
    ['poklanjam_prodajem', 'Poklanjam dečji bicikl', 'Poklanjam dečji bicikl, odgovara uzrastu od 5 do 7 godina. Preuzimanje u toku popodneva.', null],
    ['problem_u_kraju', 'Pukla cev, nema vode', 'U našoj ulici je pukla cev i nema vode. Komunalno je obavešteno.', null],
  ],
  'Вожда Карађорђа': [
    ['izgubljeno_nadjeno', 'Да ли је неко видео белог пса?', 'Бели пас, мање расе, нестао јутрос. Ако га видите, јавите се.', '3/2'],
  ],
};

db.prepare('INSERT OR IGNORE INTO city (name) VALUES (?)').run(CITY);
const cityId = db.prepare('SELECT id FROM city WHERE name = ?').get(CITY).id;

const insertStreet = db.prepare(
  'INSERT OR IGNORE INTO street (city_id, name, normalized_name) VALUES (?, ?, ?)'
);
const findStreet = db.prepare('SELECT id FROM street WHERE city_id = ? AND normalized_name = ?');
const countPosts = db.prepare('SELECT COUNT(*) AS n FROM post WHERE street_id = ?');
const insertPost = db.prepare(
  'INSERT INTO post (street_id, category, title, body, house_number) VALUES (?, ?, ?, ?, ?)'
);

for (const [name, posts] of Object.entries(STREETS)) {
  const normalized = normalizeStreetName(name);
  insertStreet.run(cityId, name, normalized);
  const streetId = findStreet.get(cityId, normalized).id;
  if (countPosts.get(streetId).n === 0) {
    for (const post of posts) insertPost.run(streetId, ...post);
  }
}

console.log('Seed gotov.');
